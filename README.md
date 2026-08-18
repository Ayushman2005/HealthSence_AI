# HealthSence AI 🏥🤖

**HealthSence AI** is an advanced, full-stack medical health risk assessment platform. Utilizing machine learning models trained across comprehensive clinical datasets, HealthSence AI analyzes patient physiological, lifestyle, and medical parameters to predict individual risk percentages for **Diabetes**, **Heart Disease**, **Kidney Disease**, and **Liver Disease**.

In addition to multi-disease predictive risk scoring, HealthSence AI features an **AI Medical Report OCR & Prescription Recommendation Engine**, a **Resilient 3-Tier Database System** (Supabase PostgreSQL / MySQL / SQLite), and an **Admin Dashboard** with live system monitoring and on-demand model retraining.

---

## 🌟 Key Features

- **Multi-Disease Risk Prediction Engine**:
  - Evaluates physiological & lifestyle metrics to predict risk scores for Diabetes, Cardiovascular Disease, Chronic Kidney Disease, and Liver Disease.
- **5 ML Algorithm Suite & Automatic Selection**:
  - Implements **Random Forest**, **XGBoost**, **Support Vector Classifier (SVM)**, **Decision Tree**, and **Logistic Regression**.
  - Dynamically selects the best-performing algorithm per disease based on F1-Score, Accuracy, and ROC-AUC metrics, while supporting manual algorithm overrides.
- **AI Medical Report Analysis & Prescription Generator (`POST /api/analyze-report`)**:
  - Parses uploaded PDF/text medical lab reports to extract key physiological biomarkers (glucose, blood pressure, cholesterol, insulin, BMI).
  - Determines primary clinical diagnosis and severity ratings.
  - Automatically generates targeted pharmaceutical prescription recommendations (drug name, dosage, frequency, therapeutic purpose, and clinical precautions) alongside lifestyle interventions.
- **Pharmacology & Drug Safety Portal (Local Clinical + DailyMed)**:
  - **Multi-Drug Interaction (DDI) Matrix Engine**: Evaluates pairwise prescription combinations using the app’s local clinical safety rules for severe/contraindicated interactions and mechanisms.
  - **Drug Monograph Explorer**: Queries standardized medication metadata and official DailyMed structured product labels for clinical information.
  - **DailyMed SPL & NDC Package Verification**: Links directly to official NIH DailyMed structured product labels and FDA National Drug Code packaging.
  - **Automated Prescription Verification**: 1-click verification of extracted lab report prescriptions with instant safety scoring and warning alerts.
- **Automated Health Score & Clinical Explanations**:
  - Computes an overall composite **Health Score (15–100)** and confidence index.
  - Highlights specific clinical risk drivers (e.g., elevated fasting glucose, blood pressure, BMI).
  - Categorizes actionable recommendations into **Immediate Actions**, **Lifestyle Modifications**, and **Recommended Medical Screenings**.
- **Resilient 3-Tier Database Architecture**:
  - **Tier 1 (Cloud Primary)**: Supabase Cloud PostgreSQL with Row Level Security (RLS) and automatic schema migration (`supabase_schema.sql`).
  - **Tier 2 (Self-Hosted/Local)**: MySQL Database (`health_risk_db`).
  - **Tier 3 (Embedded Fallback)**: Embedded SQLite (`models/local_storage.db`).
  - Seamless automatic failover across tiers ensures continuous operation without service interruption.
- **Secure Authentication & User Account Management**:
  - HMAC SHA-256 / JWT signed token authentication.
  - User Registration, Login, Profile updates, Password changes, and Account deletion.
  - Immutable Admin security credential table (`admin_credentials`).
- **Assessment History & Record Auditing**:
  - Persists patient risk assessments with full JSON input snapshots and predictive outcomes.
  - Offers record searching, detailed record viewing, and record deletion.
- **Admin Dashboard & Retraining Engine**:
  - Real-time monitoring of active database mode, total users, system health, and assessment counts.
  - Displays algorithm accuracy and F1 benchmarks across all 4 disease models.
  - Triggers on-demand machine learning model retraining directly via backend execution (`train_models.py`).
- **Modern Responsive UI**:
  - Glassmorphic UI built with **React 19**, **Vite 8**, **Tailwind CSS 4**, **Lucide Icons**, and **Chart.js**.

---

## 🏗️ Architecture & Technology Stack

### **Frontend**
- **Framework**: React 19, Vite 8
- **Styling**: Tailwind CSS 4, Custom Glassmorphism UI
- **Data Visualization**: Chart.js, `react-chartjs-2`
- **Icons**: Lucide React
- **Linter**: Oxlint

### **Backend**
- **Server Framework**: Python FastAPI, Uvicorn, Pydantic
- **Machine Learning**: Scikit-Learn, XGBoost, Pandas, NumPy, Pickle
- **Database Layer**: Supabase PostgreSQL (`supabase-py`, `psycopg2`), PyMySQL (MySQL 8.0+), SQLite3
- **Authentication**: HMAC SHA-256 Signed Tokens

---

## 📁 Repository Structure

