# HealthSence AI 🫀🩺🤖

**HealthSence AI** is an advanced, full-stack multi-disease health risk assessment and clinical intelligence platform. Utilizing machine learning models trained on physiological, cardiac, and metabolic biomarker datasets, HealthSence AI analyzes patient vitals, lifestyle habits, and hemodynamic indicators to predict **Heart Disease Likelihood** and **Type 2 Diabetes Risk** alongside comprehensive sub-dimensions and insulin resistance (HOMA-IR) metrics.

HealthSence AI features a **Multi-Disease Machine Learning Ensemble** (10 active models across XGBoost, Random Forest, SVM, Logistic Regression, and Decision Tree), an interactive **"What-If" Life Extension Multi-Risk Simulator**, an **AI Symptom Checker & Clinical Triage Engine**, a **24/7 Cardiology & Metabolic Assistant Chatbot**, a **Resilient 3-Tier Database System** (Supabase PostgreSQL / MySQL / SQLite), and an **Admin Portal** with live telemetry and on-demand model retraining.

---

## 🌟 Key Features

- **Multi-Disease Machine Learning Ensemble (10 Models)**:
  - Predicts core **Heart Disease** and **Type 2 Diabetes** risk probabilities with calibrated ensembles across 5 machine learning algorithms per disease:
    - **XGBoost Classifier**
    - **Random Forest Multi-Tree**
    - **Support Vector Machine (SVM)**
    - **Calibrated Logistic Regression**
    - **Decision Tree Classifier**
  - Dynamically computes multi-algorithm consensus agreement and precision weights for both conditions.

- **Comprehensive Multi-Condition Diagnostic Matrix & Risk Profiles**:
  1. **Heart Disease Likelihood**: Core ML model output reflecting comprehensive cardiac risk.
  2. **Type 2 Diabetes Risk**: Core ML model output evaluating fasting glucose, insulin, and adiposity.
  3. **Insulin Resistance (HOMA-IR)**: Clinical metric and probability derived from fasting glucose & insulin levels.
  4. **Coronary Artery Disease (CAD) Risk**: Assesses atheroma formation, lipid deposition, and arterial stenosis.
  5. **Hypertensive Heart Strain**: Evaluates left ventricular workload, pulse pressure, and systemic vascular resistance.
  6. **Atherosclerosis & Plaque Index**: Analyzes oxidized LDL lipids, carotid intima-media thickness markers, and vascular stiffness.
  7. **Glycemic Dysregulation & Strain**: Fasting glucose elevation trajectory and advanced glycation risk.
  8. **Cardiac Rhythm & Electrophysiology**: Monitors resting heart rate, ECG rhythm stability, and autonomic recovery.
  9. **Cardio-Metabolic Endothelial Strain**: Tracks glycemic microvascular resistance and insulin-related endothelial stress.
  10. **Metabolic Syndrome Cluster**: Multi-factorial criteria tracking (hypertension, hyperglycemia, dyslipidemia, BMI).

- **6-Pillar Cardiovascular Diagnostic Matrix & ECG Telemetry**:
  - Live interactive dashboard visualizing cardiovascular pillars with real-time biometric recalibration knobs (Blood Pressure, Cholesterol, Glucose, BMI, Sleep).
  - Built-in real-time ECG rhythm simulator (Sinus Normal, Tachycardia, Bradycardia, Arrhythmia) with audio pulse synthesis.

- **Interactive "What-If" Life Extension Simulator**:
  - Real-time sliders allowing patients and clinicians to simulate blood pressure reduction, BMI optimization, aerobic exercise, and smoking cessation to forecast quantifiable heart risk drops and health score improvements.

- **AI Symptom Checker & Clinical Triage Engine (`POST /api/check-symptom`)**:
  - Anatomical body-region symptom evaluator with red-flag detection for acute myocardial infarction, unstable angina, and emergency cardiovascular conditions.

- **HealthBot AI 24/7 Cardiology Assistant (`POST /api/chat`)**:
  - Voice-enabled intelligent clinical chatbot providing evidence-based AHA/ACC cardiovascular guidance, DASH diet protocols, lipid management targets, and emergency triage FAQs.

- **Automated Health Score & Clinical Explanations**:
  - Computes a unified **Cardiovascular Health Score (15–100)** and confidence index.
  - Generates clear, clinician-grade risk factor drivers and structured recommendations (**Immediate Actions**, **Lifestyle Modifications**, **Recommended Screenings**).

- **Resilient 3-Tier Database Architecture**:
  - **Tier 1 (Cloud Primary)**: Supabase Cloud PostgreSQL with Row Level Security (RLS) and automatic schema migration (`supabase_schema.sql`).
  - **Tier 2 (Self-Hosted/Local)**: MySQL Database (`health_risk_db`).
  - **Tier 3 (Embedded Fallback)**: Embedded SQLite (`models/local_storage.db`).
  - Seamless automatic failover across tiers ensures continuous operation without service interruption.

