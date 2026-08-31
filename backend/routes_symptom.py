from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class SymptomCheckRequest(BaseModel):
    symptoms: List[str] = []
    description: Optional[str] = ""
    duration: Optional[str] = "1-3 days"
    severity: Optional[str] = "Moderate"
    age: Optional[int] = 35
    gender: Optional[str] = "male"

@router.post('/api/check-symptom')
@router.post('/api/check-symptom/')
async def check_symptom(payload: SymptomCheckRequest):
    try:
        raw_symptoms = payload.symptoms or []
        user_desc = (payload.description or "").lower()
        duration = payload.duration or "1-3 days"
        severity = payload.severity or "Moderate"
        age = payload.age or 35
        gender = (payload.gender or "male").lower()

        # Combine tag list and user text description
        all_text = " ".join([str(s).lower() for s in raw_symptoms]) + " " + user_desc
        
        # Clinical Rule Engine & Matching Database
        matched_conditions = []
        red_flags = []
        home_remedies = []
        specialist = "General Physician / Family Doctor"
        triage_level = "ROUTINE" # "EMERGENCY", "URGENT", "ROUTINE"
        badge_color = "green"
        urgency_title = "Routine Clinical Care & Self-Monitoring"

        # Emergency Detection (Red Flags)
        has_chest_pain = any(k in all_text for k in ["chest pain", "angina", "chest pressure", "heart pain"])
        has_breathless = any(k in all_text for k in ["shortness of breath", "breathless", "dyspnea", "gasping", "trouble breathing"])
        has_stiff_neck = any(k in all_text for k in ["stiff neck", "neck rigidity"])
        has_confusion = any(k in all_text for k in ["confusion", "slurred speech", "fainting", "syncope"])
        has_severe = severity.lower() == "severe" or "severe" in all_text

        if has_chest_pain or (has_breathless and has_severe) or has_stiff_neck or has_confusion:
            triage_level = "EMERGENCY"
            badge_color = "red"
            urgency_title = "🚨 Emergency Care Required - Seek Immediate Medical Evaluation"
            specialist = "Cardiologist / Emergency Medicine (ER)"
            red_flags.append("Chest pressure radiating to left arm, neck, or jaw.")
            red_flags.append("Sudden acute difficulty breathing or oxygen saturation drop.")
            red_flags.append("Neurological deficit (confusion, loss of consciousness, slurred speech).")
        elif has_severe or "high fever" in all_text or "vomiting" in all_text or "blood" in all_text:
            triage_level = "URGENT"
            badge_color = "amber"
            urgency_title = "⚠️ Urgent Clinical Evaluation Recommended (Within 24 Hours)"
            specialist = "Specialist Physician / Urgent Care Clinic"
            red_flags.append("High persistent fever unresponsive to over-the-counter antipyretics.")
            red_flags.append("Inability to retain fluids due to continuous vomiting.")

        # Symptom Diagnostics Analysis
        # 1. Gastrointestinal / Stomach Ache
        if any(k in all_text for k in ["stomach", "abdomen", "abdominal", "belly", "gastric", "acidity", "heartburn", "nausea", "cramps"]):
            specialist = "Gastroenterologist"
            matched_conditions.append({
                "name": "Acute Gastritis / Dyspepsia (Indigestion)",
                "match_score": 88 if "gastric" in all_text or "acidity" in all_text or "stomach" in all_text else 74,
                "category": "Gastrointestinal",
                "description": "Inflammation of the protective stomach lining, often triggered by stress, spicy/fatty food, NSAID pain relievers, or acid reflux.",
                "action": "Adopt a mild bland diet (BRAT diet: Banana, Rice, Applesauce, Toast). Avoid spicy, fried, acidic foods and caffeinated beverages."
            })
            matched_conditions.append({
                "name": "Irritable Bowel Syndrome (IBS) / Functional Cramping",
                "match_score": 68,
                "category": "Gastrointestinal",
                "description": "Common gastrointestinal motility strain causing cramping, bloating, gas, and altered bowel habits.",
                "action": "Increase dietary soluble fiber, consume probiotic yogurt, and maintain adequate hydration."
            })
            home_remedies.append("Drink warm chamomile or peppermint tea to soothe abdominal spasms.")
            home_remedies.append("Stay well hydrated with electrolytes; eat small, light meals instead of heavy dinners.")
            home_remedies.append("Consider OTC antacids (e.g., Famotidine, Omeprazole) if experiencing acid heartburn.")

        # 2. Headache / Neurological
        if any(k in all_text for k in ["headache", "head pain", "migraine", "temple pain", "dizziness"]):
            if specialist == "General Physician / Family Doctor":
                specialist = "Neurologist"
            matched_conditions.append({
                "name": "Tension-Type Cephalgia (Tension Headache)",
                "match_score": 85 if "headache" in all_text else 70,
                "category": "Neurological",
                "description": "Dull, aching band-like pressure across temples and neck, typically induced by stress, neck strain, eye fatigue, or dehydration.",
                "action": "Rest in a quiet, darkened room. Apply a cool compress to forehead and neck muscles."
            })
            matched_conditions.append({
                "name": "Migraine without Aura",
                "match_score": 72 if "migraine" in all_text or "nausea" in all_text else 58,
                "category": "Neurological",
                "description": "Throbbing throbbing pain often localized to one side of the head, sometimes accompanied by sensitivity to light/sound.",
                "action": "Hydrate with water and electrolytes; take prescribed or OTC analgesics early at symptom onset."
            })
            home_remedies.append("Massage neck and shoulder muscles to release vascular tension.")
            home_remedies.append("Limit screen exposure (blue light) and maintain regular sleep patterns.")

        # 3. Fever / Chills
        if any(k in all_text for k in ["fever", "chills", "temperature", "pyrexia", "body heat"]):
            if specialist == "General Physician / Family Doctor":
                specialist = "General Physician / Infectious Disease"
            matched_conditions.append({
                "name": "Viral Febrile Illness / Seasonal Influenza",
                "match_score": 90,
                "category": "Infectious Systemic",
                "description": "Acute immune response to viral pathogen causing elevated body temperature, generalized malaise, and shivering.",
                "action": "Take OTC antipyretics (Paracetamol / Acetaminophen 500mg) as recommended by physician. Get continuous bed rest."
            })
            home_remedies.append("Apply lukewarm sponge cloths to forehead and armpits.")
            home_remedies.append("Drink plenty of oral rehydration fluids, broths, and water to prevent dehydration.")

        # 4. Chest Pain / Cardiovascular
        if has_chest_pain:
            matched_conditions.append({
                "name": "Cardiovascular Strain / Angina Pectoris Risk",
                "match_score": 92,
                "category": "Cardiovascular",
                "description": "Temporary reduction of blood flow to myocardial heart tissue. Requires immediate clinical triage.",
                "action": "Seek immediate emergency cardiac evaluation. Stop all physical activity and sit upright."
            })
            matched_conditions.append({
                "name": "Gastroesophageal Reflux Disease (GERD) / Esophageal Spasm",
                "match_score": 65,
                "category": "Gastrointestinal / Musculoskeletal",
                "description": "Stomach acid backing up into the esophagus causing burning substernal chest discomfort mimicking angina.",
                "action": "Remain seated upright after eating; take antacids."
            })

        # 5. Respiratory / Cough / Sore Throat
        if any(k in all_text for k in ["cough", "sore throat", "throat", "phlegm", "cold", "wheezing", "runny nose"]):
            if specialist == "General Physician / Family Doctor":
                specialist = "ENT Specialist / Pulmonologist"
            matched_conditions.append({
                "name": "Upper Respiratory Tract Infection (URTI) / Pharyngitis",
                "match_score": 86,
                "category": "Respiratory",
                "description": "Viral inflammation of mucosal membranes in nasal passages and throat.",
                "action": "Gargle with warm salt water 3-4 times daily. Use saline nasal sprays and throat lozenges."
            })
            home_remedies.append("Steam inhalation with eucalyptus or menthol to clear airway passages.")
            home_remedies.append("Drink warm tea with honey and lemon to soothe mucosal throat irritation.")

        # 6. Musculoskeletal / Joint / Back Pain
        if any(k in all_text for k in ["back pain", "joint pain", "muscle pain", "body ache", "leg pain", "knee"]):
            if specialist == "General Physician / Family Doctor":
                specialist = "Orthopedist / Physical Therapist"
            matched_conditions.append({
                "name": "Acute Musculoskeletal Lumbar / Joint Strain",
                "match_score": 82,
                "category": "Musculoskeletal",
                "description": "Overstretching or strain of ligaments, muscles, or articular cartilage from posture, heavy lifting, or exertion.",
                "action": "Apply ice packs for 15 minutes during the first 48 hours, followed by warm compresses."
            })
            home_remedies.append("Practice gentle low-impact stretching and maintain ergonomic posture.")

        # Default Fallback if no specific matched pattern
        if not matched_conditions:
            matched_conditions.append({
                "name": "Non-Specific General Physiological Strain",
                "match_score": 75,
                "category": "General Health",
                "description": f"Symptom profile involving '{', '.join(raw_symptoms) if raw_symptoms else 'reported symptoms'}' indicates mild general physiological strain.",
                "action": "Monitor symptoms closely over the next 24-48 hours. Consult a healthcare provider if symptoms persist or worsen."
            })
            home_remedies.append("Ensure adequate daily hydration (2-3 liters of clean water).")
            home_remedies.append("Prioritize 7-8 hours of restful sleep and avoid strenuous overexertion.")

        if not red_flags:
            red_flags.append("Symptoms persisting or progressively deteriorating over 5+ consecutive days.")
            red_flags.append("Development of new severe acute symptoms (high fever, severe localized pain).")

        return {
            "success": True,
            "triage_level": triage_level,
            "urgency_title": urgency_title,
            "badge_color": badge_color,
            "specialist": specialist,
            "primary_condition": matched_conditions[0]["name"] if matched_conditions else "General Physiological Strain",
            "matched_conditions": matched_conditions,
            "home_remedies": home_remedies,
            "red_flags": red_flags,
            "analyzed_symptoms": raw_symptoms if raw_symptoms else ["General Malaise"],
            "disclaimer": "AI Symptom Triage is an automated decision-support tool and does not constitute formal medical diagnosis or emergency treatment. In life-threatening emergencies, call your local emergency services (911 / 112) immediately."
        }
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.getLogger("symptom_routes").exception("Error during symptom checking")
        raise HTTPException(status_code=500, detail="Symptom checking service encountered an unexpected error.")

