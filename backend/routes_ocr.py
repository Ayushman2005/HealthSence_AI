import io
import os
import re
import json
import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel

from config import GROQ_API_KEY, GROQ_MODEL
from auth import get_auth_token
from database import log_audit_event

logger = logging.getLogger("ocr_routes")
router = APIRouter()

class TextParseRequest(BaseModel):
    raw_text: str

def clean_extracted_biomarkers(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize and clamp extracted biomarkers to valid physiological ranges."""
    cleaned = {}
    
    # Name
    if data.get('name') and isinstance(data['name'], str) and data['name'].strip():
        cleaned['name'] = data['name'].strip()[:60]
        
    # Age (1 - 120)
    if data.get('age') is not None:
        try:
            val = int(float(data['age']))
            if 1 <= val <= 120:
                cleaned['age'] = val
        except (ValueError, TypeError):
            pass

    # Gender ('male' or 'female')
    if data.get('gender') and isinstance(data['gender'], str):
        g = data['gender'].strip().lower()
        if g in ['male', 'm']:
            cleaned['gender'] = 'male'
        elif g in ['female', 'f']:
            cleaned['gender'] = 'female'

    # Height (50 - 260 cm)
    if data.get('height') is not None:
        try:
            val = round(float(data['height']), 1)
            # If provided in inches or meters, convert
            if 1.0 <= val <= 2.6: # meters
                val = round(val * 100, 1)
            elif 36 <= val <= 96: # inches
                val = round(val * 2.54, 1)
            if 50 <= val <= 260:
                cleaned['height'] = val
        except (ValueError, TypeError):
            pass

    # Weight (20 - 350 kg)
    if data.get('weight') is not None:
        try:
            val = round(float(data['weight']), 1)
            # If in pounds (> 220 and seems high)
            if 70 <= val <= 600 and data.get('weightUnit', '').lower() in ['lb', 'lbs', 'pound']:
                val = round(val * 0.453592, 1)
            if 20 <= val <= 350:
                cleaned['weight'] = val
        except (ValueError, TypeError):
            pass

    # Blood Pressure Systolic (60 - 260 mmHg)
    if data.get('bpSystolic') is not None:
        try:
            val = int(float(data['bpSystolic']))
            if 60 <= val <= 260:
                cleaned['bpSystolic'] = val
        except (ValueError, TypeError):
            pass

    # Blood Pressure Diastolic (30 - 160 mmHg)
    if data.get('bpDiastolic') is not None:
        try:
            val = int(float(data['bpDiastolic']))
            if 30 <= val <= 160:
                cleaned['bpDiastolic'] = val
        except (ValueError, TypeError):
            pass

    # Total Cholesterol (70 - 550 mg/dL)
    if data.get('cholesterol') is not None:
        try:
            val = int(float(data['cholesterol']))
            if 70 <= val <= 550:
                cleaned['cholesterol'] = val
        except (ValueError, TypeError):
            pass

    # Fasting Glucose (40 - 500 mg/dL)
    if data.get('glucose') is not None:
        try:
            val = int(float(data['glucose']))
            # If in mmol/L (< 25)
            if 2.5 <= val <= 30.0:
                val = int(round(val * 18.0182))
            if 40 <= val <= 500:
                cleaned['glucose'] = val
        except (ValueError, TypeError):
            pass

    # Fasting Insulin (1 - 250 uIU/mL)
    if data.get('insulin') is not None:
        try:
            val = round(float(data['insulin']), 1)
            if 1 <= val <= 250:
                cleaned['insulin'] = val
        except (ValueError, TypeError):
            pass

    # Resting Heart Rate (35 - 220 bpm)
    if data.get('heartRate') is not None:
        try:
            val = int(float(data['heartRate']))
            if 35 <= val <= 220:
                cleaned['heartRate'] = val
        except (ValueError, TypeError):
            pass

    # Sleep Duration (1 - 18 hours)
    if data.get('sleepDuration') is not None:
        try:
            val = round(float(data['sleepDuration']), 1)
            if 1 <= val <= 18:
                cleaned['sleepDuration'] = val
        except (ValueError, TypeError):
            pass

    # HDL Cholesterol (15 - 150 mg/dL)
    if data.get('hdl') is not None:
        try:
            val = int(float(data['hdl']))
            if 15 <= val <= 150:
                cleaned['hdl'] = val
        except (ValueError, TypeError):
            pass

    # LDL Cholesterol (20 - 400 mg/dL)
    if data.get('ldl') is not None:
        try:
            val = int(float(data['ldl']))
            if 20 <= val <= 400:
                cleaned['ldl'] = val
        except (ValueError, TypeError):
            pass

    # HbA1c (3.5 - 18.0 %)
    if data.get('hba1c') is not None:
        try:
            val = round(float(data['hba1c']), 1)
            if 3.5 <= val <= 18.0:
                cleaned['hba1c'] = val
        except (ValueError, TypeError):
            pass

    # Smoking ('yes' or 'no')
    if data.get('smoking') is not None:
        smk = str(data['smoking']).strip().lower()
        if smk in ['yes', 'true', 'current', 'smoker', 'daily']:
            cleaned['smoking'] = 'yes'
        elif smk in ['no', 'false', 'non-smoker', 'never', 'former']:
            cleaned['smoking'] = 'no'

    return cleaned

def regex_extract_biomarkers(text: str) -> Dict[str, Any]:
    """Clinical heuristic regex fallback to parse laboratory text."""
    found = {}
    lower = text.lower()

    # Blood Pressure (e.g., 120/80 or BP: 135 / 85)
    bp_match = re.search(r'(?:bp|blood\s+pressure|pressure)?[^\d]*?(\d{2,3})\s*[/|]\s*(\d{2,3})\s*(?:mmhg)?', lower)
    if bp_match:
        try:
            sbp = int(bp_match.group(1))
            dbp = int(bp_match.group(2))
            if 70 <= sbp <= 250 and 40 <= dbp <= 150:
                found['bpSystolic'] = sbp
                found['bpDiastolic'] = dbp
        except (ValueError, IndexError):
            pass

    # Total Cholesterol
    chol_match = re.search(r'(?:total\s+cholesterol|serum\s+cholesterol|cholesterol)[^\d]*?(\d{2,3})\s*(?:mg/dl)?', lower)
    if chol_match:
        try:
            found['cholesterol'] = int(chol_match.group(1))
        except ValueError:
            pass

    # Fasting Blood Glucose
    glu_match = re.search(r'(?:fasting\s+blood\s+glucose|fasting\s+glucose|blood\s+sugar|glucose|fbs)[^\d]*?(\d{2,3})\s*(?:mg/dl)?', lower)
    if glu_match:
        try:
            found['glucose'] = int(glu_match.group(1))
        except ValueError:
            pass

    # Fasting Serum Insulin
    ins_match = re.search(r'(?:fasting\s+insulin|serum\s+insulin|insulin)[^\d]*?(\d+(?:\.\d+)?)\s*(?:[uµ]iu/ml)?', lower)
    if ins_match:
        try:
            found['insulin'] = float(ins_match.group(1))
        except ValueError:
            pass

    # Heart Rate / Pulse
    hr_match = re.search(r'(?:heart\s+rate|resting\s+pulse|pulse\s+rate|pulse)[^\d]*?(\d{2,3})\s*(?:bpm)?', lower)
    if hr_match:
        try:
            found['heartRate'] = int(hr_match.group(1))
        except ValueError:
            pass

    # HDL Cholesterol
    hdl_match = re.search(r'(?:hdl\s+cholesterol|hdl-c|hdl)[^\d]*?(\d{2,3})\s*(?:mg/dl)?', lower)
    if hdl_match:
        try:
            found['hdl'] = int(hdl_match.group(1))
        except ValueError:
            pass

    # LDL Cholesterol
    ldl_match = re.search(r'(?:ldl\s+cholesterol|ldl-c|ldl)[^\d]*?(\d{2,3})\s*(?:mg/dl)?', lower)
    if ldl_match:
        try:
            found['ldl'] = int(ldl_match.group(1))
        except ValueError:
            pass

    # HbA1c
    hba1c_match = re.search(r'(?:hba1c|glycated\s+hemoglobin|hemoglobin\s+a1c)[^\d]*?(\d+(?:\.\d+)?)\s*%', lower)
    if hba1c_match:
        try:
            found['hba1c'] = float(hba1c_match.group(1))
        except ValueError:
            pass

    # Age
    age_match = re.search(r'(?:age|years\s+old|yrs)[^\d]*?(\d{1,3})', lower)
    if age_match:
        try:
            a = int(age_match.group(1))
            if 10 <= a <= 110:
                found['age'] = a
        except ValueError:
            pass

    # Gender
    if re.search(r'\b(female|woman)\b', lower):
        found['gender'] = 'female'
    elif re.search(r'\b(male|man)\b', lower):
        found['gender'] = 'male'

    # Height & Weight
    ht_match = re.search(r'(?:height|ht)[^\d]*?(\d{2,3}(?:\.\d+)?)\s*(?:cm)?', lower)
    if ht_match:
        try:
            found['height'] = float(ht_match.group(1))
        except ValueError:
            pass

    wt_match = re.search(r'(?:weight|wt)[^\d]*?(\d{2,3}(?:\.\d+)?)\s*(?:kg)?', lower)
    if wt_match:
        try:
            found['weight'] = float(wt_match.group(1))
        except ValueError:
            pass

    # Patient Name
    name_match = re.search(r'(?:patient\s*name|name)[^\w]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})', text)
    if name_match:
        found['name'] = name_match.group(1).strip()

    return clean_extracted_biomarkers(found)

def ai_extract_biomarkers(text: str) -> Dict[str, Any]:
    """Extract clinical biomarkers using Groq Cloud AI with robust fallbacks."""
    api_key = GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        return {}

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        system_prompt = (
            "You are an elite board-certified Clinical Diagnostic Data Extraction AI. "
            "Analyze the laboratory report, lipid panel, or metabolic test text and extract patient vitals and lab numbers. "
            "Return strictly a valid JSON object matching this schema. Omit or use null for unmentioned metrics:\n"
            "{\n"
            "  \"name\": string or null,\n"
            "  \"age\": integer or null,\n"
            "  \"gender\": \"male\" or \"female\" or null,\n"
            "  \"height\": float (in cm) or null,\n"
            "  \"weight\": float (in kg) or null,\n"
            "  \"bpSystolic\": integer (mmHg) or null,\n"
            "  \"bpDiastolic\": integer (mmHg) or null,\n"
            "  \"cholesterol\": integer (Total Cholesterol mg/dL) or null,\n"
            "  \"glucose\": integer (Fasting Blood Glucose mg/dL) or null,\n"
            "  \"insulin\": float (Fasting Serum Insulin uIU/mL) or null,\n"
            "  \"heartRate\": integer (Resting Heart Rate / Pulse bpm) or null,\n"
            "  \"hdl\": integer (HDL-C mg/dL) or null,\n"
            "  \"ldl\": integer (LDL-C mg/dL) or null,\n"
            "  \"hba1c\": float (%) or null,\n"
            "  \"smoking\": \"yes\" or \"no\" or null\n"
            "}"
        )

        models_to_try = [
            GROQ_MODEL,
            "openai/gpt-oss-120b",
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-20b"
        ]
        
        seen = set()
        unique_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

        for model in unique_models:
            try:
                resp = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Extract all biomarkers from this clinical test text:\n\n{text[:4000]}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=600
                )
                raw_json = resp.choices[0].message.content
                parsed = json.loads(raw_json)
                cleaned = clean_extracted_biomarkers(parsed)
                if cleaned:
                    return cleaned
            except Exception as e:
                logger.warning(f"Groq extraction with model {model} failed: {e}")
                continue

    except Exception as e:
        logger.exception("AI Extraction failed")

    return {}

@router.post('/api/parse-lab-report')
async def parse_lab_report(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """
    Parses a diagnostic lab report from an uploaded PDF file or pasted clinical text.
    Extracts blood pressure, glucose, cholesterol, insulin, heart rate, lipid biomarkers.
    """
    try:
        extracted_text = ""
        source_name = "Pasted Lab Text"

        if file:
            source_name = file.filename or "Uploaded File"
            file_bytes = await file.read()
            
            # Check if file is PDF
            is_pdf = file.filename.lower().endswith('.pdf') or (file.content_type and 'pdf' in file.content_type.lower())
            
            if is_pdf:
                try:
                    import pypdf
                    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                    pages_text = []
                    for page in reader.pages:
                        t = page.extract_text()
                        if t:
                            pages_text.append(t)
                    extracted_text = "\n".join(pages_text).strip()
                except Exception as pdf_err:
                    logger.error(f"Failed to extract text from PDF: {pdf_err}")
            else:
                # Attempt to read as text / utf-8
                try:
                    extracted_text = file_bytes.decode('utf-8', errors='ignore').strip()
                except Exception:
                    pass

        if not extracted_text and raw_text:
            extracted_text = raw_text.strip()

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from provided document. Please upload a digital PDF lab report or paste the text content directly."
            )

        # 1. Run AI Clinical Parser
        ai_data = ai_extract_biomarkers(extracted_text)

        # 2. Run Regex Fallback Engine to fill any gaps or confirm
        regex_data = regex_extract_biomarkers(extracted_text)

        # Merge results (AI takes precedence, Regex fills missing)
        merged = {**regex_data, **ai_data}

        if not merged:
            return {
                "success": False,
                "message": "No recognized clinical biomarkers (BP, Glucose, Cholesterol, Insulin) could be found in the provided document.",
                "extracted": {},
                "fieldsFound": [],
                "textSnippet": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text
            }

        fields_found = list(merged.keys())
        confidence = min(98, 55 + (len(fields_found) * 5))

        # Log audit event
        log_audit_event(
            "LAB_REPORT_PARSE",
            "OCR_ENGINE",
            "user",
            f"Parsed {len(fields_found)} biomarkers from '{source_name}' (Fields: {', '.join(fields_found)})",
            status="SUCCESS"
        )

        return {
            "success": True,
            "source": source_name,
            "extracted": merged,
            "fieldsFound": fields_found,
            "totalBiomarkers": len(fields_found),
            "confidence": confidence,
            "summary": f"Identified {len(fields_found)} clinical indicators from '{source_name}', including " +
                       ", ".join([k for k in fields_found if k in ['bpSystolic', 'cholesterol', 'glucose', 'insulin', 'heartRate']][:4]),
            "textSnippet": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error parsing lab report")
        raise HTTPException(status_code=500, detail=f"Lab report analysis failed: {str(e)}")

@router.post('/api/parse-lab-text')
async def parse_lab_text_json(payload: TextParseRequest):
    """JSON-based endpoint to parse raw medical text or EHR clinical notes."""
    return await parse_lab_report(file=None, raw_text=payload.raw_text)