- **Secure Authentication & User Account Management**:
  - HMAC SHA-256 signed token authentication.
  - User Registration, Login, Profile updates, Password management, and Account deletion.
  - Dedicated Admin security governance portal (`admin_credentials`).

- **Medical Audit History & Longitudinal Insights**:
  - Persists patient assessments with complete biomarker snapshots and risk outcomes.
  - Longitudinal timeline charts displaying health score trajectories and biometric trends over time.

---

## 🏗️ Architecture & Technology Stack

### **Frontend**
- **Framework**: React 19, Vite 8
- **Styling**: Tailwind CSS 4, Custom Glassmorphic Dark UI
- **Data Visualization**: Chart.js, `react-chartjs-2`
- **Icons**: Lucide React
- **Audio Synthesis**: Web Audio API (ECG Heartbeat & Clinical Sound Effects)

### **Backend**
- **Server Framework**: Python FastAPI, Uvicorn, Pydantic
- **Machine Learning**: Scikit-Learn, XGBoost, Pandas, NumPy, Pickle
- **Database Layer**: Supabase PostgreSQL (`supabase-py`, `psycopg2`), PyMySQL (MySQL 8.0+), SQLite3
- **Authentication**: HMAC SHA-256 Signed Tokens

---

## 📁 Repository Structure

```
HealthSence_AI/
├── backend/
│   ├── main.py                # Primary FastAPI entry point, lifespan, CORS & APIRouter configuration
│   ├── config.py              # Environment variables, admin credentials, Supabase & DB settings
│   ├── auth.py                # Password hashing, HMAC-SHA256 tokens & auth dependency helpers
│   ├── database.py            # Multi-tier database connection pool (Supabase Cloud / MySQL / SQLite)
│   ├── ml_engine.py           # ML asset loader, scaler, algorithm selection & feature encoder
│   ├── routes_auth.py         # Auth endpoints (Register, Login, Profile, Password, Account)
│   ├── routes_predict.py      # Risk prediction endpoints (/api/predict, /api/assessments, /api/retrain)
│   ├── routes_symptom.py      # AI Symptom Checker & Clinical Triage endpoint (/api/check-symptom)
│   ├── routes_chatbot.py      # HealthBot AI 24/7 Cardiology Assistant chat endpoint (/api/chat)
│   ├── routes_admin.py        # System Admin Governance endpoints (/api/admin/users, /api/admin/system-status)
│   ├── train_models.py        # Automated Heart Disease & Diabetes ML model training & calibration
│   ├── pipeline_trainer.py    # Multi-disease dataset generator & pipeline trainer
│   ├── test_suite.py          # End-to-end automated integration test suite
│   ├── supabase_schema.sql    # PostgreSQL schema setup & Row Level Security policies
│   ├── .env                   # Environment variables (Supabase, MySQL, Admin, JWT)
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # Trained model artifacts & SQLite storage
│   │   ├── heart_disease_dataset.csv          # Heart Disease training dataset
│   │   ├── heart_disease_xgboost.pkl          # Trained Heart Disease XGBoost model
│   │   ├── heart_disease_random_forest.pkl    # Trained Heart Disease Random Forest model
│   │   ├── heart_disease_svm.pkl              # Trained Heart Disease SVM model
│   │   ├── heart_disease_logistic_regression.pkl # Trained Heart Disease Logistic Regression model
│   │   ├── heart_disease_decision_tree.pkl    # Trained Heart Disease Decision Tree model
│   │   ├── diabetes_dataset.csv               # Type 2 Diabetes training dataset
│   │   ├── diabetes_xgboost.pkl               # Trained Diabetes XGBoost model
│   │   ├── diabetes_random_forest.pkl         # Trained Diabetes Random Forest model
│   │   ├── diabetes_svm.pkl                   # Trained Diabetes SVM model
│   │   ├── diabetes_logistic_regression.pkl   # Trained Diabetes Logistic Regression model
│   │   ├── diabetes_decision_tree.pkl         # Trained Diabetes Decision Tree model
│   │   ├── model_metrics.json                 # Benchmark metrics across all 10 models
│   │   ├── scaler.pkl                         # Trained StandardScaler for numerical inputs
│   │   ├── feature_names.json                 # Encoded feature names mapping
│   │   └── local_storage.db                   # Embedded SQLite fallback database
│   └── notebooks/
│       └── heart_disease_model_training.ipynb # Jupyter notebook for Heart Disease training & EDA
├── frontend/
│   ├── src/                   # React frontend application
│   │   ├── App.jsx            # Main container, top-level state management & route controller
│   │   ├── main.jsx           # React app entry point
│   │   ├── index.css          # Core CSS design system & Tailwind setup
│   │   ├── components/        # Modular Component Pages & Feature Modules
│   │   │   ├── Navbar.jsx          # Top navigation header & user profile dropdown
│   │   │   ├── Dashboard.jsx       # 6-Pillar Cardio Matrix, Live Recalibration & ECG Telemetry
│   │   │   ├── Wizard.jsx          # 3-Step Clinical Assessment Wizard with presets
│   │   │   ├── Results.jsx         # Cardiovascular Evaluation Report & "What-If" Simulator
│   │   │   ├── SimulatorModal.jsx  # Interactive real-time risk parameter simulator modal
│   │   │   ├── SymptomChecker.jsx  # AI Symptom Checker & Clinical Triage Engine
│   │   │   ├── HealthChatbot.jsx   # HealthBot AI 24/7 Cardiology Assistant chat page
│   │   │   ├── History.jsx         # Longitudinal Audit History Log table & search filters
│   │   │   ├── Insights.jsx        # Cardiovascular score & biomarker timeline charts
│   │   │   ├── Account.jsx         # User account settings & credentials management
│   │   │   ├── AdminPortal.jsx     # Admin Governance & ML model control panel
│   │   │   ├── AuthModal.jsx       # Sign in / Sign up authentication container
│   │   │   ├── SplashLoader.jsx    # Animated initial splash loading screen
│   │   │   ├── ToastContainer.jsx  # Floating toast notification overlay
│   │   │   └── ChatWidget.jsx      # Floating persistent medical chatbot widget drawer
│   │   └── utils/
│   │       └── audioFX.js          # Web Audio API sound synthesizers
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies & npm scripts
│   └── vite.config.js         # Vite configuration
└── README.md                  # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: `v3.10` or higher
- **Node.js**: `v18.0.0` or higher
- **Supabase Cloud / MySQL** *(Optional)*: If unavailable, the backend automatically defaults to embedded SQLite.

---

### 1️⃣ Setting Up the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (Create or update `backend/.env`):
   ```env
   # Database Configuration (Tier 1: Supabase Cloud)
   SUPABASE_URL=https://<your-project-id>.supabase.co
   SUPABASE_KEY=your_supabase_secret_or_service_key
   SUPABASE_DB_URL=postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres

   # Database Configuration (Tier 2: MySQL)
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DB=health_risk_db

   # Security & Authentication
   ADMIN_USERNAME=Ayushman24
   ADMIN_PASSWORD=Ayushman@#2005
   JWT_SECRET=your_secure_jwt_secret_key
   ```

5. Train the Machine Learning models (Calibrates the 5 Heart Disease classifiers, scalers, and metrics):
   ```bash
   python train_models.py
   ```

6. Launch the FastAPI backend server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```
   The backend API will start at **`http://127.0.0.1:8000`**.

