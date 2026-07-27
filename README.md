# HealthRisk AI 🏥🤖

**HealthRisk AI** is an advanced, full-stack medical health risk assessment platform. Utilizing machine learning models trained across multiple clinical datasets, HealthRisk AI analyzes patient physiological, lifestyle, and medical parameters to predict individual risk percentages for **Diabetes**, **Heart Disease**, **Kidney Disease**, and **Liver Disease**.

---

## 🌟 Key Features

- **Multi-Disease Risk Prediction Engine**: Evaluates physiological input metrics against models trained for Diabetes, Cardiovascular Disease, Chronic Kidney Disease, and Liver Disease.
- **5 ML Algorithm Suite & Automatic Model Selection**:
  - Implements **Random Forest**, **XGBoost**, **Support Vector Classifier (SVM)**, **Decision Tree**, and **Logistic Regression**.
  - Dynamically evaluates and selects the optimal performing algorithm per disease based on F1-Score, Accuracy, and ROC-AUC metrics, while also offering manual algorithm selection.
- **Automated Health Score & Clinical Explanations**:
  - Computes an overall composite **Health Score (15–100)** and confidence index.
  - Highlights precise clinical risk factors (e.g., elevated fasting glucose, high systolic/diastolic blood pressure, BMI, lifestyle factors).
  - Categorizes actionable recommendations into **Immediate Actions**, **Lifestyle Modifications**, and **Recommended Medical Screenings**.
- **Resilient Dual-Database Architecture**:
  - Native support for **MySQL** (`health_risk_db`).
  - Automatic seamless failover to embedded **SQLite** (`models/local_storage.db`) when a MySQL server connection is unavailable.
- **Secure Authentication & Account Management**:
  - Token-based authentication using **HMAC SHA-256 / JWT** signatures.
  - User Registration, Login, Profile updates, Password updates, and Account deletion.
- **Assessment History & Record Auditing**:
  - Preserves past patient risk assessments with full JSON input snapshot and predictive results.
  - Offers record filtering, detailed modal views, and record deletion.
- **Admin Dashboard & Model Retraining Engine**:
  - Benchmarks ML algorithm metrics across all 4 disease models.
  - Enables on-demand retraining of machine learning models directly via the backend API execution pipeline (`train_models.py`).
- **Modern Responsive UI**:
  - Built with **React 19**, **Vite 8**, **Tailwind CSS 4**, **Lucide Icons**, and **Chart.js**.

---

## 🏗️ Architecture & Technology Stack

### **Frontend**
- **Framework**: React 19, Vite 8
- **Styling**: Tailwind CSS 4, Custom Glassmorphism UI
- **Data Visualization**: Chart.js, react-chartjs-2
- **Icons**: Lucide React
- **Linter**: Oxlint

### **Backend**
- **Server Framework**: Python Flask, Flask-CORS
- **Machine Learning**: Scikit-Learn, XGBoost, Pandas, NumPy, Pickle
- **Database Layer**: PyMySQL (MySQL 8.0+), SQLite3 (Auto-fallback)
- **Authentication**: HMAC SHA-256 Signed Token Authentication

---

## 📁 Repository Structure

```
Project 2026/
├── backend/
│   ├── server.py              # Main Flask REST API server & database routines
│   ├── train_models.py        # Model training orchestration script
│   ├── .env                   # Environment variable configuration
│   ├── models/                # Trained PKL models, scaler, metrics, & SQLite DB
│   │   ├── model_metrics.json # Performance metrics across algorithms
│   │   ├── scaler.pkl         # Trained StandardScaler for numeric inputs
│   │   ├── *.pkl              # Individual disease-algorithm model artifacts
│   │   └── local_storage.db   # SQLite fallback database
│   └── notebooks/             # Jupyter notebooks for EDA & model experimentation
│       ├── diabetes_model_training.ipynb
│       ├── heart_disease_model_training.ipynb
│       ├── kidney_disease_model_training.ipynb
│       └── liver_disease_model_training.ipynb
├── frontend/
│   ├── src/                   # React source code & components
│   │   ├── App.jsx            # Main dashboard app, routes, modals, and views
│   │   ├── index.css          # Design system & CSS rules
│   │   └── main.jsx           # App entry point
│   ├── index.html             # Main HTML template
│   ├── package.json           # Frontend dependencies & scripts
│   └── vite.config.js         # Vite bundler configuration
└── README.md                  # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: `v3.10` or higher
- **Node.js**: `v18.0.0` or higher
- **MySQL Server** *(Optional)*: If not running, the application automatically uses SQLite.

---

### 1️⃣ Setting Up the Backend

1. Navigate to the backend directory:
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
   pip install flask flask-cors pymysql numpy pandas scikit-learn xgboost
   ```

4. Configure environment variables (Optional):
   Create or edit `backend/.env`:
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=adminpassword
   JWT_SECRET=your_secure_jwt_secret_key_here
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DB=health_risk_db
   ```

5. Train the Machine Learning models (generates model `.pkl` files and data transformers):
   ```bash
   python train_models.py
   ```

6. Start the Flask server:
   ```bash
   python server.py
   ```
   The backend API will run at **`http://localhost:5000`**.

---

### 2️⃣ Setting Up the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The web dashboard will be available at **`http://localhost:5173`** (or the URL output by Vite).

---

## 🔌 API Endpoints Reference

### **Authentication & User Management**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/register` | Register a new user account | ❌ |
| `POST` | `/api/login` | Authenticate user & receive access token | ❌ |
| `GET` | `/api/user/profile` | Retrieve logged-in user profile details | ✅ |
| `PUT` | `/api/user/profile` | Update user full name | ✅ |
| `PUT` | `/api/user/password` | Update account password | ✅ |
| `DELETE` | `/api/user/account` | Delete user account | ✅ |

### **Risk Assessment & Analytics**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/predict` | Calculate risk predictions across 4 diseases | ❌ |
| `GET` | `/api/assessments` | Retrieve history of saved patient assessments | ✅ |
| `DELETE` | `/api/assessments/<id>` | Delete a patient assessment record | ✅ |

### **Model Management & Retraining**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/metrics` | Fetch ML algorithm accuracy & F1 benchmarks | ✅ |
| `POST` | `/api/retrain` | Trigger retraining pipeline (`train_models.py`) | ✅ |

---

## 🤖 Machine Learning Workflow & Datasets

1. **Preprocessing & Feature Engineering**:
   - **Numerical Features (11)**: Age, Height, Weight, Body Mass Index (BMI), Sleep Duration, Systolic BP, Diastolic BP, Cholesterol, Fasting Glucose, Insulin, Heart Rate.
   - **Categorical Features (4)**: Gender (One-Hot Encoded), Smoking status, Alcohol consumption, Physical activity level.
   - **Standardization**: Numerical features are scaled using `StandardScaler`.

2. **Model Training & Consolidation**:
   - Notebooks in `backend/notebooks/` train models for each disease across 5 algorithms.
   - Outputs are stored in `backend/models/` as pickle files (`<disease>_<algorithm>.pkl`).
   - Merges individual datasets into a unified `clinical_dataset.csv`.

---

## 🛡️ License

This project is released under the [MIT License](LICENSE).
