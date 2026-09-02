import os
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import log_audit_event
from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger("chatbot_routes")
router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []
    patient_context: Optional[Dict[str, Any]] = None

SYSTEM_PROMPT = """You are HealthBot AI, an elite board-certified Cardiology & Cardiovascular Precision Health AI Assistant for HealthSence AI.

Clinical Knowledge Base & Directives:
- Cardiovascular diseases: Coronary Artery Disease (CAD), Hypertensive Heart Disease, Heart Failure, Atherosclerosis, Arrhythmias, Stroke prevention.
- Biomarker targets: Blood pressure (<120/80 mmHg per AHA/ACC guidelines), total cholesterol (<200 mg/dL), LDL (<100 mg/dL), HDL (>50 mg/dL), Triglycerides (<150 mg/dL), Fasting glucose (70-99 mg/dL), HbA1c (<5.7%), Resting heart rate (60-80 bpm).
- Nutrition & lifestyle: DASH diet, Mediterranean diet, dietary sodium restriction (<2,000 mg/day), omega-3 fatty acids, 150 mins/week moderate aerobic exercise.
- Emergency red flags: Crushing chest pain, radiation to jaw/left arm, acute shortness of breath, sudden slurred speech, syncope (always urge immediate 911/ER emergency evaluation).

Output Requirements:
You MUST respond strictly in valid JSON format with the following keys:
{
  "category": "Domain category (e.g., 'Cardiology & Vascular Health', 'Lipidology & Metabolic Health', 'Endocrinology & Diabetes', 'Clinical Triage & Prevention', 'Emergency Cardiac Triage', 'General Healthcare')",
  "specialist_recommendation": "Best medical specialist to consult (e.g., 'Cardiologist', 'Lipidologist', 'Endocrinologist', 'Neurologist', 'Emergency Physician', 'General Physician')",
  "response": "Detailed, formatted clinical guidance in rich Markdown with headings (###), bold text, and numbered/bulleted action steps.",
  "suggested_prompts": [
    "Follow-up prompt 1",
    "Follow-up prompt 2",
    "Follow-up prompt 3"
  ],
  "disclaimer": "HealthBot AI provides educational health information and does not replace emergency medical care or direct physician evaluation."
}
"""