---

### 2️⃣ Setting Up the Frontend

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application dashboard will open at **`http://localhost:5173`**.

---

## 🔌 API Endpoints Reference

### **Authentication & Account Management**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/register` | Register a new user account | ❌ |
| `POST` | `/api/login` | Authenticate user/admin & return signed token | ❌ |
| `GET` | `/api/user/profile` | Retrieve profile details of logged-in user | ✅ |
| `PUT` | `/api/user/profile` | Update user profile name | ✅ |
| `PUT` | `/api/user/password` | Change user account password | ✅ |
| `DELETE` | `/api/user/account` | Delete user account | ✅ |

### **Cardiovascular Risk Assessment & Clinical AI**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Health check endpoint returning backend & DB status | ❌ |
| `POST` | `/api/predict` | Calculate Heart Disease risk & cardiovascular sub-dimensions | ❌ |
| `POST` | `/api/chat` | 24/7 Cardiology & Clinical Guidance AI Assistant | ❌ |
| `POST` | `/api/check-symptom` | AI Symptom Checker & Emergency Triage Engine | ❌ |
| `GET` | `/api/assessments` | Retrieve historical saved patient risk assessments | ✅ |
| `DELETE` | `/api/assessments/{id}` | Delete a specific assessment record | ✅ |

### **Admin & Model Operations**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/metrics` | Retrieve benchmark metrics for Heart Disease ML models | ✅ |
| `POST` | `/api/retrain` | Trigger model retraining pipeline (`train_models.py`) | ✅ |
| `GET` | `/api/admin/users` | List all registered users & total assessment count | ✅ (Admin) |
| `GET` | `/api/admin/system-status` | View system health, DB connection mode & model statuses | ✅ (Admin) |

---

## 🤖 Machine Learning Workflow

1. **Feature Matrix (15 Metrics)**:
   - **Numerical (11)**: Age, Height, Weight, BMI, Sleep Duration, Systolic BP, Diastolic BP, Total Cholesterol, Fasting Glucose, Fasting Insulin, Resting Heart Rate.
   - **Categorical (4)**: Gender, Smoking Status, Alcohol Consumption, Physical Activity Level.
2. **Model Training & Evaluation**:
   - 5 models trained for Heart Disease (XGBoost, Random Forest, Support Vector Classifier, Decision Tree, Logistic Regression).
   - Artifacts stored under `backend/models/heart_disease_*.pkl` alongside performance metrics in `model_metrics.json`.

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
