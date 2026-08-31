from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Any]] = []
    patient_context: Optional[Dict[str, Any]] = None

@router.post('/api/chat')
@router.post('/api/chat/')
async def chat_assistant(payload: ChatRequest):
    try:
        user_msg = (payload.message or "").strip()
        if not user_msg:
            raise HTTPException(status_code=400, detail="Empty chat message")

        msg_lower = user_msg.lower()
        ctx = payload.patient_context or {}

        category = "General Healthcare"
        response_text = ""
        suggested_prompts = []
        specialist_rec = "General Physician"

        # 1. Glucose / Blood Sugar / Diabetes Intent
        if any(k in msg_lower for k in ["glucose", "sugar", "diabet", "hba1c", "insulin"]):
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

        # 2. Blood Pressure / Cardiac / Hypertension Intent
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

        # 3. Cholesterol & Lipids Intent
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

        # 4. Stomach / Gastrointestinal Intent
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

        # 5. Headache / Migraine / Neurological Intent
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

        # 6. General Cardiovascular & Medical Guidance Fallback
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
            "disclaimer": "HealthBot AI provides educational health information and does not replace emergency medical care or direct physician evaluation."
        }
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.getLogger("chatbot_routes").exception("Error in chat assistant API")
        raise HTTPException(status_code=500, detail="HealthBot AI assistant encountered an unexpected error.")