def get_clinical_fallback_response(user_msg: str, ctx: Dict[str, Any]) -> Dict[str, Any]:
    msg_lower = user_msg.lower()
    category = "General Healthcare"
    response_text = ""
    suggested_prompts = []
    specialist_rec = "General Physician"

    # Emergency Detection
    if any(k in msg_lower for k in ["crushing chest", "heart attack", "left arm pain", "chest tightness", "can't breathe", "collapse"]):
        category = "Emergency Cardiac Triage"
        specialist_rec = "Emergency Department (Call 911 / 112 Immediately)"
        response_text = (
            "### 🚨 URGENT MEDICAL ALERT: EMERGENCY CARDIAC PROTOCOL\n\n"
            "**The symptoms you described may indicate an acute cardiovascular emergency (such as Acute Myocardial Infarction / Heart Attack).**\n\n"
            "**Immediate Actions Required:**\n"
            "1. **Call Emergency Services (911 / 112) Immediately.** Do not drive yourself to the hospital.\n"
            "2. **Rest in a Seated Position:** Keep still and remain calm to minimize myocardial oxygen demand.\n"
            "3. **Chew Aspirin (if advised & non-allergic):** 325 mg uncoated aspirin if recommended by emergency dispatch.\n"
            "4. **Loosen Tight Clothing:** Ensure adequate airflow while awaiting emergency medical personnel."
        )
        suggested_prompts = [
            "What are the warning signs of a heart attack?",
            "What is angina pectoris?",
            "When should I go to the emergency room for chest pain?"
        ]
    elif any(k in msg_lower for k in ["glucose", "sugar", "diabet", "hba1c", "insulin"]):
        category = "Endocrinology & Diabetes"
        specialist_rec = "Endocrinologist / Diabetologist"
        response_text = (
            "### 🩸 Blood Glucose & Diabetes Management\n\n"
            "**Clinical Guidelines & Biomarker Reference Ranges:**\n"
            "- **Normal Fasting Glucose:** 70 – 99 mg/dL\n"
            "- **Pre-diabetes Range:** 100 – 125 mg/dL\n"
            "- **Diabetes Benchmark:** ≥ 126 mg/dL (on two separate tests)\n"
            "- **Optimal HbA1c Target:** Below 5.7% (Normal), 5.7–6.4% (Pre-diabetes), < 7.0% (Well-controlled diabetic target)\n\n"
            "**Actionable Clinical Advice:**\n"
            "1. **Adopt a Low-Glycemic Index (GI) Diet:** Focus on whole grains, non-starchy vegetables (spinach, broccoli), and lean proteins.\n"
            "2. **Regular Aerobic Physical Activity:** Aim for at least 150 minutes of moderate exercise (brisk walking, cycling) per week to enhance muscular insulin sensitivity.\n"
            "3. **Hydration & Sleep:** Drink 2.5–3 liters of water daily and maintain 7–8 hours of quality sleep to prevent cortisol-induced glucose spikes."
        )
        suggested_prompts = [
            "What is an ideal HbA1c level?",
            "What foods spike blood sugar fastest?",
            "How does Metformin work?"
        ]
    elif any(k in msg_lower for k in ["bp", "blood pressure", "hypertens", "systolic", "diastolic", "heart"]):
        category = "Cardiology & Vascular Health"
        specialist_rec = "Cardiologist / Internal Medicine"
        response_text = (
            "### 🫀 Blood Pressure & Cardiovascular Health\n\n"
            "**AHA Clinical Blood Pressure Categories:**\n"
            "- **Normal:** Systolic < 120 mmHg AND Diastolic < 80 mmHg\n"
            "- **Elevated:** Systolic 120–129 mmHg AND Diastolic < 80 mmHg\n"
            "- **Stage 1 Hypertension:** Systolic 130–139 mmHg OR Diastolic 80–89 mmHg\n"
            "- **Stage 2 Hypertension:** Systolic ≥ 140 mmHg OR Diastolic ≥ 90 mmHg\n\n"
            "**Lifestyle Interventions (DASH Guidelines):**\n"
            "1. **Sodium Reduction:** Limit daily dietary sodium intake to under 2,000 mg (approx. 1 teaspoon of salt).\n"
            "2. **Potassium & Magnesium Rich Foods:** Increase intake of bananas, avocados, leafy greens, and almonds.\n"
            "3. **Daily BP Monitoring:** Rest quietly for 5 minutes before taking blood pressure readings in the morning."
        )
        suggested_prompts = [
            "How can I lower systolic blood pressure naturally?",
            "What is the DASH diet?",
            "When is high blood pressure an emergency?"
        ]
    elif any(k in msg_lower for k in ["cholesterol", "lipid", "triglyceride", "ldl", "hdl", "statin"]):
        category = "Lipidology & Metabolic Health"
        specialist_rec = "Cardiologist / Lipidologist"
        response_text = (
            "### 🧪 Cholesterol & Lipid Panel Guidance\n\n"
            "**Target Lipid Biomarker Ranges:**\n"
            "- **Total Cholesterol:** < 200 mg/dL (Desirable)\n"
            "- **LDL ('Bad') Cholesterol:** < 100 mg/dL (Optimal for vascular health)\n"
            "- **HDL ('Good') Cholesterol:** > 50 mg/dL (Protective)\n"
            "- **Triglycerides:** < 150 mg/dL\n\n"
            "**Nutritional & Lifestyle Protocol:**\n"
            "1. **Soluble Fiber Intake:** Consume oatmeal, legumes, chia seeds, and apples to bind intestinal cholesterol.\n"
            "2. **Eliminate Trans Fats & Limit Saturated Fats:** Replace palm oil and butter with extra virgin olive oil and omega-3 rich fish.\n"
            "3. **Aerobic Exercise:** Regular cardio exercise raises protective HDL cholesterol levels."
        )
        suggested_prompts = [
            "What foods lower LDL cholesterol?",
            "What is the difference between LDL and HDL?",
            "Are statins safe for daily use?"
        ]
    elif any(k in msg_lower for k in ["stomach", "gastric", "acidity", "nausea", "digestion", "acid reflux", "gerd", "gut"]):
        category = "Gastroenterology"
        specialist_rec = "Gastroenterologist"
        response_text = (
            "### 🤢 Gastrointestinal Health & Digestive Support\n\n"
            "**Common Causes & Clinical Insights:**\n"
            "Stomach aching, acidity, or reflux often stems from gastritis, gastric acid excess, slow gastric emptying, or spicy/greasy meal triggers.\n\n"
            "**Recommended Home Care Steps:**\n"
            "1. **Adopt a Bland BRAT Diet:** Bananas, Rice, Applesauce, and Toast soothe irritated mucosal linings.\n"
            "2. **Stay Upright After Meals:** Avoid lying down for at least 2–3 hours after eating to prevent acid regurgitation.\n"
            "3. **Soothing Herbal Teas:** Chamomile or ginger tea helps alleviate smooth muscle cramping."
        )
        suggested_prompts = [
            "What foods trigger acid reflux?",
            "How to treat stomach cramps naturally?",
            "When does abdominal pain require ER visit?"
        ]
    elif any(k in msg_lower for k in ["headache", "migraine", "head pain", "temple", "dizziness"]):
        category = "Neurology"
        specialist_rec = "Neurologist"
        response_text = (
            "### 🤯 Headache & Neurological Comfort Protocol\n\n"
            "**Understanding Headache Types:**\n"
            "- **Tension Headaches:** Dull aching band-like pressure across temples due to stress, neck fatigue, or dehydration.\n"
            "- **Migraines:** Throbbing unilateral pain accompanied by nausea or photophobia (light sensitivity).\n\n"
            "**Relief Recommendations:**\n"
            "1. **Rehydration & Electrolytes:** Drink 500 mL of water immediately.\n"
            "2. **Dim Environment:** Rest in a cool, quiet, dark room with a cool ice compress on forehead.\n"
            "3. **Muscle Relief:** Gently stretch neck and shoulder muscles."
        )
        suggested_prompts = [
            "What causes sudden tension headaches?",
            "How to stop a migraine early?",
            "What are red-flag headache warning signs?"
        ]
    else:
        category = "Cardiovascular & Clinical Guidance"
        specialist_rec = "Cardiologist / Physician"
        response_text = (
            f"### 🫀 HealthBot AI Cardiovascular Overview\n\n"
            f"Thank you for reaching out regarding: *\"{user_msg}\"*.\n\n"
            "**Cardiovascular Health Recommendations:**\n"
            "1. **Biometric Tracking:** Maintain a regular log of your resting blood pressure (<120/80 mmHg), total cholesterol (<200 mg/dL), and resting heart rate (60–80 BPM).\n"
            "2. **Heart-Healthy Lifestyle:** Prioritize the DASH or Mediterranean diet, 150 minutes of weekly aerobic exercise, 7–8 hours of restorative sleep, and complete smoking cessation.\n"
            "3. **Clinical Evaluation:** Consult your physician or cardiologist for routine ECG, lipid panels, and risk assessments."
        )
        suggested_prompts = [
            "How to lower blood pressure naturally?",
            "What are normal cholesterol levels?",
            "What are the early warning signs of heart disease?",
            "How does exercise improve heart health?"
        ]

    return {
        "success": True,
        "category": category,
        "specialist_recommendation": specialist_rec,
        "response": response_text,
        "suggested_prompts": suggested_prompts,
        "disclaimer": "HealthBot AI provides educational health information and does not replace emergency medical care or direct physician evaluation.",
        "model": "Clinical Fallback Engine"
    }

