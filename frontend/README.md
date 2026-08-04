# HealthSence AI Frontend 🏥⚛️

The frontend for **HealthSence AI** is built with **React 19**, **Vite 8**, **Tailwind CSS 4**, and **Chart.js**.

## 🧩 Component Architecture

The frontend follows a modular, component-based page architecture where each distinct operation, page, and modal has its own dedicated `.jsx` file under `src/components/`:

```
frontend/src/
├── App.jsx             # Main container, top-level state management & tab controller
├── main.jsx            # Application entry point
├── index.css           # Core CSS design system & Tailwind setup
└── components/         # Feature Modules & Component Pages
    ├── Navbar.jsx          # Top navigation bar & user profile dropdown
    ├── Dashboard.jsx       # AI Health Risk Dashboard overview & charts
    ├── Wizard.jsx          # Multi-step Clinical Diagnostics assessment wizard
    ├── SymptomChecker.jsx  # AI Symptom Checker & Clinical Triage Engine
    ├── HealthChatbot.jsx   # HealthBot AI 24/7 Clinical Assistant chat page
    ├── MedicalReport.jsx   # Medical Report OCR & Prescription (Rx) Engine
    ├── Results.jsx         # Diagnostic Risk Evaluation report & print layout
    ├── History.jsx         # Audit History Log table & search filters
    ├── Insights.jsx        # Chronological health score & vital sign timeline charts
    ├── Account.jsx         # User account settings & credentials management
    ├── AdminPortal.jsx     # Admin Governance & ML model control panel
    ├── AuthModal.jsx       # Sign in / Sign up authentication container
    ├── SimulatorModal.jsx  # Interactive real-time risk parameter simulator modal
    ├── SplashLoader.jsx    # Animated initial splash loading screen
    ├── ToastContainer.jsx  # Floating toast notification overlay
    └── ChatWidget.jsx      # Floating persistent medical chatbot widget drawer
```

## 🛠 Development Scripts

- **Start Dev Server**: `npm run dev` (Runs at `http://localhost:5173`)
- **Build Production Bundle**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Run Oxlint**: `npx oxlint`