```
Project 2026/
├── backend/
│   ├── main.py                # Primary FastAPI entry point, lifespan, CORS & APIRouter configuration
│   ├── config.py              # Environment variables, admin credentials, Supabase & DB settings
│   ├── auth.py                # Password hashing, HMAC-SHA256 tokens & auth dependency helpers
│   ├── database.py            # Multi-tier database connection pool (Supabase Cloud / MySQL / SQLite)
│   ├── ml_engine.py           # ML asset loader, scaler, algorithm selection & feature encoder
│   ├── routes_auth.py         # Auth endpoints (Register, Login, Profile, Password, Account)
│   ├── routes_predict.py      # Risk prediction endpoints (/api/predict, /api/assessments, /api/retrain)
│   ├── routes_symptom.py      # AI Symptom Checker & Clinical Triage endpoint (/api/check-symptom)
│   ├── routes_chatbot.py      # HealthBot AI 24/7 Clinical Assistant chat endpoint (/api/chat)
│   ├── routes_report.py       # Medical Report OCR & Prescription generator endpoint (/api/analyze-report)
│   ├── routes_admin.py        # System Admin Governance endpoints (/api/admin/users, /api/admin/system-status)
│   ├── train_models.py        # Automated ML model training & dataset synthesis script
│   ├── supabase_schema.sql    # PostgreSQL schema setup & Row Level Security policies
│   ├── .env                   # Environment variables (Supabase, MySQL, Admin, JWT)
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # Trained model artifacts & SQLite storage
│   │   ├── model_metrics.json # Accuracy & F1 benchmarks across algorithms
│   │   ├── scaler.pkl         # Trained StandardScaler for numerical inputs
│   │   ├── *.pkl              # Trained PKL models for each disease-algorithm pair
│   │   └── local_storage.db   # Embedded SQLite fallback database
│   └── notebooks/             # Jupyter notebooks for EDA & model training
│       ├── diabetes_model_training.ipynb
│       ├── heart_disease_model_training.ipynb
│       ├── kidney_disease_model_training.ipynb
│       └── liver_disease_model_training.ipynb
├── frontend/
│   ├── src/                   # React frontend application
│   │   ├── App.jsx            # Main container, top-level state management & route controller
│   │   ├── main.jsx           # React app entry point
│   │   ├── index.css          # Core CSS design system & Tailwind setup
│   │   └── components/        # Modular Component Pages & Feature Modules
│   │       ├── Navbar.jsx          # Top navigation header & user profile dropdown
│   │       ├── Dashboard.jsx       # AI Health Risk Dashboard overview & charts
│   │       ├── Wizard.jsx          # Multi-step Clinical Diagnostics assessment wizard
│   │       ├── SymptomChecker.jsx  # AI Symptom Checker & Clinical Triage Engine
│   │       ├── HealthChatbot.jsx   # HealthBot AI 24/7 Clinical Assistant chat page
│   │       ├── MedicalReport.jsx   # Medical Report OCR & Prescription (Rx) Engine
│   │       ├── Results.jsx         # Diagnostic Risk Evaluation report & print layout
│   │       ├── History.jsx         # Audit History Log table & search filters
│   │       ├── Insights.jsx        # Chronological health score & vital sign timeline charts
│   │       ├── Account.jsx         # User account settings & credentials management
│   │       ├── AdminPortal.jsx     # Admin Governance & ML model control panel
│   │       ├── AuthModal.jsx       # Sign in / Sign up authentication container
│   │       ├── SimulatorModal.jsx  # Interactive real-time risk parameter simulator modal
│   │       ├── SplashLoader.jsx    # Animated initial splash loading screen
│   │       ├── ToastContainer.jsx  # Floating toast notification overlay
│   │       └── ChatWidget.jsx      # Floating persistent medical chatbot widget drawer
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
- **Supabase Cloud / MySQL** *(Optional)*: If unavailable, the server automatically defaults to embedded SQLite.

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

5. Train the Machine Learning models (Generates dataset, scalers, and model pickle files):
   ```bash
   python train_models.py
   ```

6. Launch the FastAPI backend server:
   ```bash
   python main.py
   ```
   *(Or `python server.py` for backward compatibility).*
   The backend API will start at **`http://localhost:5000`**.

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
| `POST` | `/api/login` | Authenticate user/admin & return token | ❌ |
| `GET` | `/api/user/profile` | Retrieve profile details of logged-in user | ✅ |
| `PUT` | `/api/user/profile` | Update user profile name | ✅ |
| `PUT` | `/api/user/password` | Change user account password | ✅ |
| `DELETE` | `/api/user/account` | Delete user account | ✅ |

### **Risk Assessment & Medical AI Engine**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/predict` | Calculate risk predictions across 4 diseases | ❌ |
| `POST` | `/api/analyze-report` | AI scan of lab report PDF & prescription recommendation generator | ✅ |
| `GET` | `/api/assessments` | Retrieve historical saved patient risk assessments | ✅ |
| `DELETE` | `/api/assessments/{id}` | Delete a specific assessment record | ✅ |

### **Admin & Model Operations**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/metrics` | Retrieve benchmark metrics for all ML algorithms | ✅ |
| `POST` | `/api/retrain` | Trigger model retraining pipeline (`train_models.py`) | ✅ |
| `GET` | `/api/admin/users` | List all registered users & total assessment count | ✅ (Admin) |
| `GET` | `/api/admin/system-status` | View system health, DB connection mode & model statuses | ✅ (Admin) |

---

## 🤖 Machine Learning Workflow

1. **Feature Matrix (15 Metrics)**:
   - **Numerical (11)**: Age, Height, Weight, BMI, Sleep Duration, Systolic BP, Diastolic BP, Cholesterol, Fasting Glucose, Insulin, Heart Rate.
   - **Categorical (4)**: Gender, Smoking Status, Alcohol Consumption, Physical Activity Level.
2. **Model Training & Evaluation**:
   - Models trained per disease for 5 algorithms (Random Forest, XGBoost, Support Vector Classifier, Decision Tree, Logistic Regression).
   - Artifacts stored under `backend/models/*.pkl` alongside performance metrics in `model_metrics.json`.

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