@router.post('/api/chat')
@router.post('/api/chat/')
async def chat_assistant(payload: ChatRequest):
    try:
        user_msg = (payload.message or "").strip()
        if not user_msg:
            raise HTTPException(status_code=400, detail="Empty chat message")

        ctx = payload.patient_context or {}
        api_key = GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "").strip()

        if api_key:
            try:
                from groq import Groq
                client = Groq(api_key=api_key)

                messages = [{"role": "system", "content": SYSTEM_PROMPT}]

                # Include recent history turns
                if payload.history:
                    for h in payload.history[-6:]:
                        r = h.get("role")
                        c = h.get("content")
                        if r in ["user", "assistant"] and c:
                            messages.append({"role": r, "content": str(c)})

                # Contextual user prompt
                user_content = user_msg
                if ctx:
                    ctx_items = [f"{k}: {v}" for k, v in ctx.items() if v]
                    if ctx_items:
                        user_content = f"[Patient Context: {', '.join(ctx_items)}]\n\n{user_msg}"

                messages.append({"role": "user", "content": user_content})

                candidate_models = [
                    m for m in [
                        GROQ_MODEL,
                        "openai/gpt-oss-120b",
                        "llama-3.3-70b-versatile",
                        "qwen/qwen3.8-27b",
                        "openai/gpt-oss-20b",
                        "groq/compound-mini"
                    ] if m
                ]
                # Remove duplicates while preserving order
                seen_models = set()
                models_to_try = [m for m in candidate_models if not (m in seen_models or seen_models.add(m))]

                chat_completion = None
                used_model = None
                last_error = None

                for model_candidate in models_to_try:
                    try:
                        chat_completion = client.chat.completions.create(
                            messages=messages,
                            model=model_candidate,
                            temperature=0.3,
                            max_tokens=1024,
                            response_format={"type": "json_object"}
                        )
                        used_model = model_candidate
                        break
                    except Exception as model_err:
                        last_error = model_err
                        logger.info("Model candidate '%s' failed, trying next...", model_candidate)

                if chat_completion and used_model:
                    raw_content = chat_completion.choices[0].message.content
                    parsed = json.loads(raw_content)

                    category = parsed.get("category", "Cardiology & Vascular Health")
                    specialist_rec = parsed.get("specialist_recommendation", "Cardiologist")
                    resp_text = parsed.get("response", "")
                    suggested_prompts = parsed.get("suggested_prompts", [])
                    disclaimer = parsed.get("disclaimer", "HealthBot AI provides educational health information and does not replace emergency medical care.")

                    log_audit_event(
                        "AI_CHAT_QUERY",
                        "AI_ASSISTANT",
                        str(ctx.get("name") or "anonymous_user"),
                        f"Groq ({used_model}) | Category: {category} | Query: '{user_msg[:60]}...'",
                        status="SUCCESS"
                    )

                    return {
                        "success": True,
                        "category": category,
                        "specialist_recommendation": specialist_rec,
                        "response": resp_text,
                        "suggested_prompts": suggested_prompts,
                        "disclaimer": disclaimer,
                        "model": f"Groq ({used_model})"
                    }
                else:
                    logger.warning("All Groq model candidates failed: %s. Using clinical fallback.", last_error)

            except Exception as e:
                logger.warning("Groq API execution error: %s. Reverting to clinical fallback engine.", e)

        # Fallback to local clinical rule engine
        fallback_res = get_clinical_fallback_response(user_msg, ctx)
        log_audit_event(
            "AI_CHAT_QUERY",
            "AI_ASSISTANT",
            str(ctx.get("name") or "anonymous_user"),
            f"Fallback Engine | Category: {fallback_res['category']} | Query: '{user_msg[:60]}...'",
            status="SUCCESS"
        )
        return fallback_res

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in chat assistant API")
        raise HTTPException(status_code=500, detail="HealthBot AI assistant encountered an unexpected error.")
