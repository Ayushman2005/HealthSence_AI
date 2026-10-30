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

if __name__ == "__main__":
    unittest.main()
