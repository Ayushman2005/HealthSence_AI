import sys
import os
import secrets
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from auth import generate_token, hash_password
from config import ADMIN_USERNAME, ADMIN_PASSWORD
import database

client = TestClient(app)

class TestHealthSenseFullStack(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        database.init_db()
        cls.admin_token = generate_token(ADMIN_USERNAME, role="admin")

    def test_01_health_endpoints(self):
        for path in ["/", "/api", "/api/health", "/health"]:
            res = client.get(path)
            self.assertEqual(res.status_code, 200, f"Failed on {path}")
            data = res.json()
            self.assertEqual(data.get("status"), "online")
            self.assertEqual(data.get("version"), "2.6.0")

    def test_02_auth_flow(self):
        suffix = secrets.token_hex(4)
        username = f"user_{suffix}"
        password = "Password123!"
        name = f"Test User {suffix}"

        # 1. Register
        reg_res = client.post("/api/register", json={
            "username": username,
            "password": password,
            "name": name
        })
        self.assertEqual(reg_res.status_code, 200)
        self.assertTrue(reg_res.json().get("success"))
        token = reg_res.json().get("token")
        self.assertIsNotNone(token)

        # 2. Duplicate registration should fail
        dup_res = client.post("/api/register", json={
            "username": username,
            "password": password,
            "name": name
        })
        self.assertEqual(dup_res.status_code, 400)

        # 3. Invalid login should fail
        fail_login = client.post("/api/login", json={
            "username": username,
            "password": "WrongPassword!"
        })
        self.assertEqual(fail_login.status_code, 401)

        # 4. Valid login
        login_res = client.post("/api/login", json={
            "username": username,
            "password": password
        })
        self.assertEqual(login_res.status_code, 200)
        user_token = login_res.json().get("token")
        self.assertIsNotNone(user_token)

        # 5. Fetch profile
        headers = {"Authorization": f"Bearer {user_token}"}
        prof_res = client.get("/api/user/profile", headers=headers)
        self.assertEqual(prof_res.status_code, 200)
        self.assertEqual(prof_res.json().get("username"), username)

        # 6. Update profile
        upd_res = client.put("/api/user/profile", json={"name": "Updated Name"}, headers=headers)
        self.assertEqual(upd_res.status_code, 200)

        # 7. Update password
        pwd_res = client.put("/api/user/password", json={
            "current_password": password,
            "new_password": "NewPassword456!"
        }, headers=headers)
        self.assertEqual(pwd_res.status_code, 200)

        # 8. Delete user account
        del_res = client.delete("/api/user/account", headers=headers)
        self.assertEqual(del_res.status_code, 200)

    def test_03_multi_condition_prediction(self):
        payload = {
            "name": "Jane Doe",
            "personal": {
                "age": 50,
                "gender": "female",
                "height": 165.0,
                "weight": 78.0,
                "bmi": 28.6
            },
            "lifestyle": {
                "smoking": "no",
                "alcohol": "low",
                "physicalActivity": "moderate",
                "sleepDuration": 7.5
            },
            "medical": {
                "bpSystolic": 130,
                "bpDiastolic": 85,
                "cholesterol": 210,
                "glucose": 115,
                "insulin": 16,
                "heartRate": 72
            }
        }
        res = client.post("/api/predict", json=payload, headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        results = data.get("results", {})
        risks = results.get("risks", {})

        # Verify dual disease predictions
        self.assertIn("heartDisease", risks)
        self.assertIn("diabetes", risks)
        self.assertIn("insulinResistance", risks)
        self.assertIn("homaIR", results)
        self.assertGreaterEqual(risks["heartDisease"], 0)
        self.assertGreaterEqual(risks["diabetes"], 0)

        # Verify 5 heart models + 5 diabetes models in consensus
        self.assertEqual(len(results.get("modelConsensus", [])), 5)
        self.assertEqual(len(results.get("diabetesModelConsensus", [])), 5)
        self.assertIn("diabetes", results.get("explanations", {}))

        # Check assessment was saved
        assess_id = data.get("id")
        self.assertIsNotNone(assess_id)

        # Clean up created assessment
        del_res = client.delete(f"/api/assessments/{assess_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(del_res.status_code, 200)

    def test_04_symptom_checker(self):
        # Emergency chest pain
        res = client.post("/api/check-symptom", json={
            "symptoms": ["chest pain", "shortness of breath"],
            "severity": "Severe"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("triage_level"), "EMERGENCY")

        # Routine stomach ache
        res2 = client.post("/api/check-symptom", json={
            "symptoms": ["acidity", "indigestion"],
            "severity": "Mild"
        })
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json().get("triage_level"), "ROUTINE")

    def test_05_chatbot_api(self):
        res = client.post("/api/chat", json={
            "message": "What is normal fasting blood glucose?"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("response", data)

    def test_06_admin_system_status(self):
        res = client.get("/api/admin/system-status", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        models = data.get("models", {})
        self.assertEqual(len(models), 10, "Expected 10 operational models (5 Heart + 5 Diabetes)")
        for key in ["heart_xgboost", "heart_random_forest", "diabetes_xgboost", "diabetes_random_forest"]:
            self.assertIn(key, models)
            self.assertEqual(models[key]["status"], "Loaded")

    def test_07_ascvd_and_cha2ds2_vasc(self):
        payload = {
            "name": "Marcus Aurelius",
            "personal": {
                "age": 58,
                "gender": "male",
                "height": 176.0,
                "weight": 84.0,
                "race": "white_other"
            },
            "lifestyle": {
                "smoking": "yes",
                "alcohol": "moderate",
                "physicalActivity": "moderate",
                "sleepDuration": 6.5
            },
            "medical": {
                "bpSystolic": 146,
                "bpDiastolic": 92,
                "cholesterol": 232,
                "glucose": 118,
                "insulin": 14,
                "heartRate": 78,
                "hdl": 42,
                "ldl": 150,
                "bpTreated": True,
                "priorStroke": False
            }
        }
        res = client.post("/api/predict", json=payload, headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        results = data.get("results", {})

        # 1. Verify ASCVD 10-Year Risk Engine
        self.assertIn("ascvd", results)
        ascvd = results["ascvd"]
        self.assertIn("tenYearRisk", ascvd)
        self.assertIn("tier", ascvd)
        self.assertIn("recommendation", ascvd)
        self.assertGreater(ascvd["tenYearRisk"], 5.0)

        # 2. Verify CHA2DS2-VASc Stroke Risk Engine
        self.assertIn("cha2ds2Vasc", results)
        cha2 = results["cha2ds2Vasc"]
        self.assertIn("score", cha2)
        self.assertIn("annualStrokeRisk", cha2)
        self.assertIn("recommendation", cha2)
        self.assertGreaterEqual(cha2["score"], 1)

        # Verify explanations
        exps = results.get("explanations", {})
        self.assertIn("ascvd", exps)
        self.assertIn("cha2ds2Vasc", exps)

        # Clean up created record
        assess_id = data.get("id")
        if assess_id:
            client.delete(f"/api/assessments/{assess_id}", headers={"Authorization": f"Bearer {self.admin_token}"})

    def test_08_lab_report_parser(self):
        sample_lab_text = (
            "DIAGNOSTIC PATHOLOGY LABORATORY REPORT\n"
            "Patient Name: Alexander Wright | Age: 49 Years | Gender: Male\n"
            "Physical Vitals:\n"
            "Resting Blood Pressure: 136/84 mmHg\n"
            "Resting Pulse: 72 bpm\n"
            "Height: 177 cm | Weight: 79 kg\n"
            "Comprehensive Lipid Profile:\n"
            "Total Cholesterol: 218 mg/dL\n"
            "HDL Cholesterol: 46 mg/dL\n"
            "LDL Cholesterol: 140 mg/dL\n"
            "Metabolic Assessment:\n"
            "Fasting Plasma Glucose: 104 mg/dL\n"
            "Fasting Serum Insulin: 11.5 uIU/mL\n"
            "HbA1c: 5.8 %\n"
        )

        res = client.post("/api/parse-lab-text", json={"raw_text": sample_lab_text})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        extracted = data.get("extracted", {})

        # Ensure major vitals were extracted
        self.assertEqual(extracted.get("bpSystolic"), 136)
        self.assertEqual(extracted.get("bpDiastolic"), 84)
        self.assertEqual(extracted.get("cholesterol"), 218)
        self.assertEqual(extracted.get("glucose"), 104)
        self.assertGreaterEqual(data.get("totalBiomarkers", 0), 6)

if __name__ == "__main__":
    unittest.main()
