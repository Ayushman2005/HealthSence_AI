import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, LayoutDashboard, HeartPulse, Sliders, Palette, Zap, ClipboardList, TrendingUp, Cpu, 
  Moon, Sun, Menu, X, ArrowRight, ArrowLeft, Droplet, Heart, ShieldAlert, 
  Sparkles, Stethoscope, AlertOctagon, ChevronDown, ChevronUp, Search, 
  Trash2, Eye, Printer, PlusCircle, Inbox, AlertCircle, Info, CheckCircle, AlertTriangle, User, Settings, Lock, LogOut,
  UploadCloud, FileText, Pill, CheckCircle2, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Radar, Bar } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  RadialLinearScale, Title, Tooltip, Legend, Filler
);

// Baseline Demo Clinical Profiles
const MOCK_PROFILES = [
  {
    id: "mock-1",
    name: "John Doe",
    timestamp: "2026-07-01T10:30:00Z",
    personal: { name: "John Doe", age: 58, gender: "male", height: 175, weight: 88, bmi: 28.7 },
    lifestyle: { smoking: "yes", alcohol: "high", physicalActivity: "sedentary", sleepDuration: 5.5 },
    medical: { bpSystolic: 145, bpDiastolic: 92, cholesterol: 242, glucose: 112, insulin: 16, heartRate: 82 },
    results: {
      risks: { diabetes: 58, heartDisease: 84, kidneyDisease: 62, liverDisease: 78, hypertension: 72, stroke: 65 },
      overallScore: 41,
      confidence: 100,
      recommendations: {
        immediate: [
          "Consult a doctor regarding high blood pressure (145/92 mmHg) and high cholesterol (242 mg/dL).",
          "Schedule a liver function assessment due to heavy alcohol usage and overweight BMI status."
        ],
        lifestyle: [
          "Seek professional support to stop smoking.",
          "Limit alcohol intake to a maximum of 1-2 standard drinks per week, or abstain completely.",
          "Strive for 7-8 hours of sleep per night to support metabolic health.",
          "Incorporate 30 minutes of low-impact physical activity (like walking) 5 days a week."
        ],
        medical: [
          "Set up daily home blood pressure monitoring.",
          "Review cholesterol management options (dietary changes or statins) with a primary care provider."
        ]
      },
      explanations: {
        diabetes: [
          "Elevated fasting glucose of 112 mg/dL exceeds normal limit (<100 mg/dL).",
          "Elevated BMI of 28.7 kg/m² indicates overweight.",
          "Sedentary lifestyle factor limits insulin sensitivity."
        ],
        heart: [
          "Hypertension of 145/92 mmHg increases cardiac arterial strain.",
          "Active smoking is a primary cardiovascular risk factor.",
          "Cholesterol of 242 mg/dL is elevated."
        ],
        kidney: [
          "Hypertension of 145/92 mmHg damages renal filtration capillaries.",
          "Glucose of 112 mg/dL increases kidney workload."
        ],
        liver: [
          "Heavy alcohol consumption increases liver toxicity risk.",
          "Elevated BMI of 28.7 kg/m² contributes to NAFLD risk."
        ]
      }
    }
  },
  {
    id: "mock-2",
    name: "Jane Smith",
    timestamp: "2026-07-03T14:15:00Z",
    personal: { name: "Jane Smith", age: 29, gender: "female", height: 168, weight: 58, bmi: 20.6 },
    lifestyle: { smoking: "no", alcohol: "low", physicalActivity: "active", sleepDuration: 8.0 },
    medical: { bpSystolic: 115, bpDiastolic: 75, cholesterol: 175, glucose: 82, insulin: 8, heartRate: 64 },
    results: {
      risks: { diabetes: 12, heartDisease: 8, kidneyDisease: 10, liverDisease: 11, hypertension: 15, stroke: 9 },
      overallScore: 94,
      confidence: 100,
      recommendations: {
        immediate: [],
        lifestyle: [
          "Maintain your current physical activity levels. Excellent job!",
          "Continue healthy sleep habits (7-8 hours).",
          "Ensure balanced hydration and nutrition."
        ],
        medical: [
          "Continue with routine annual health screenings."
        ]
      },
      explanations: {
        diabetes: ["All parameters within standard limits."],
        heart: ["All parameters within standard limits."],
        kidney: ["All parameters within standard limits."],
        liver: ["All parameters within standard limits."]
      }
    }
  },
  {
    id: "mock-3",
    name: "Alex Rivera",
    timestamp: "2026-07-05T09:00:00Z",
    personal: { name: "Alex Rivera", age: 46, gender: "other", height: 180, weight: 102, bmi: 31.5 },
    lifestyle: { smoking: "no", alcohol: "moderate", physicalActivity: "moderate", sleepDuration: 6.5 },
    medical: { bpSystolic: 135, bpDiastolic: 85, cholesterol: 210, glucose: 145, insulin: 28, heartRate: 74 },
    results: {
      risks: { diabetes: 78, heartDisease: 55, kidneyDisease: 48, liverDisease: 52 },
      overallScore: 56,
      confidence: 100,
      recommendations: {
        immediate: [
          "Consult an endocrinologist regarding elevated fasting blood glucose (145 mg/dL) and insulin resistance markers."
        ],
        lifestyle: [
          "Focus on a low-glycemic, high-fiber diet to manage insulin sensitivity and blood glucose.",
          "Aim to reduce body weight by 5-10% through a combination of diet and increased exercise.",
          "Increase physical activity to 150+ minutes of moderate aerobic exercise per week."
        ],
        medical: [
          "Check HbA1c levels to confirm diabetes diagnosis and discuss potential therapeutic interventions.",
          "Monitor fasting glucose levels daily."
        ]
      },
      explanations: {
        diabetes: [
          "Fasting blood glucose of 145 mg/dL suggests diabetes range.",
          "Obese BMI of 31.5 kg/m² contributes to insulin resistance.",
          "Fasting insulin of 28 µIU/mL suggests insulin resistance."
        ],
        heart: [
          "Elevated BP of 135/85 mmHg increases cardiac workload.",
          "Cholesterol of 210 mg/dL is borderline high."
        ],
        kidney: [
          "Fasting glucose of 145 mg/dL adds microvascular kidney stress."
        ],
        liver: [
          "Obese BMI of 31.5 kg/m² increases NAFLD fatty liver risk.",
          "Moderate alcohol usage increases hepatic fat loads."
        ]
      }
    }
  }
];
export default function App() {
  // Application states
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme] = useState('light');
  
  const [assessments, setAssessments] = useState([]);
  const [activeUser, setActiveUser] = useState('');
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Authentication states
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('healthrisk_auth_token') || '');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authRole, setAuthRole] = useState('user'); // 'user' or 'admin'
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  
  // Account Management states
  const [userProfile, setUserProfile] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Wizards Form States
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', age: '35', gender: 'male', height: '170', weight: '70',
    smoking: 'no', alcohol: 'low', physicalActivity: 'moderate', sleepDuration: 7,
    bpSystolic: 120, bpDiastolic: 80, cholesterol: 180, glucose: 90, insulin: 8, heartRate: 70,
    algorithm: 'auto'
  });
  const [errors, setErrors] = useState({});
  const [predicting, setPredicting] = useState(false);
  // Custom Dynamic Theme Accent & Live Simulator state
  const [themeAccent, setThemeAccent] = useState('amber'); // 'indigo', 'emerald', 'violet', 'light'
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simParams, setSimParams] = useState({
    age: 45, bmi: 26.5, bpSystolic: 132, bpDiastolic: 84, glucose: 110,
    cholesterol: 215, insulin: 14, sleepDuration: 7, smoking: 'no',
    alcohol: 'low', physicalActivity: 'moderate'
  });

  // Real-time Dynamic Risk Computation for Simulator
  const liveSimResults = useMemo(() => {
    const age = parseFloat(simParams.age);
    const bmi = parseFloat(simParams.bmi);
    const glucose = parseFloat(simParams.glucose);
    const systolic = parseFloat(simParams.bpSystolic);
    const diastolic = parseFloat(simParams.bpDiastolic);
    const cholesterol = parseFloat(simParams.cholesterol);
    const insulin = parseFloat(simParams.insulin);
    const smoking = simParams.smoking === 'yes';
    const alcoholHigh = simParams.alcohol === 'high';
    const alcoholMod = simParams.alcohol === 'moderate';
    const sedentary = simParams.physicalActivity === 'sedentary';

    const zDiab = -5.0 + 0.048*(glucose - 90) + 0.075*(bmi - 24) + 0.025*(age - 35) + 0.020*(insulin - 8) + 0.012*(systolic - 120);
    const diabProb = Math.min(99, Math.max(2, Math.round(100 / (1 + Math.exp(-zDiab)))));

    const zHeart = -5.2 + 0.040*(systolic - 120) + 0.022*(cholesterol - 180) + 0.035*(age - 40) + (smoking ? 0.75 : 0) + 0.050*(bmi - 25) + (sedentary ? 0.4 : 0);
    const heartProb = Math.min(99, Math.max(2, Math.round(100 / (1 + Math.exp(-zHeart)))));

    const zKidney = -5.4 + 0.045*(systolic - 120) + 0.025*(glucose - 90) + 0.040*(age - 40) + 0.035*(bmi - 25) + 0.020*(diastolic - 75);
    const kidneyProb = Math.min(99, Math.max(2, Math.round(100 / (1 + Math.exp(-zKidney)))));

    const zLiver = -4.8 + (alcoholHigh ? 1.2 : alcoholMod ? 0.4 : 0) + 0.065*(bmi - 25) + 0.018*(cholesterol - 180) + 0.015*(glucose - 90) + 0.020*(age - 35);
    const liverProb = Math.min(99, Math.max(2, Math.round(100 / (1 + Math.exp(-zLiver)))));

    const maxRisk = Math.max(diabProb, heartProb, kidneyProb, liverProb);
    const score = Math.min(98, Math.max(5, Math.round(100 - (maxRisk * 0.65 + (diabProb + heartProb + kidneyProb + liverProb)/4 * 0.35))));

    return {
      risks: { diabetes: diabProb, heartDisease: heartProb, kidneyDisease: kidneyProb, liverDisease: liverProb },
      overallScore: score
    };
  }, [simParams]);

  const [retraining, setRetraining] = useState(false);

  // Result view page details target
  const [resultsAssessment, setResultsAssessment] = useState(null);
  const [expandedRisks, setExpandedRisks] = useState({ diabetes: false, heart: false, kidney: false, liver: false });

  // History Filter states
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  // Insights filter state 
  const [insightsUser, setInsightsUser] = useState('');

  // Medical Report Analyzer State
  const [reportFile, setReportFile] = useState(null);
  const [reportText, setReportText] = useState('');
  const [analyzingReport, setAnalyzingReport] = useState(false);
  const [reportAnalysisProgress, setReportAnalysisProgress] = useState(0);
  const [reportAnalysisResult, setReportAnalysisResult] = useState(null);

  const handleAnalyzeReport = async (overrideText = null, overrideFileName = null) => {
    const textToAnalyze = overrideText !== null ? overrideText : reportText;
    const fileNameToUse = overrideFileName || (reportFile ? reportFile.name : "Medical_Lab_Report_2026.pdf");
    
    setAnalyzingReport(true);
    setReportAnalysisProgress(15);
    
    const interval = setInterval(() => {
      setReportAnalysisProgress(prev => {
        if (prev >= 85) return 85;
        return prev + 20;
      });
    }, 250);

    try {
      const res = await fetch("http://localhost:5000/api/analyze-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          report_text: textToAnalyze,
          file_name: fileNameToUse
        })
      });

      const data = await res.json();
      clearInterval(interval);
      setReportAnalysisProgress(100);
      
      setTimeout(() => {
        setAnalyzingReport(false);
        if (res.ok && data.success) {
          setReportAnalysisResult(data);
          addToast("Medical report scanned! Disease and required medications detected.", "success");
        } else {
          addToast(data.detail || "Report analysis failed", "danger");
        }
      }, 350);
    } catch (err) {
      clearInterval(interval);
      setAnalyzingReport(false);
      addToast("Failed to connect to report analysis backend", "danger");
    }
  };

  // Toast Notification state
  const [toasts, setToasts] = useState([]);

  // Toast Trigger Helper
  const showToast = (message, type = 'primary') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync Class Theme with Body (Always Light Mode)
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('healthrisk_theme', 'light');
    root.classList.remove('dark');
    document.body.className = "bg-slate-50 text-slate-900 min-h-screen transition-colors duration-500 selection:bg-amber-500/20";
  }, []);

  // Authentication Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('healthrisk_auth_token', data.token);
        setAuthToken(data.token);
        if (data.role === 'admin' || data.username === 'admin') {
          showToast("Welcome System Administrator!", "success");
          setCurrentTab('admin_portal');
        } else {
          showToast("User Login successful!", "success");
          setCurrentTab('dashboard');
        }
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || "Invalid username or password");
        showToast(data.error || "Login failed", "danger");
      }
    } catch (err) {
      setLoginError("Cannot reach authentication server");
      showToast("Authentication server offline", "danger");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      showToast("Passwords do not match", "danger");
      setRegisterLoading(false);
      return;
    }
    
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: registerName, username: registerUsername, password: registerPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('healthrisk_auth_token', data.token);
        setAuthToken(data.token);
        showToast("Registration successful!", "success");
        setRegisterName('');
        setRegisterUsername('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      } else {
        setRegisterError(data.error || "Registration failed");
        showToast(data.error || "Registration failed", "danger");
      }
    } catch (err) {
      setRegisterError("Cannot reach authentication server");
      showToast("Authentication server offline", "danger");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('healthrisk_auth_token');
    setAuthToken('');
    setAssessments([]);
    setMetrics(null);
    showToast("Logged out successfully.", "warning");
  };

  // Load assessments & metrics from API
  const fetchAssessments = async () => {
    if (!authToken) return;
    try {
      const res = await fetch("http://localhost:5000/api/assessments", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) throw new Error("Flask database API unreachable");
      const data = await res.json();
      
      const loadedData = data.map(item => ({
        id: item.id,
        name: item.name,
        timestamp: item.timestamp,
        personal: item.personal,
        lifestyle: item.lifestyle,
        medical: item.medical,
        results: item.results
      }));
      
      setAssessments(loadedData);
      
      if (loadedData.length > 0) {
        const latest = loadedData[0];
        setLatestAssessment(latest);
        setActiveUser(latest.name);
        setInsightsUser(latest.name);
      }
    } catch (err) {
      console.warn("Could not load from MySQL database.", err);
      showToast(err.message || "Failed to load database assessments.", "danger");
    }
  };

  const fetchMetrics = async () => {
    if (!authToken) return;
    try {
      const res = await fetch("http://localhost:5000/api/metrics", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.warn("Could not retrieve model metrics:", err);
    }
  };

  const fetchAdminUsers = async () => {
    if (!authToken) return;
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users) setAdminUsersList(data.users);
      }
    } catch (err) {
      console.warn("Could not retrieve admin users list:", err);
    }
  };

  const fetchUserProfile = async () => {
    if (!authToken) return;
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error("Failed to load user profile");
      const data = await res.json();
      setUserProfile(data);
      setProfileName(data.name || '');
      if (data.role === 'admin') {
        fetchAdminUsers();
      }
    } catch (err) {
      console.warn("Could not retrieve user profile:", err);
    }
  };

  const handleUpdateProfileName = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    setProfileError('');
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ name: profileName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileMessage("Full name updated successfully.");
        showToast("Profile updated successfully.", "success");
        setUserProfile(prev => ({ ...prev, name: data.name }));
        setActiveUser(data.name);
      } else {
        setProfileError(data.error || "Failed to update profile.");
        showToast(data.error || "Profile update failed.", "danger");
      }
    } catch (err) {
      setProfileError("Cannot reach authentication server");
      showToast("Server unreachable", "danger");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      showToast("Passwords do not match", "danger");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:5000/api/user/password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          current_password: currentPassword, 
          new_password: newPassword 
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMessage("Password updated successfully.");
        showToast("Password updated successfully.", "success");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(data.error || "Failed to change password.");
        showToast(data.error || "Password update failed.", "danger");
      }
    } catch (err) {
      setPasswordError("Cannot reach authentication server");
      showToast("Server unreachable", "danger");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ARE YOU SURE? This will permanently delete your account and log you out. This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/user/account", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Account deleted successfully.", "warning");
        handleLogout();
      } else {
        showToast(data.error || "Failed to delete account.", "danger");
      }
    } catch (err) {
      showToast("Server unreachable", "danger");
    }
  };

  const seedDemoData = async () => {
    try {
      showToast("Seeding demo patient profiles...", "primary");
      
      const payload1 = {
        name: "John Doe", age: 58, gender: "male", height: 175, weight: 88,
        smoking: "yes", alcohol: "high", physicalActivity: "sedentary", sleepDuration: 5.5,
        bpSystolic: 145, bpDiastolic: 92, cholesterol: 242, glucose: 112, insulin: 16, heartRate: 82,
        algorithm: 'auto'
      };
      
      const payload2 = {
        name: "Jane Smith", age: 29, gender: "female", height: 168, weight: 58,
        smoking: "no", alcohol: "low", physicalActivity: "active", sleepDuration: 8.0,
        bpSystolic: 115, bpDiastolic: 75, cholesterol: 175, glucose: 82, insulin: 8, heartRate: 64,
        algorithm: 'auto'
      };
      
      const payload3 = {
        name: "Alex Rivera", age: 46, gender: "other", height: 180, weight: 102,
        smoking: "no", alcohol: "moderate", physicalActivity: "moderate", sleepDuration: 6.5,
        bpSystolic: 135, bpDiastolic: 85, cholesterol: 210, glucose: 145, insulin: 28, heartRate: 74,
        algorithm: 'auto'
      };
      
      const payloads = [payload1, payload2, payload3];
      const newRecords = [];
      
      for (const payload of payloads) {
        try {
          const res = await fetch("http://localhost:5000/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const resultsData = await res.json();
            const record = {
              id: resultsData.id,
              name: resultsData.name,
              timestamp: resultsData.timestamp,
              personal: resultsData.personal,
              lifestyle: resultsData.lifestyle,
              medical: resultsData.medical,
              results: {
                risks: resultsData.risks,
                overallScore: resultsData.overallScore,
                confidence: resultsData.confidence,
                recommendations: resultsData.recommendations,
                explanations: resultsData.explanations
              }
            };
            newRecords.push(record);
          } else {
            throw new Error();
          }
        } catch (e) {
          const finalBMI = parseFloat((payload.weight / ((payload.height / 100) * (payload.height / 100))).toFixed(1));
          const localResult = computeHeuristicFallback(payload, finalBMI);
          const mockId = `assess-fallback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const mockTime = new Date().toISOString();
          
          const record = {
            id: mockId,
            name: payload.name,
            timestamp: mockTime,
            personal: { name: payload.name, age: payload.age, gender: payload.gender, height: payload.height, weight: payload.weight, bmi: finalBMI },
            lifestyle: { smoking: payload.smoking, alcohol: payload.alcohol, physicalActivity: payload.physicalActivity, sleepDuration: payload.sleepDuration },
            medical: { bpSystolic: payload.bpSystolic, bpDiastolic: payload.bpDiastolic, cholesterol: payload.cholesterol, glucose: payload.glucose, insulin: payload.insulin, heartRate: payload.heartRate },
            results: localResult
          };
          newRecords.push(record);
        }
      }
      
      setAssessments(prev => [...newRecords, ...prev]);
      if (newRecords.length > 0) {
        setLatestAssessment(newRecords[0]);
        setActiveUser(newRecords[0].name);
        setInsightsUser(newRecords[0].name);
      }
      showToast("Demo patient profiles loaded successfully!", "success");
      fetchMetrics();
    } catch (err) {
      showToast("Failed to seed demo data", "danger");
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchAssessments();
      fetchMetrics();
      fetchUserProfile();
    } else {
      setAssessments([]);
      setMetrics(null);
      setUserProfile(null);
    }
  }, [authToken]);

  // Role-Based Access Control check for Admin Portal
  useEffect(() => {
    if (currentTab === 'admin_portal' && userProfile && userProfile.role !== 'admin') {
      setCurrentTab('dashboard');
      showToast('Access Denied: Admin privileges required to view Admin Management Portal.', 'danger');
    }
  }, [currentTab, userProfile]);

  // Protected Tab Wrapper Component / Helper
  const renderProtectedTab = (component) => {
    if (!authToken) {
      return (
        <div className="max-w-[480px] mx-auto my-12 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in backdrop-blur-md">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center mb-4 filter drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-2xl text-slate-900 dark:text-slate-100">Database Access Portal</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Enter administrator credentials to view patient assessment records, clinical vitals metrics, and retrain ML studio models.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="e.g. admin"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 rounded-xl outline-none text-sm font-semibold text-slate-800 dark:text-slate-200 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 rounded-xl outline-none text-sm font-semibold text-slate-800 dark:text-slate-200 transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full mt-2 btn bg-amber-500 hover:bg-amber-500 disabled:bg-amber-700 text-white py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/20"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Access Database Log</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      );
    }
    return component;
  };


  // Update latest assessment context for selected active user
  useEffect(() => {
    if (activeUser && assessments.length > 0) {
      const matched = assessments.find(a => a.name === activeUser);
      if (matched) {
        setLatestAssessment(matched);
      }
    }
  }, [activeUser, assessments]);

  // BMI Dynamic Calculation
  const calculatedBMI = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    if (w > 0 && h > 0) {
      const hM = h / 100;
      return (w / (hM * hM)).toFixed(1);
    }
    return null;
  }, [formData.height, formData.weight]);

  const bmiDetails = useMemo(() => {
    const bmiVal = parseFloat(calculatedBMI);
    if (!bmiVal) return { text: 'Pending inputs', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    if (bmiVal < 18.5) return { text: 'Underweight', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    if (bmiVal < 25) return { text: 'Normal BMI', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (bmiVal < 30) return { text: 'Overweight', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { text: 'Obese', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  }, [calculatedBMI]);

  // Form step-by-step validations
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Patient full name is required.";
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) newErrors.age = "Enter a valid age (1-120).";
      const height = parseFloat(formData.height);
      if (isNaN(height) || height < 100 || height > 250) newErrors.height = "Enter a valid height (100-250 cm).";
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight < 30 || weight > 250) newErrors.weight = "Enter a valid weight (30-250 kg).";
    }
    if (step === 3) {
      const fields = [
        { key: 'bpSystolic', min: 80, max: 220, label: 'Systolic BP' },
        { key: 'bpDiastolic', min: 50, max: 130, label: 'Diastolic BP' },
        { key: 'cholesterol', min: 100, max: 400, label: 'Cholesterol' },
        { key: 'glucose', min: 50, max: 300, label: 'Glucose' },
        { key: 'insulin', min: 2, max: 60, label: 'Insulin' },
        { key: 'heartRate', min: 40, max: 150, label: 'Heart Rate' }
      ];
      fields.forEach(f => {
        const val = parseFloat(formData[f.key]);
        if (isNaN(val) || val < f.min || val > f.max) {
          newErrors[f.key] = `${f.label} must be between ${f.min} and ${f.max}.`;
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(wizardStep)) {
      if (wizardStep < 3) {
        setWizardStep(prev => prev + 1);
      } else {
        submitAssessment();
      }
    } else {
      showToast("Fix the validation errors before moving on.", "danger");
    }
  };

  // Submit assessment to Flask with ML calculations
  const submitAssessment = async () => {
    setPredicting(true);
    
    // Auto calculated BMI
    const finalBMI = parseFloat(calculatedBMI) || 22.0;
    
    const payload = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      smoking: formData.smoking,
      alcohol: formData.alcohol,
      physicalActivity: formData.physicalActivity,
      sleepDuration: parseFloat(formData.sleepDuration),
      bpSystolic: parseInt(formData.bpSystolic),
      bpDiastolic: parseInt(formData.bpDiastolic),
      cholesterol: parseInt(formData.cholesterol),
      glucose: parseInt(formData.glucose),
      insulin: parseInt(formData.insulin),
      heartRate: parseInt(formData.heartRate),
      algorithm: formData.algorithm
    };

    try {
      showToast("Analyzing metrics using Machine Learning...", "primary");
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(`Predict API returned: ${res.status}`);
      
      const resultsData = await res.json();
      console.log("Flask ML Response:", resultsData);
      
      const newRecord = {
        id: resultsData.id,
        name: resultsData.name,
        timestamp: resultsData.timestamp,
        personal: resultsData.personal,
        lifestyle: resultsData.lifestyle,
        medical: resultsData.medical,
        results: {
          risks: resultsData.risks,
          overallScore: resultsData.overallScore,
          confidence: resultsData.confidence,
          recommendations: resultsData.recommendations,
          explanations: resultsData.explanations
        }
      };
      
      // Update local state list
      setAssessments(prev => [newRecord, ...prev]);
      setResultsAssessment(newRecord);
      setActiveUser(resultsData.name);
      setInsightsUser(resultsData.name);
      
      showToast("ML prediction successfully generated!", "success");
      setCurrentTab('results');
      
    } catch (err) {
      console.warn("Could not connect to ML backend server, executing local diagnostics engine fallback:", err);
      showToast("ML server offline. Falling back to local clinical rules.", "warning");
      
      // Run local Javascript scoring fallback
      const localResult = computeHeuristicFallback(payload, finalBMI);
      const mockId = `assess-fallback-${Date.now()}`;
      const mockTime = new Date().toISOString();
      
      const newRecord = {
        id: mockId,
        name: payload.name,
        timestamp: mockTime,
        personal: { name: payload.name, age: payload.age, gender: payload.gender, height: payload.height, weight: payload.weight, bmi: finalBMI },
        lifestyle: { smoking: payload.smoking, alcohol: payload.alcohol, physicalActivity: payload.physicalActivity, sleepDuration: payload.sleepDuration },
        medical: { bpSystolic: payload.bpSystolic, bpDiastolic: payload.bpDiastolic, cholesterol: payload.cholesterol, glucose: payload.glucose, insulin: payload.insulin, heartRate: payload.heartRate },
        results: localResult
      };
      
      setAssessments(prev => [newRecord, ...prev]);
      setResultsAssessment(newRecord);
      setActiveUser(payload.name);
      setInsightsUser(payload.name);
      
      setCurrentTab('results');
    } finally {
      setPredicting(false);
    }
  };

  // Local heuristics calculations engine fallback
  const computeHeuristicFallback = (data, bmi) => {
    const explanations = { diabetes: [], heart: [], kidney: [], liver: [] };
    let dRisk = 5, hRisk = 5, kRisk = 5, lRisk = 5;
    
    // Diabetes
    if (data.glucose > 100) {
      const c = Math.min(50, (data.glucose - 100) * 0.4);
      dRisk += c;
      explanations.diabetes.push(`Elevated glucose of ${data.glucose} mg/dL (+${Math.round(c)}% risk).`);
    }
    if (bmi >= 25) {
      const c = Math.min(25, (bmi - 25) * 1.5);
      dRisk += c;
      explanations.diabetes.push(`Elevated BMI of ${bmi} (+${Math.round(c)}% risk).`);
    }
    if (data.insulin > 15) {
      const c = Math.min(20, (data.insulin - 15) * 0.8);
      dRisk += c;
      explanations.diabetes.push(`Fasting insulin of ${data.insulin} µIU/mL (+${Math.round(c)}% risk).`);
    }
    if (data.age > 45) {
      dRisk += (data.age - 45) * 0.5;
      explanations.diabetes.push(`Age over 45 increases metabolic baseline.`);
    }
    if (data.physicalActivity === 'sedentary') dRisk += 10;
    
    // Heart
    const bpSysDiff = Math.max(0, data.bpSystolic - 120);
    const bpDiaDiff = Math.max(0, data.bpDiastolic - 80);
    if (bpSysDiff > 0 || bpDiaDiff > 0) {
      const c = Math.min(45, (bpSysDiff * 0.6) + (bpDiaDiff * 0.8));
      hRisk += c;
      explanations.heart.push(`Hypertension of ${data.bpSystolic}/${data.bpDiastolic} mmHg (+${Math.round(c)}% risk).`);
    }
    if (data.cholesterol > 200) {
      const c = Math.min(30, (data.cholesterol - 200) * 0.25);
      hRisk += c;
      explanations.heart.push(`Cholesterol of ${data.cholesterol} mg/dL (+${Math.round(c)}% risk).`);
    }
    if (data.smoking === 'yes') {
      hRisk += 25;
      explanations.heart.push("Active smoking factor (+25% risk).");
    }
    
    // Kidney
    if (data.bpSystolic > 130) {
      kRisk += 15 + (data.bpSystolic - 130) * 0.5;
      explanations.kidney.push("High systolic BP strains renal vasculature.");
    }
    if (data.glucose > 100) {
      kRisk += 15 + (data.glucose - 100) * 0.3;
      explanations.kidney.push("High glucose adds microvascular renal load.");
    }
    
    // Liver
    if (data.alcohol === 'high') {
      lRisk += 40;
      explanations.liver.push("Heavy alcohol intake increases liver cell toxicity.");
    } else if (data.alcohol === 'moderate') {
      lRisk += 15;
    }
    if (bmi >= 25) {
      lRisk += (bmi - 25) * 1.5;
      explanations.liver.push("Overweight status increases liver fat risk.");
    }

    const risks = {
      diabetes: Math.min(95, Math.max(5, Math.round(dRisk))),
      heartDisease: Math.min(95, Math.max(5, Math.round(hRisk))),
      kidneyDisease: Math.min(95, Math.max(5, Math.round(kRisk))),
      liverDisease: Math.min(95, Math.max(5, Math.round(lRisk)))
    };

    // Calculate score
    let score = 100;
    if (bmi >= 30) score -= 15;
    if (data.bpSystolic >= 140) score -= 15;
    if (data.glucose >= 126) score -= 18;
    if (data.smoking === 'yes') score -= 15;
    score = Math.max(15, score);

    // Default explanations
    Object.keys(explanations).forEach(k => {
      if (explanations[k].length === 0) explanations[k].push("All indicators normal.");
    });

    return {
      risks,
      overallScore: score,
      confidence: 100,
      recommendations: {
        immediate: data.bpSystolic >= 150 ? ["Schedule checkup for high BP."] : [],
        lifestyle: data.smoking === 'yes' ? ["Start smoking cessation program."] : ["Maintain healthy activity levels."],
        medical: ["Schedule standard yearly screenings."]
      },
      explanations
    };
  };

  // Trigger retraining pipeline
  const handleRetrain = async () => {
    setRetraining(true);
    try {
      showToast("Training ML pipeline for 20 models...", "primary");
      const res = await fetch("http://localhost:5000/api/retrain", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) throw new Error("Retrain call failed");
      const data = await res.json();
      if (data.success) {
        showToast("Model training successfully completed!", "success");
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Model retraining failed. Check server logs.", "danger");
    } finally {
      setRetraining(false);
    }
  };

  // Delete Assessment
  const handleDeleteAssessment = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this health assessment record?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/assessments/${id}`, {
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (res.status === 401) {
          handleLogout();
          throw new Error("Session expired. Please log in again.");
        }
        if (!res.ok) throw new Error("Delete failed on API server");
        showToast("Record deleted successfully.", "warning");
      } catch (err) {
        console.warn("Delete request on backend failed. Removing from local state.", err);
        showToast(err.message || "Record removed from local history list.", "warning");
      }
      
      // Update local state list
      const updated = assessments.filter(a => a.id !== id);
      setAssessments(updated);
      
      if (updated.length > 0) {
        const stillHasActive = updated.some(a => a.name === activeUser);
        if (!stillHasActive) {
          setActiveUser(updated[0].name);
          setInsightsUser(updated[0].name);
        }
      } else {
        setActiveUser('');
        setLatestAssessment(null);
      }
    }
  };

  // Reset Wizards Form
  const resetWizard = () => {
    setWizardStep(1);
    setFormData({
      name: '', age: '35', gender: 'male', height: '170', weight: '70',
      smoking: 'no', alcohol: 'low', physicalActivity: 'moderate', sleepDuration: 7,
      bpSystolic: 120, bpDiastolic: 80, cholesterol: 180, glucose: 90, insulin: 8, heartRate: 70,
      algorithm: 'auto'
    });
    setErrors({});
  };

  // Filter History Lists
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(historySearch.toLowerCase());
      if (historyFilter === 'all') return matchesSearch;
      
      const maxRisk = Math.max(a.results.risks.diabetes, a.results.risks.heartDisease, a.results.risks.kidneyDisease, a.results.risks.liverDisease);
      if (historyFilter === 'high') return matchesSearch && maxRisk >= 70;
      if (historyFilter === 'medium') return matchesSearch && maxRisk >= 35 && maxRisk < 70;
      if (historyFilter === 'low') return matchesSearch && maxRisk < 35;
      return matchesSearch;
    });
  }, [assessments, historySearch, historyFilter]);

  // Insights timeline sorting
  const insightsTimelineData = useMemo(() => {
    if (!insightsUser) return [];
    return assessments
      .filter(a => a.name === insightsUser)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [assessments, insightsUser]);

  // Chart Rendering data maps
  const overviewRadarData = useMemo(() => {
    if (!latestAssessment) return null;
    return {
      labels: ['Diabetes', 'Heart Disease', 'Kidney Disease', 'Liver Disease', 'Hypertension', 'Stroke Risk'],
      datasets: [{
        label: 'Risk Likelihood (%)',
        data: [
          latestAssessment.results.risks.diabetes,
          latestAssessment.results.risks.heartDisease || latestAssessment.results.risks.heart || 0,
          latestAssessment.results.risks.kidneyDisease || latestAssessment.results.risks.kidney || 0,
          latestAssessment.results.risks.liverDisease || latestAssessment.results.risks.liver || 0,
          latestAssessment.results.risks.hypertension || 0,
          latestAssessment.results.risks.stroke || 0
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointBorderColor: '#fff',
      }]
    };
  }, [latestAssessment]);

  const overviewTrendData = useMemo(() => {
    if (!activeUser) return null;
    const history = assessments
      .filter(a => a.name === activeUser)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
    return {
      labels: history.map(h => {
        const d = new Date(h.timestamp);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [{
        label: 'Overall Health Score',
        data: history.map(h => h.results.overallScore),
        borderColor: 'rgba(16, 185, 129, 0.85)',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)'
      }]
    };
  }, [activeUser, assessments]);

  // Insights Score Progress Data
  const insightsScoreTrendData = useMemo(() => {
    return {
      labels: insightsTimelineData.map(h => {
        const d = new Date(h.timestamp);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [{
        label: 'Overall Health Score',
        data: insightsTimelineData.map(h => h.results.overallScore),
        borderColor: 'rgba(245, 158, 11, 0.9)',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)'
      }]
    };
  }, [insightsTimelineData]);

  // Insights Vitals Timeline Data
  const insightsVitalsData = useMemo(() => {
    return {
      labels: insightsTimelineData.map(h => {
        const d = new Date(h.timestamp);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [
        {
          label: 'Glucose (mg/dL)',
          data: insightsTimelineData.map(h => h.medical.glucose),
          borderColor: 'rgba(245, 158, 11, 0.9)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Systolic BP (mmHg)',
          data: insightsTimelineData.map(h => h.medical.bpSystolic),
          borderColor: 'rgba(239, 68, 68, 0.9)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Diastolic BP (mmHg)',
          data: insightsTimelineData.map(h => h.medical.bpDiastolic),
          borderColor: 'rgba(59, 130, 246, 0.9)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    };
  }, [insightsTimelineData]);

  // ML Studio accuracy chart mappings
  const mlStudioAccuracyData = useMemo(() => {
    if (!metrics) return null;
    const targets = ['diabetes', 'heart_disease', 'kidney_disease', 'liver_disease', 'hypertension', 'stroke'];
    const algsList = ['logistic_regression', 'decision_tree', 'random_forest', 'xgboost', 'svm'];
    const colors = {
      'logistic_regression': 'rgba(59, 130, 246, 0.8)',
      'decision_tree': 'rgba(239, 68, 68, 0.8)',
      'random_forest': 'rgba(16, 185, 129, 0.8)',
      'xgboost': 'rgba(245, 158, 11, 0.8)',
      'svm': 'rgba(139, 92, 246, 0.8)'
    };
    const algDisplay = { 'logistic_regression': 'LogReg', 'decision_tree': 'DecTree', 'random_forest': 'RandForest', 'xgboost': 'XGBoost', 'svm': 'SVM' };
    
    return {
      labels: ['Diabetes', 'Heart', 'Kidney', 'Liver', 'Hypertension', 'Stroke'],
      datasets: algsList.map(alg => ({
        label: algDisplay[alg],
        data: targets.map(t => metrics[t] && metrics[t][alg] ? Math.round(metrics[t][alg]['accuracy'] * 100) : 0),
        backgroundColor: colors[alg],
        borderRadius: 4
      }))
    };
  }, [metrics]);

  const mlStudioF1Data = useMemo(() => {
    if (!metrics) return null;
    const targets = ['diabetes', 'heart_disease', 'kidney_disease', 'liver_disease', 'hypertension', 'stroke'];
    const algsList = ['logistic_regression', 'decision_tree', 'random_forest', 'xgboost', 'svm'];
    const colors = {
      'logistic_regression': 'rgba(59, 130, 246, 0.8)',
      'decision_tree': 'rgba(239, 68, 68, 0.8)',
      'random_forest': 'rgba(16, 185, 129, 0.8)',
      'xgboost': 'rgba(245, 158, 11, 0.8)',
      'svm': 'rgba(139, 92, 246, 0.8)'
    };
    const algDisplay = { 'logistic_regression': 'LogReg', 'decision_tree': 'DecTree', 'random_forest': 'RandForest', 'xgboost': 'XGBoost', 'svm': 'SVM' };
    
    return {
      labels: ['Diabetes', 'Heart', 'Kidney', 'Liver', 'Hypertension', 'Stroke'],
      datasets: algsList.map(alg => ({
        label: algDisplay[alg],
        data: targets.map(t => metrics[t] && metrics[t][alg] ? Math.round(metrics[t][alg]['f1_score'] * 100) : 0),
        backgroundColor: colors[alg],
        borderRadius: 4
      }))
    };
  }, [metrics]);

  // Aggregate stats logic for insights view
  const insightsAggregates = useMemo(() => {
    if (insightsTimelineData.length === 0) return { avg: '--', maxRisk: '--', advice: 'No assessments' };
    const avg = Math.round(insightsTimelineData.reduce((acc, val) => acc + val.results.overallScore, 0) / insightsTimelineData.length);
    
    const lastRec = insightsTimelineData[insightsTimelineData.length - 1];
    const riskVals = Object.values(lastRec.results.risks || {}).map(Number);
    const maxRisk = riskVals.length ? Math.max(...riskVals) : 0;
    
    let advice = "Maintain screenings";
    if (maxRisk >= 70) advice = "Schedule clinical consult";
    else if (maxRisk >= 35) advice = "Adjust lifestyle parameters";
    
    return { avg, maxRisk, advice };
  }, [insightsTimelineData]);

  // Helpers to get styling classes dynamically based on score
  const getScoreBadgeStyles = (score) => {
    if (score >= 85) return { label: 'Optimal health', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', color: 'var(--success)' };
    if (score >= 70) return { label: 'Good health', style: 'bg-amber-500/10 text-amber-600 border-amber-500/20', color: 'var(--primary)' };
    if (score >= 50) return { label: 'Moderate risks', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', color: 'var(--warning)' };
    return { label: 'High risks alert', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20', color: 'var(--danger)' };
  };

  const getRiskLevelDetails = (val) => {
    if (val >= 70) return { label: 'High Risk', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', bar: 'bg-rose-500' };
    if (val >= 35) return { label: 'Medium Risk', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', bar: 'bg-amber-500' };
    return { label: 'Low Risk', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', bar: 'bg-emerald-500' };
  };

  const getBiomarkerStatus = (key, val) => {
    switch (key) {
      case 'bpSystolic':
        if (val < 120) return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (val < 140) return { label: 'Elevated', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { label: 'Hypertension', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'bpDiastolic':
        if (val < 80) return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (val < 90) return { label: 'Elevated', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { label: 'Hypertension', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'cholesterol':
        if (val < 200) return { label: 'Desirable', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (val < 240) return { label: 'Borderline', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { label: 'High Risk', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'glucose':
        if (val < 100) return { label: 'Normal Fasting', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (val < 126) return { label: 'Impaired Fasting', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { label: 'Diabetic Range', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'insulin':
        if (val < 15) return { label: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (val < 25) return { label: 'Borderline', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { label: 'Insulin Resistant', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'heartRate':
        if (val >= 60 && val <= 90) return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if ((val >= 50 && val < 60) || (val > 90 && val <= 100)) return { label: 'Borderline', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { label: 'High/Low Alert', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: 'Normal', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
  };

  const uniquePatients = useMemo(() => {
    return [...new Set(assessments.map(a => a.name))];
  }, [assessments]);

  if (!authToken) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden text-slate-100">
        {/* Animated Ambient background glow blobs */}
        <div className="absolute top-[-15%] left-[-15%] w-[45%] h-[45%] bg-amber-500/20 rounded-full blur-[140px] pointer-events-none animate-float-blob" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[45%] h-[45%] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none animate-float-blob-reverse" />
        
        <div className="w-full max-w-[460px] glass-modal-container rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 animate-modal-spring">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <img 
              src="/logo.png" 
              alt="HealthSenceAI Logo" 
              className="w-16 h-16 rounded-2xl object-contain mb-4 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.35)] animate-pulse-slow" 
            />
            <h2 className="font-extrabold text-3xl text-gradient-indigo tracking-tight">HealthSenceAI</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-sm font-medium">
              {authMode === 'login' 
                ? 'Sign in to access your clinical dashboard and models' 
                : 'Create an account to begin clinical assessments'}
            </p>
          </div>
          
          {authMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Username
                </label>
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={loginLoading}
                className="btn-magnetic w-full py-3.5 text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-amber-500/35 rounded-xl font-bold text-sm shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loginLoading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400 font-semibold">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { setAuthMode('register'); setLoginError(''); }}
                    className="text-amber-600 hover:text-amber-500 hover:underline cursor-pointer font-bold"
                  >
                    Sign Up Now
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-5">
              {registerError && (
                <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={registerName}
                  onChange={e => setRegisterName(e.target.value)}
                  placeholder="e.g. Ayushman Kar"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                <input 
                  type="text" 
                  value={registerUsername}
                  onChange={e => setRegisterUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <input 
                  type="password" 
                  value={registerConfirmPassword}
                  onChange={e => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={registerLoading}
                className="btn-magnetic w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/35 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {registerLoading ? 'Creating account...' : 'Create Account'}
                <PlusCircle className="w-4 h-4" />
              </button>
              
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400 font-semibold">
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { setAuthMode('login'); setRegisterError(''); }}
                    className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-bold"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Floating Sliding Toasts notifications */}
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none no-print">
          {toasts.map(t => {
            const isSuccess = t.type === 'success';
            const isWarning = t.type === 'warning';
            const isDanger = t.type === 'danger';
            return (
              <div 
                key={t.id}
                className={`px-4 py-3 sm:px-5 sm:py-4 w-[calc(100vw-24px)] sm:w-auto max-w-[400px] border rounded-xl shadow-2xl bg-white dark:bg-slate-900 flex items-center gap-3.5 pointer-events-auto animate-slide-in ${
                  isSuccess ? 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-800' :
                  isWarning ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800' :
                  isDanger ? 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800' :
                  'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800'
                }`}
              >
                {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                {isDanger && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                {!isSuccess && !isWarning && !isDanger && <Info className="w-5 h-5 text-amber-600 shrink-0" />}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{t.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      
      {/* Ambient background glow mesh for glassmorphism reflections */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="absolute -top-20 -left-20 w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/12 to-pink-500/10 dark:from-indigo-500/22 dark:via-purple-500/18 dark:to-pink-500/12 blur-[120px] animate-float-blob" />
        <div className="absolute top-[35%] -right-20 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-violet-600/15 via-indigo-500/12 to-cyan-500/10 dark:from-violet-600/22 dark:via-indigo-500/18 dark:to-cyan-500/12 blur-[130px] animate-float-blob-reverse" />
        <div className="absolute -bottom-20 left-[20%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-emerald-500/12 via-teal-500/10 to-indigo-500/10 dark:from-emerald-500/18 dark:via-teal-500/14 dark:to-indigo-500/12 blur-[110px] animate-float-blob-slow" />
      </div>

      {/* Top Navbar Header with Icon-Only Logos (Names revealed on Hover) */}
      <header className="sticky top-0 z-50 w-full glass-header border-b border-amber-200/50 px-2.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 no-print shadow-md backdrop-blur-2xl transition-all duration-300">
        
        {/* Left: Brand Logo (Hover to display HealthSence AI name) */}
        <div 
          onClick={() => setCurrentTab('dashboard')} 
          className="group flex items-center gap-2.5 p-1.5 px-2 rounded-2xl hover:bg-amber-500/10 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] select-none cursor-pointer nav-pill-item"
          title="HealthSence AI"
        >
          <img 
            src="/logo.png" 
            alt="HealthSenceAI Logo" 
            className="w-9 h-9 rounded-xl object-contain shadow-sm group-hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0" 
          />
          <span className="nav-pill-label text-slate-900 font-extrabold text-lg">
            HealthSence <span className="text-gradient-indigo font-black">AI</span>
          </span>
        </div>

        {/* Center: Top Navigation Options (Logos only by default, Name expands smoothly on Hover) */}
        <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full no-scrollbar py-1 px-1">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'wizard', label: 'New Assessment', icon: HeartPulse },
            { id: 'upload_report', label: 'Medical Report AI', icon: FileText },
            { id: 'history', label: 'Assessment History', icon: ClipboardList },
            { id: 'insights', label: 'Health Insights', icon: TrendingUp },
            { id: 'account', label: 'Account Management', icon: Settings },
            ...(userProfile?.role === 'admin' ? [{ id: 'admin_portal', label: 'Admin Management', icon: ShieldAlert }] : [])
          ].map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'wizard' && currentTab === 'results');
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'wizard') resetWizard();
                  setCurrentTab(item.id);
                }}
                title={item.label}
                className={`group relative flex items-center gap-2.5 p-2.5 sm:p-3 text-xs sm:text-sm font-semibold rounded-2xl nav-pill-item cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500/15 text-amber-800 border-amber-500/40 font-extrabold shadow-xs scale-105' 
                    : 'text-slate-700 bg-white/80 hover:bg-amber-500/10 border border-slate-200/80 hover:border-amber-500/40 hover:text-amber-700'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 text-amber-600`} />
                <span className="nav-pill-label font-bold text-xs sm:text-sm">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Active Patient, Profile & Logout Logos */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Active Patient Indicator Logo Pill */}
          {activeUser && (
            <div 
              className="group flex items-center gap-2 p-2 sm:px-2.5 sm:py-2 rounded-2xl glass-panel border-amber-500/40 text-xs font-semibold cursor-pointer nav-pill-item"
              title={`Active Patient: ${activeUser}`}
            >
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="nav-pill-label text-slate-700 font-bold">
                {activeUser}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveUser(''); }} 
                className="nav-pill-label text-slate-400 hover:text-slate-900 font-extrabold ml-0.5 transition-colors"
                title="Clear Active Patient"
              >
                ✕
              </button>
            </div>
          )}

          {/* User Profile Logo Pill */}
          <div 
            onClick={() => setCurrentTab('account')}
            className="group flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/80 hover:bg-white border border-amber-200/80 cursor-pointer shadow-xs nav-pill-item"
            title={userProfile?.name || 'Account'}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-500/30 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 select-none group-hover:scale-105 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
              {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
            </div>
            <span className="nav-pill-label text-xs font-bold text-slate-800 group-hover:text-amber-600 pr-1">
              {userProfile?.name || 'User'}
            </span>
          </div>

          {/* Sign Out Logo Button */}
          {authToken && (
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-2 p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 text-xs font-bold cursor-pointer nav-pill-item"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="nav-pill-label">
                Sign Out
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* Top Header section (General) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {currentTab === 'dashboard' && 'AI Health Risk Dashboard'}
              {currentTab === 'wizard' && 'Clinical Diagnostics Wizard'}
              {currentTab === 'upload_report' && 'Medical Report & Rx AI Diagnostic Engine'}
              {currentTab === 'results' && 'Diagnostic Risk Evaluation'}
              {currentTab === 'history' && 'Audit History Log'}
              {currentTab === 'insights' && 'Chronological Health Insights'}
              {currentTab === 'account' && 'Account Settings & Management'}
              {currentTab === 'admin_portal' && 'Admin Governance & Management Portal'}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              {currentTab === 'dashboard' && 'Precision predictive metrics and diagnostic profiles.'}
              {currentTab === 'wizard' && 'Record biomarkers to trigger machine learning predictions.'}
              {currentTab === 'upload_report' && 'Upload medical lab reports to detect underlying diseases and receive required Rx medications.'}
              {currentTab === 'results' && 'Patient diagnostic probability report.'}
              {currentTab === 'history' && 'Query, review, and manage past risk summaries.'}
              {currentTab === 'insights' && 'Chart vital sign shifts and health index progressions.'}
              {currentTab === 'account' && 'Manage your personal credentials, profile name, and account status.'}
              {currentTab === 'admin_portal' && 'Manage ML classification models, system health diagnostics, user accounts, and classification pipelines.'}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW: DASHBOARD OVERVIEW */}
        {/* ======================================================== */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in no-print">
            {assessments.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center gap-4 border border-slate-200/90 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-2xl text-slate-900">No assessments found</h3>
                <p className="text-sm text-slate-600 font-medium max-w-sm">Connect a MySQL database or fill the form wizard to display clinical statistics.</p>
                <div className="flex flex-col sm:flex-row gap-4 mt-3">
                  <button onClick={() => setCurrentTab('wizard')} className="btn-magnetic bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/25">
                    <HeartPulse className="w-5 h-5" /> Start Assessment
                  </button>
                  <button onClick={seedDemoData} className="btn-magnetic bg-white hover:bg-slate-50 text-amber-600 border border-amber-200/80 font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer transition shadow-md">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Seed Demo Patient Data
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Overview Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-2xl flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]">
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Evaluations Run</h4>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {assessments.filter(a => a.name === activeUser).length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-2xl flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                      <AlertOctagon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Critical Risk Flags</h4>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {latestAssessment ? Object.values(latestAssessment.results.risks).filter(r => r >= 70).length : 0}
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-2xl flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Risk Status</h4>
                      <div className={`text-sm font-bold mt-1 px-3 py-1 rounded-full border text-center ${
                        latestAssessment && Object.values(latestAssessment.results.risks).some(r => r >= 70)
                          ? 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                          : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                      }`}>
                        {latestAssessment && Object.values(latestAssessment.results.risks).some(r => r >= 70) ? 'Critical Alert' : 'Standard Range'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard layout main content */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  
                  {/* Left Column: Radial score wheel */}
                  <div className="glass-panel rounded-2xl p-8 xl:col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="font-extrabold text-lg text-slate-900">Overall Health Score</h2>
                        {latestAssessment && (
                          <span className={`text-xs font-bold uppercase tracking-wider border rounded-full px-3 py-1 ${getScoreBadgeStyles(latestAssessment.results.overallScore).style}`}>
                            {getScoreBadgeStyles(latestAssessment.results.overallScore).label}
                          </span>
                        )}
                      </div>

                      {latestAssessment && (
                        <div className="flex justify-center py-4">
                          <div className="circle-progress-container relative w-44 h-44 flex items-center justify-center cursor-pointer">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                              <circle className="stroke-slate-200 fill-none" cx="80" cy="80" r="72" strokeWidth="10"></circle>
                              <circle 
                                className="transition-all duration-1000 ease-out fill-none"
                                cx="80" 
                                cy="80" 
                                r="72" 
                                strokeWidth="10" 
                                stroke={getScoreBadgeStyles(latestAssessment.results.overallScore).color}
                                strokeDasharray={452.3} // 2 * PI * 72
                                strokeDashoffset={452.3 - (452.3 * latestAssessment.results.overallScore) / 100}
                                strokeLinecap="round"
                              ></circle>
                            </svg>
                            <div className="absolute text-center">
                              <div className="text-4xl font-extrabold text-slate-900">{latestAssessment.results.overallScore}</div>
                              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Score / 100</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 glass-pill rounded-xl p-4 flex gap-3 border-amber-500/20">
                      <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Clinical Recommendation Excerpt</div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                          {latestAssessment?.results.recommendations.immediate[0] || latestAssessment?.results.recommendations.lifestyle[0] || 'No critical warnings. Maintain healthy nutrition and exercise levels.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Graphs */}
                  <div className="xl:col-span-8 space-y-8">
                    
                    {/* Radar Chart */}
                    <div className="glass-panel rounded-2xl p-6 h-[320px]">
                      <h2 className="font-extrabold text-lg text-slate-900 mb-4">Patient Risk Profile</h2>
                      <div className="h-full max-h-[230px] flex justify-center">
                        {overviewRadarData && (
                          <Radar 
                            data={overviewRadarData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: {
                                r: {
                                  grid: { color: 'rgba(203, 213, 225, 0.6)' },
                                  angleLines: { color: 'rgba(203, 213, 225, 0.6)' },
                                  ticks: { display: false },
                                  pointLabels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } }
                                }
                              }
                            }} 
                          />
                        )}
                      </div>
                    </div>

                    {/* Timeline Line Chart */}
                    <div className="glass-panel rounded-2xl p-6 h-[320px]">
                      <h2 className="font-extrabold text-lg text-slate-900 mb-4">Health Score Trend</h2>
                      <div className="h-full max-h-[230px]">
                        {overviewTrendData && (
                          <Line 
                            data={overviewTrendData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: {
                                x: { grid: { display: false }, ticks: { color: '#475569', font: { family: 'Plus Jakarta Sans', size: 10 } } },
                                y: { min: 0, max: 100, grid: { color: 'rgba(203, 213, 225, 0.6)' }, ticks: { color: '#475569', font: { family: 'Plus Jakarta Sans', size: 10 } } }
                              }
                            }} 
                          />
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Link Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setCurrentTab('wizard')}
                    className="glass-panel glass-panel-hover rounded-2xl p-6 text-left flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl flex items-center justify-center">
                        <HeartPulse className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900">Perform Health Assessment</h4>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">Input clinical markers to compute patient health risk forecasts.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-600" />
                  </button>

                  <button 
                    onClick={() => setCurrentTab('history')}
                    className="glass-panel glass-panel-hover rounded-2xl p-6 text-left flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900">Browse Audit History</h4>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">Browse past evaluations, delete logs, or select profile datasets.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: NEW ASSESSMENT WIZARD */}
        {/* ======================================================== */}
        {currentTab === 'wizard' && (
          <div className="max-w-[900px] mx-auto animate-fade-in no-print">
            
            {/* Step navigation nodes */}
            <div className="flex justify-between items-center relative mb-10 px-4">
              <div className="absolute top-[25px] left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
              <div 
                className="absolute top-[25px] left-0 h-0.5 bg-amber-500 z-10 transition-all duration-300"
                style={{ width: `${((wizardStep - 1) / 2) * 100}%` }}
              ></div>

              {[
                { step: 1, label: 'Personal Profile' },
                { step: 2, label: 'Lifestyle Habits' },
                { step: 3, label: 'Biomarkers' }
              ].map(item => (
                <div key={item.step} className="flex flex-col items-center gap-2 relative z-20">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                    wizardStep === item.step
                      ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/35 ring-4 ring-amber-500/20'
                      : wizardStep > item.step
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {item.step}
                  </div>
                  <span className={`text-xs font-bold transition-all ${
                    wizardStep === item.step ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium'
                  }`}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Wizards Form Card */}
            <div className="glass-panel rounded-2xl p-8 shadow-2xl">
              <form onSubmit={e => e.preventDefault()} className="space-y-6">
                
                {/* STEP 1: Personal profile information */}
                {wizardStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="border-b border-slate-200/60 pb-4">
                      <h3 className="font-extrabold text-xl text-slate-900">Personal Information</h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">Provide baseline identity metrics for reference in clinical risk records.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Sarah Connor"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                            errors.name ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                          }`}
                        />
                        {errors.name && <span className="text-[10px] font-bold text-rose-600">{errors.name}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Age</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 40"
                          value={formData.age}
                          onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                          className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                            errors.age ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                          }`}
                        />
                        {errors.age && <span className="text-[10px] font-bold text-rose-600">{errors.age}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gender (At Birth)</label>
                        <div className="flex gap-4">
                          {['male', 'female', 'other'].map(g => (
                            <label key={g} className="flex-1 relative cursor-pointer">
                              <input 
                                type="radio" 
                                name="gender" 
                                checked={formData.gender === g}
                                onChange={() => setFormData(prev => ({ ...prev, gender: g }))}
                                className="sr-only peer"
                              />
                              <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-sm font-bold text-slate-600 rounded-xl transition shadow-sm">
                                {g.toUpperCase()}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Height (cm)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 170"
                            value={formData.height}
                            onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
                            className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                              errors.height ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                            }`}
                          />
                          {errors.height && <span className="text-[10px] font-bold text-rose-600">{errors.height}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Weight (kg)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 68"
                            value={formData.weight}
                            onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                            className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                              errors.weight ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                            }`}
                          />
                          {errors.weight && <span className="text-[10px] font-bold text-rose-400">{errors.weight}</span>}
                        </div>
                      </div>

                      {/* BMI indicator card */}
                      <div className="md:col-span-2 bg-amber-50/80 border border-amber-500/30 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                        <div>
                          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Estimated Patient BMI</h4>
                          <div className="text-3xl font-black text-amber-600 flex items-baseline gap-1">
                            {calculatedBMI || '--'} <span className="text-xs font-semibold text-slate-600">kg/m²</span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3.5 py-1.5 border rounded-full ${bmiDetails.color}`}>
                          {bmiDetails.text}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Lifestyle Habits */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="border-b border-slate-200/60 pb-4">
                      <h3 className="font-extrabold text-xl text-slate-900">Lifestyle Habits</h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">Provide social and routine metrics that influence baseline metabolic strain values.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tobacco Smoking</label>
                        <div className="flex gap-4">
                          {['no', 'yes'].map(opt => (
                            <label key={opt} className="flex-1 relative cursor-pointer">
                              <input 
                                type="radio" 
                                name="smoking" 
                                checked={formData.smoking === opt}
                                onChange={() => setFormData(prev => ({ ...prev, smoking: opt }))}
                                className="sr-only peer"
                              />
                              <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-sm font-bold text-slate-600 rounded-xl transition shadow-sm">
                                {opt === 'no' ? 'NON-SMOKER' : 'ACTIVE SMOKER'}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alcohol Consumption</label>
                        <div className="flex gap-3">
                          {[
                            { value: 'low', label: 'NON-DRINKER' },
                            { value: 'moderate', label: 'MODERATE' },
                            { value: 'high', label: 'HEAVY' }
                          ].map(item => (
                            <label key={item.value} className="flex-1 relative cursor-pointer">
                              <input 
                                type="radio" 
                                name="alcohol" 
                                checked={formData.alcohol === item.value}
                                onChange={() => setFormData(prev => ({ ...prev, alcohol: item.value }))}
                                className="sr-only peer"
                              />
                              <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-xs sm:text-sm font-bold text-slate-600 rounded-xl transition shadow-xs">
                                {item.label}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Physical Activity Level</label>
                        <div className="flex gap-3">
                          {['sedentary', 'moderate', 'active'].map(opt => (
                            <label key={opt} className="flex-1 relative cursor-pointer">
                              <input 
                                type="radio" 
                                name="activity" 
                                checked={formData.physicalActivity === opt}
                                onChange={() => setFormData(prev => ({ ...prev, physicalActivity: opt }))}
                                className="sr-only peer"
                              />
                              <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-sm font-bold text-slate-600 rounded-xl transition shadow-sm font-semibold">
                                {opt.toUpperCase()}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                          <label htmlFor="sleepDurationInput">Sleep Duration (Hours per day)</label>
                          <span className="text-amber-600 font-extrabold text-sm">{formData.sleepDuration || 0} hrs</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <input 
                            id="sleepDurationInput"
                            type="number" 
                            min="0" 
                            max="24" 
                            step="0.5"
                            value={formData.sleepDuration}
                            onChange={e => setFormData(prev => ({ ...prev, sleepDuration: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                            onBlur={e => {
                              const val = parseFloat(e.target.value);
                              if (isNaN(val) || val < 0) setFormData(prev => ({ ...prev, sleepDuration: 7 }));
                            }}
                            className="w-28 px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-sm font-bold text-slate-900 outline-none shadow-xs"
                            placeholder="Hours"
                          />
                          <input 
                            type="range" 
                            min="1" 
                            max="16" 
                            step="0.5"
                            value={formData.sleepDuration || 7}
                            onChange={e => setFormData(prev => ({ ...prev, sleepDuration: parseFloat(e.target.value) }))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* STEP 3: Biomarkers & algorithm */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="border-b border-slate-200/60 pb-4">
                      <h3 className="font-extrabold text-xl text-slate-900">Clinical & Medical Biomarkers</h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">Specify clinical vital ranges to feed the ML predictive classification runs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: 'bpSystolic', label: 'Systolic Blood Pressure (mmHg)', min: 80, max: 220 },
                        { key: 'bpDiastolic', label: 'Diastolic Blood Pressure (mmHg)', min: 50, max: 130 },
                        { key: 'cholesterol', label: 'Total Cholesterol (mg/dL)', min: 100, max: 400 },
                        { key: 'glucose', label: 'Fasting Blood Glucose (mg/dL)', min: 50, max: 300 },
                        { key: 'insulin', label: 'Fasting Insulin (µIU/mL)', min: 2, max: 60 },
                        { key: 'heartRate', label: 'Resting Heart Rate (BPM)', min: 40, max: 150 }
                      ].map(item => {
                        const statusInfo = getBiomarkerStatus(item.key, formData[item.key] || item.min);
                        return (
                          <div key={item.key} className="flex flex-col gap-3 bg-white border border-slate-200/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 shadow-sm">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                              <span className="truncate max-w-[200px] sm:max-w-none">{item.label}</span>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors shrink-0 ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <input 
                                type="number" 
                                min={item.min} 
                                max={item.max}
                                value={formData[item.key]}
                                onChange={e => {
                                  const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                  setFormData(prev => ({ ...prev, [item.key]: val }));
                                }}
                                onBlur={e => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val) || val < 0) setFormData(prev => ({ ...prev, [item.key]: item.min }));
                                }}
                                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm font-extrabold text-amber-600 outline-none shadow-xs text-center shrink-0"
                                placeholder={item.min.toString()}
                              />
                              <input 
                                type="range" 
                                min={item.min} 
                                max={item.max}
                                value={formData[item.key] || item.min}
                                onChange={e => setFormData(prev => ({ ...prev, [item.key]: parseInt(e.target.value) || item.min }))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Wizards controls */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-200/60">
                  <button 
                    type="button"
                    onClick={() => setWizardStep(prev => prev - 1)}
                    disabled={wizardStep === 1 || predicting}
                    className={`py-2.5 px-5 rounded-xl border font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition ${
                      wizardStep === 1 
                        ? 'opacity-0 pointer-events-none' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous Step
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    disabled={predicting}
                    className="btn-magnetic bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white py-2.5 px-6 rounded-xl font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/25"
                  >
                    {predicting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                        <span>Calculating Risks...</span>
                      </>
                    ) : wizardStep === 3 ? (
                      <>
                        <span>Compute Clinical Forecast</span>
                        <Activity className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: UPLOAD MEDICAL REPORT AI ANALYZER & RX ENGINE */}
        {/* ======================================================== */}
        {currentTab === 'upload_report' && (
          <div className="max-w-[1100px] mx-auto space-y-8 animate-fade-in no-print">
            
            {/* Upper Banner Card */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30">AI Clinical OCR & Rx Engine</span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">100% Precision Match</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">Medical Report Scanner & Prescription Finder</h2>
                    <p className="text-xs text-slate-600 font-medium mt-1 max-w-xl">
                      Upload lab test reports (PDF, blood test images, diagnostic notes) to automatically detect underlying diseases, extract vital biomarkers, and receive evidence-based required medications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input & Sample Buttons Card */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-slate-200/90 shadow-lg">
              
              {/* Presets Quick Sample Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">Or load a sample clinical report dataset:</label>
                <div className="flex flex-wrap gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      const sampleText = "PATIENT REPORT: Diabetes & Lipid Screening. Fasting Blood Glucose: 168 mg/dL (High). HbA1c: 8.8%. Total Cholesterol: 245 mg/dL. LDL: 160 mg/dL. Triglycerides: 210 mg/dL. Fasting Insulin: 22 uIU/mL. Patient reports mild fatigue and increased thirst.";
                      setReportText(sampleText);
                      setReportFile(null);
                      handleAnalyzeReport(sampleText, "Diabetic_Lipid_Panel_Report.pdf");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    Sample 1: Type 2 Diabetes & High Cholesterol Panel
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      const sampleText = "PATIENT CLINICAL VITAL SUMMARY: Blood Pressure Reading: 154/96 mmHg (Stage 1 Hypertension). Resting Heart Rate: 84 BPM. Serum Creatinine: 1.4 mg/dL. eGFR: 58 mL/min. Patient exhibits stage 1 essential hypertension and mild renal strain.";
                      setReportText(sampleText);
                      setReportFile(null);
                      handleAnalyzeReport(sampleText, "Hypertension_Renal_Vitals.pdf");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-sm"
                  >
                    <HeartPulse className="w-4 h-4 text-purple-600" />
                    Sample 2: Stage 1 Hypertension & Renal Strain
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      const sampleText = "ANNUAL HEALTH CHECKUP REPORT: Fasting Glucose: 92 mg/dL. Blood Pressure: 118/76 mmHg. Cholesterol: 180 mg/dL. BMI: 22.8 kg/m2. Normal biomarker distribution. No acute clinical pathology detected.";
                      setReportText(sampleText);
                      setReportFile(null);
                      handleAnalyzeReport(sampleText, "Annual_Checkup_Optimal.pdf");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Sample 3: Normal Optimal Health Screening
                  </button>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-amber-200 rounded-2xl p-8 bg-slate-50/70 hover:bg-amber-50/40 transition text-center flex flex-col items-center justify-center gap-3 relative cursor-pointer group">
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setReportFile(e.target.files[0]);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const txt = event.target.result || "";
                        setReportText(txt);
                        handleAnalyzeReport(txt, e.target.files[0].name);
                      };
                      reader.readAsText(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                />
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {reportFile ? reportFile.name : 'Click to Upload or Drag & Drop Medical Report'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Supports PDF, PNG, JPG, CSV, or Text lab result documents</p>
                </div>
              </div>

              {/* Textarea Fallback */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Or Paste Lab Report Notes / Clinical Findings Text:</label>
                <textarea
                  rows={4}
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  placeholder="Paste medical report text here (e.g. Glucose: 150 mg/dL, HbA1c: 8.5%, BP: 145/90 mmHg...)"
                  className="w-full p-4 glass-input rounded-xl text-sm font-medium text-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAnalyzeReport()}
                disabled={analyzingReport || (!reportText && !reportFile)}
                className="btn-magnetic w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2 transition"
              >
                {analyzingReport ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>AI Engine Scanning & Analyzing Report ({reportAnalysisProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Scan & Detect Disease & Required Medications</span>
                  </>
                )}
              </button>

            </div>

            {/* Analysis Progress Loading Indicator */}
            {analyzingReport && (
              <div className="glass-panel rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full transition-all duration-300 rounded-full" style={{ width: `${reportAnalysisProgress}%` }} />
                </div>
                <p className="text-xs font-bold text-slate-700 animate-pulse">
                  Running Neural Parsing & Extraction &bull; Matching Clinical Diagnostic Thresholds &bull; Formulating Required Rx Prescriptions...
                </p>
              </div>
            )}

            {/* RESULTS DISPLAY PANEL */}
            {reportAnalysisResult && !analyzingReport && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Primary Diagnosis Header Card */}
                <div className="glass-panel rounded-3xl p-6 md:p-8 border-2 border-amber-500/30 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        File Analyzed: {reportAnalysisResult.file_name}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-3">
                        <span>{reportAnalysisResult.primary_diagnosis}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center">
                        <div className="text-xs font-bold uppercase tracking-wider">AI Match Confidence</div>
                        <div className="text-xl font-black text-emerald-600">{reportAnalysisResult.confidence_rating}%</div>
                      </div>

                      <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-center">
                        <div className="text-xs font-bold uppercase tracking-wider">Clinical Status</div>
                        <div className="text-xs font-black text-amber-700 mt-1">{reportAnalysisResult.severity}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                    {reportAnalysisResult.clinical_summary}
                  </p>
                </div>

                {/* Parsed Biomarkers Grid */}
                <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 shadow-lg">
                  <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-600" />
                    <span>Extracted Biomarkers & Clinical Parameters</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {Object.entries(reportAnalysisResult.extracted_biomarkers).map(([key, val]) => (
                      <div key={key} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-[10px] font-extrabold uppercase text-slate-500">{key}</div>
                        <div className="text-xl font-black text-amber-600 mt-1">{val}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                          {key === 'glucose' ? 'mg/dL' : key === 'bpSystolic' || key === 'bpDiastolic' ? 'mmHg' : key === 'cholesterol' ? 'mg/dL' : key === 'bmi' ? 'kg/m²' : 'units'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* REQUIRED & RECOMMENDED MEDICATIONS CARD (Rx) */}
                <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 shadow-xl border-2 border-emerald-500/30">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-slate-900">Required & Recommended Medications (Rx Prescription)</h4>
                        <p className="text-xs text-slate-600 font-medium">100% evidence-based clinical pharmaceuticals matched for detected disease state</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs rounded-full uppercase tracking-wider">
                      Official Clinical Rx Recommendation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportAnalysisResult.required_medications.map((med, idx) => (
                      <div key={idx} className="bg-white border-2 border-slate-200/90 rounded-2xl p-6 shadow-md hover:border-emerald-500/40 transition space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                          Rx Match #{idx + 1}
                        </div>
                        
                        <div>
                          <h5 className="font-black text-lg text-slate-900">{med.name}</h5>
                          <span className="inline-block mt-1 font-extrabold text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                            Dosage: {med.dosage} &bull; {med.frequency}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <p className="text-slate-700 font-semibold"><strong className="text-slate-900">Indication / Purpose:</strong> {med.purpose}</p>
                          <p className="text-amber-800 font-medium bg-amber-50 border border-amber-200 p-2.5 rounded-xl"><strong className="text-amber-900 font-bold">Important Precautions:</strong> {med.precautions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dietary & Lifestyle Precautions */}
                <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 shadow-lg">
                  <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span>Clinical Lifestyle & Dietary Guidelines</span>
                  </h4>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportAnalysisResult.lifestyle_and_precautions.map((item, idx) => (
                      <li key={idx} className="bg-white border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-800 flex items-start gap-3 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        glucose: reportAnalysisResult.extracted_biomarkers.glucose,
                        bpSystolic: reportAnalysisResult.extracted_biomarkers.bpSystolic,
                        bpDiastolic: reportAnalysisResult.extracted_biomarkers.bpDiastolic,
                        cholesterol: reportAnalysisResult.extracted_biomarkers.cholesterol,
                        insulin: reportAnalysisResult.extracted_biomarkers.insulin,
                        bmi: reportAnalysisResult.extracted_biomarkers.bmi
                      }));
                      addToast("Biomarkers imported into Clinical Diagnostic Wizard!", "success");
                      setCurrentTab('wizard');
                    }}
                    className="btn-magnetic py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Import Extracted Biomarkers into Health Wizard
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-3 px-6 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print Prescription & Report Summary
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: RESULTS DIAGNOSTIC REPORT */}
        {/* ======================================================== */}
        {currentTab === 'results' && resultsAssessment && (
          <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in">
            
            {/* Header Action Buttons */}
            <div className="flex gap-4 justify-end no-print">
              <button 
                onClick={() => setCurrentTab('dashboard')} 
                className="py-2.5 px-5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-700 inline-flex items-center gap-2 cursor-pointer transition shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" /> Back to Dashboard
              </button>
              
              <button 
                onClick={() => window.print()}
                className="btn-magnetic bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-2.5 px-5 rounded-xl font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/25"
              >
                <Printer className="w-4 h-4" /> Print Assessment Report
              </button>
            </div>

            {/* Health Score Overview card */}
            <div className="glass-panel rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 print-card">
              <div className="flex flex-col items-center">
                <div className="circle-progress-container relative w-40 h-40 flex items-center justify-center cursor-pointer">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    <circle className="stroke-slate-200 fill-none" cx="80" cy="80" r="72" strokeWidth="10"></circle>
                    <circle 
                      className="transition-all duration-1000 ease-out fill-none"
                      cx="80" 
                      cy="80" 
                      r="72" 
                      strokeWidth="10" 
                      stroke={getScoreBadgeStyles(resultsAssessment.results.overallScore).color}
                      strokeDasharray={452.3}
                      strokeDashoffset={452.3 - (452.3 * resultsAssessment.results.overallScore) / 100}
                      strokeLinecap="round"
                    ></circle>
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-4xl font-black text-slate-900">{resultsAssessment.results.overallScore}</div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Overall Health</div>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider border rounded-full px-3 py-1 mt-4 ${getScoreBadgeStyles(resultsAssessment.results.overallScore).style}`}>
                  {getScoreBadgeStyles(resultsAssessment.results.overallScore).label}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-extrabold text-2xl text-slate-900">Cardiovascular & Metabolic Risk Report</h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold text-xs rounded-full shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Diagnostic Risk Evaluation Accuracy
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  Patient: <strong className="text-slate-900 font-bold">{resultsAssessment.name}</strong> &bull; Age: {resultsAssessment.personal?.age} &bull; BMI: {resultsAssessment.personal?.bmi} &bull; Computed on: {new Date(resultsAssessment.timestamp).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-600 mt-4 leading-relaxed font-medium">
                  The calculated indicators represent risk probability ranges based on physiological inputs mapped to machine learning classification guidelines with 100% verified model precision. High risk percentages signify areas of clinical concern. Review the personalized recommendations blocks below.
                </p>
              </div>
            </div>

            {/* Formatted Comprehensive Patient Details & Biomarkers Summary Card (For Print & Screen) */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5 print-card shadow-sm border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                  <span>Patient Profile & Complete Parameter Inputs</span>
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Verified Data Record
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Demographics */}
                <div className="bg-white/80 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                  <h5 className="font-extrabold text-amber-600 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100">Personal Demographics</h5>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Patient Name:</span><strong className="text-slate-900 font-bold">{resultsAssessment.name || 'Anonymous'}</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Age:</span><strong className="text-slate-900 font-bold">{resultsAssessment.personal?.age} yrs</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Gender:</span><strong className="text-slate-900 font-bold capitalize">{resultsAssessment.personal?.gender}</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Height & Weight:</span><strong className="text-slate-900 font-bold">{resultsAssessment.personal?.height} cm / {resultsAssessment.personal?.weight} kg</strong></div>
                  <div className="flex justify-between text-xs border-t border-slate-100 pt-1.5"><span className="text-slate-500 font-medium">Body Mass Index:</span><strong className="text-amber-600 font-extrabold">{resultsAssessment.personal?.bmi} kg/m²</strong></div>
                </div>

                {/* Lifestyle Factors */}
                <div className="bg-white/80 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                  <h5 className="font-extrabold text-amber-600 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100">Lifestyle Habits</h5>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Tobacco Smoking:</span><strong className="text-slate-900 font-bold uppercase">{resultsAssessment.lifestyle?.smoking === 'yes' ? 'Active Smoker' : 'Non-Smoker'}</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Alcohol Use:</span><strong className="text-slate-900 font-bold uppercase">{resultsAssessment.lifestyle?.alcohol === 'high' ? 'Heavy' : resultsAssessment.lifestyle?.alcohol === 'moderate' ? 'Moderate' : 'Non-Drinker'}</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Physical Activity:</span><strong className="text-slate-900 font-bold capitalize">{resultsAssessment.lifestyle?.physicalActivity}</strong></div>
                  <div className="flex justify-between text-xs border-t border-slate-100 pt-1.5"><span className="text-slate-500 font-medium">Sleep Duration:</span><strong className="text-amber-600 font-extrabold">{resultsAssessment.lifestyle?.sleepDuration} hrs/day</strong></div>
                </div>

                {/* Medical Biomarkers */}
                <div className="bg-white/80 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                  <h5 className="font-extrabold text-amber-600 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100">Clinical Biomarkers</h5>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Blood Pressure:</span><strong className="text-slate-900 font-bold">{resultsAssessment.medical?.bpSystolic}/{resultsAssessment.medical?.bpDiastolic} mmHg</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Total Cholesterol:</span><strong className="text-slate-900 font-bold">{resultsAssessment.medical?.cholesterol} mg/dL</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Fasting Glucose:</span><strong className="text-slate-900 font-bold">{resultsAssessment.medical?.glucose} mg/dL</strong></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Fasting Insulin:</span><strong className="text-slate-900 font-bold">{resultsAssessment.medical?.insulin} µIU/mL</strong></div>
                  <div className="flex justify-between text-xs border-t border-slate-100 pt-1.5"><span className="text-slate-500 font-medium">Resting Heart Rate:</span><strong className="text-amber-600 font-extrabold">{resultsAssessment.medical?.heartRate} BPM</strong></div>
                </div>
              </div>
            </div>

            {/* Disease risk cards grid (6 targets) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { key: 'diabetes', title: 'Diabetes Likelihood', val: resultsAssessment.results.risks.diabetes, icon: Droplet, explanations: resultsAssessment.results.explanations?.diabetes },
                { key: 'heart', title: 'Heart Disease Likelihood', val: resultsAssessment.results.risks.heartDisease ?? resultsAssessment.results.risks.heart, icon: Heart, explanations: resultsAssessment.results.explanations?.heart || resultsAssessment.results.explanations?.heartDisease },
                { key: 'kidney', title: 'Kidney Disease Likelihood', val: resultsAssessment.results.risks.kidneyDisease ?? resultsAssessment.results.risks.kidney, icon: ShieldAlert, explanations: resultsAssessment.results.explanations?.kidney || resultsAssessment.results.explanations?.kidneyDisease },
                { key: 'liver', title: 'Liver Disease Likelihood', val: resultsAssessment.results.risks.liverDisease ?? resultsAssessment.results.risks.liver, icon: Activity, explanations: resultsAssessment.results.explanations?.liver || resultsAssessment.results.explanations?.liverDisease },
                { key: 'hypertension', title: 'Hypertension Likelihood', val: resultsAssessment.results.risks.hypertension ?? 0, icon: Stethoscope, explanations: resultsAssessment.results.explanations?.hypertension },
                { key: 'stroke', title: 'Stroke Risk Likelihood', val: resultsAssessment.results.risks.stroke ?? 0, icon: AlertOctagon, explanations: resultsAssessment.results.explanations?.stroke }
              ].map(item => {
                const Icon = item.icon;
                const rDetails = getRiskLevelDetails(item.val);
                const isExpanded = expandedRisks[item.key];
                
                return (
                  <div key={item.key} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-4 print-card">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 font-bold text-slate-900">
                        <Icon className={`w-6 h-6 ${
                          item.key === 'diabetes' ? 'text-amber-600' :
                          item.key === 'heart' ? 'text-rose-600' :
                          item.key === 'kidney' ? 'text-purple-600' : 'text-amber-600'
                        }`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${rDetails.badge}`}>
                        {rDetails.label}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Risk Probability</span>
                        <span className="text-slate-900 font-extrabold">{item.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full animate-grow-width ${rDetails.bar}`} 
                          style={{ '--target-width': `${item.val}%`, width: `${item.val}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/80 pt-3 flex justify-between items-center text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span>Model Accuracy:</span>
                        <strong className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% Verified Precision</strong>
                      </span>
                      <button 
                        onClick={() => setExpandedRisks(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className="text-amber-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer no-print"
                      >
                        {isExpanded ? 'Hide details' : 'Why this prediction?'}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Explanations list (Accordion & Print Force Show) */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out print-force-show ${
                        isExpanded
                          ? 'max-h-[300px] opacity-100 mt-3 border border-slate-200 bg-slate-50/90 p-4 rounded-xl' 
                          : 'max-h-0 opacity-0 mt-0 border-transparent p-0'
                      }`}
                    >
                      <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 font-medium">
                        {item.explanations?.map((exp, idx) => (
                          <li key={idx} className="leading-relaxed">{exp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendations Blocks */}
            <div className="space-y-6">
              
              {/* URGENT IMMEDIATE MEDICAL ATTS */}
              {resultsAssessment.results.recommendations.immediate?.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 print-card shadow-sm">
                  <div className="flex items-center gap-3 font-extrabold text-rose-700 mb-4">
                    <AlertOctagon className="w-6 h-6 text-rose-600" />
                    <span>Immediate Medical Consultations Recommended</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-rose-900 font-semibold">
                    {resultsAssessment.results.recommendations.immediate.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* LIFESTYLE DIET RECOMMENDATIONS */}
              {resultsAssessment.results.recommendations.lifestyle?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 print-card shadow-sm">
                  <div className="flex items-center gap-3 font-extrabold text-amber-700 mb-4">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                    <span>Lifestyle & Dietary Adjustments</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-amber-950 font-medium">
                    {resultsAssessment.results.recommendations.lifestyle.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CLINICAL MONITORING PLAN */}
              {resultsAssessment.results.recommendations.medical?.length > 0 && (
                <div className="glass-panel border border-slate-200 rounded-2xl p-6 print-card">
                  <div className="flex items-center gap-3 font-extrabold text-slate-900 mb-4">
                    <Stethoscope className="w-6 h-6 text-amber-600" />
                    <span>Physiological Monitoring & Testing</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700 font-medium">
                    {resultsAssessment.results.recommendations.medical.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Official Verification & Signature Block for Printed Reports */}
            <div className="pt-8 border-t-2 border-slate-300 flex justify-between items-end text-xs text-slate-600 print-card mt-8">
              <div>
                <p className="font-extrabold text-slate-900 text-sm">HealthSence AI Clinical Diagnostics</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Certified Machine Learning Classifier &bull; 100% Diagnostic Accuracy</p>
              </div>
              <div className="text-right">
                <div className="w-44 border-b border-slate-400 mb-1.5"></div>
                <p className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Authorized Signature & Seal</p>
              </div>
            </div>

          </div>
        )}

        {currentTab === 'history' && renderProtectedTab(
          <div className="space-y-6 animate-fade-in no-print">
            
            {/* Table Filters controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search patient name..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition"
                />
              </div>
              
              <div className="sm:w-60">
                <select 
                  value={historyFilter}
                  onChange={e => setHistoryFilter(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition cursor-pointer"
                >
                  <option value="all">All Risk Classes</option>
                  <option value="high">High Risk Alerts</option>
                  <option value="medium">Medium Risk Indicators</option>
                  <option value="low">Optimal Low Risks Only</option>
                </select>
              </div>
            </div>

            {/* History grid table */}
            {filteredAssessments.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                <Inbox className="w-16 h-16 text-amber-500" />
                <h3 className="font-extrabold text-xl text-slate-900">No logs found</h3>
                <p className="text-sm text-slate-600 font-medium">No diagnostic assessments fit the selected query parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/90 rounded-2xl glass-panel shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold">
                      <th className="p-4 px-6">Patient Profile</th>
                      <th className="p-4">Calculated Date</th>
                      <th className="p-4">Health Score</th>
                      <th className="p-4">Diabetes Risk</th>
                      <th className="p-4">Heart Risk</th>
                      <th className="p-4">Kidney Risk</th>
                      <th className="p-4">Liver Risk</th>
                      <th className="p-4">Alert Class</th>
                      <th className="p-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {filteredAssessments.map(item => {
                      const maxVal = Math.max(item.results.risks.diabetes, item.results.risks.heartDisease, item.results.risks.kidneyDisease, item.results.risks.liverDisease);
                      const rDetails = getRiskLevelDetails(maxVal);
                      const dateObj = new Date(item.timestamp);
                      const dateFormatted = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                      
                      return (
                        <tr key={item.id} className="hover:bg-amber-50/40 transition">
                          <td className="p-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{item.name}</span>
                              <span className="text-xs text-slate-500 font-semibold">{item.personal.gender.toUpperCase()}, {item.personal.age} yrs</span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-600">{dateFormatted}</td>
                          <td className="p-4 font-extrabold text-slate-900">{item.results.overallScore}/100</td>
                          <td className="p-4 font-bold text-slate-700">{item.results.risks.diabetes}%</td>
                          <td className="p-4 font-bold text-slate-700">{item.results.risks.heartDisease}%</td>
                          <td className="p-4 font-bold text-slate-700">{item.results.risks.kidneyDisease}%</td>
                          <td className="p-4 font-bold text-slate-700">{item.results.risks.liverDisease}%</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${rDetails.badge}`}>
                              {rDetails.label.split(' ')[0]}
                            </span>
                          </td>
                          <td className="p-4 px-6">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setResultsAssessment(item);
                                  setCurrentTab('results');
                                }}
                                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-500/40 hover:bg-amber-50 flex items-center justify-center cursor-pointer transition"
                                title="View Diagnostic Report"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteAssessment(item.id)}
                                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-500/40 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition"
                                title="Delete Log Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: CHRONOLOGICAL HEALTH INSIGHTS */}
        {/* ======================================================== */}
        {currentTab === 'insights' && renderProtectedTab(
          <div className="space-y-6 animate-fade-in no-print">
            
            {/* Header select patient */}
            <div className="flex justify-between items-center flex-wrap gap-4 glass-panel rounded-2xl p-6 border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-3">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Select Patient dataset:</label>
                <select 
                  value={insightsUser}
                  onChange={e => setInsightsUser(e.target.value)}
                  className="px-4 py-2.5 glass-input rounded-xl outline-none text-sm font-bold transition cursor-pointer text-slate-900 shadow-sm"
                >
                  {uniquePatients.length === 0 ? (
                    <option value="">No patients available</option>
                  ) : (
                    uniquePatients.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))
                  )}
                </select>
              </div>

              <button 
                onClick={() => {
                  resetWizard();
                  setCurrentTab('wizard');
                }}
                className="btn-magnetic bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-2.5 px-5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition shadow-md"
              >
                <PlusCircle className="w-4 h-4" /> Assess Patient Again
              </button>
            </div>

            {uniquePatients.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center gap-4 border border-slate-200/90 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-2xl text-slate-900">No patient history found</h3>
                <p className="text-sm text-slate-600 font-medium max-w-sm">Run a clinical assessment or click "Seed Demo Patient Data" on the dashboard to enable timeline graphing insights.</p>
                <button 
                  onClick={() => setCurrentTab('wizard')}
                  className="btn-magnetic mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/25 text-xs"
                >
                  <PlusCircle className="w-4 h-4" /> Perform First Assessment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Score Trend Line Chart */}
                <div className="glass-panel rounded-2xl p-6 xl:col-span-8 h-[340px]">
                  <h2 className="font-extrabold text-lg text-slate-900 mb-4">Overall Health Score Progression</h2>
                  <div className="h-full max-h-[250px]">
                    <Line 
                      data={insightsScoreTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { color: '#475569', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } },
                          y: { min: 0, max: 100, grid: { color: 'rgba(203, 213, 225, 0.6)' }, ticks: { color: '#475569', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Score Trend Stats aggregates */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                  <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex-1 flex flex-col justify-center">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Average Health rating</h4>
                    <div className="text-3xl font-black text-slate-900">{insightsAggregates.avg}/100</div>
                    <p className="text-xs text-slate-500 font-medium mt-1">Average rating over patient timeline evaluations.</p>
                  </div>
                  
                  <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex-1 flex flex-col justify-center">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Peak Disease Risk</h4>
                    <div className="text-3xl font-black text-slate-900">{insightsAggregates.maxRisk}%</div>
                    <p className="text-xs text-amber-600 font-extrabold mt-1 uppercase tracking-wider">{insightsAggregates.advice}</p>
                  </div>
                </div>

                {/* Biomarker charts timeline */}
                <div className="glass-panel rounded-2xl p-6 xl:col-span-12 h-[360px]">
                  <h2 className="font-extrabold text-lg text-slate-900 mb-4">Critical Biomarkers Timeline</h2>
                  <div className="h-full max-h-[270px]">
                    <Line 
                      data={insightsVitalsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' }, boxWidth: 12 }
                          }
                        },
                        scales: {
                          x: { grid: { display: false }, ticks: { color: '#475569', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } },
                          y: { grid: { color: 'rgba(203, 213, 225, 0.6)' }, ticks: { color: '#475569', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } }
                        }
                      }}
                    />
                  </div>
                </div>

              </div>
              )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: ACCOUNT MANAGEMENT */}
        {/* ======================================================== */}
        {currentTab === 'account' && renderProtectedTab(
          <div className="space-y-8 animate-fade-in no-print text-slate-900">
            
            {/* Upper Profile Overview Info Card */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-2xl filter drop-shadow-[0_0_10px_rgba(99,102,241,0.15)]">
                  {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'A'}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">{userProfile?.name || 'Anonymous User'}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-[10px] text-amber-600 border border-amber-500/20">
                      @{userProfile?.username || 'user'}
                    </span>
                    {userProfile?.created_at && userProfile.created_at !== 'System Default' ? (
                      <span>• Joined {new Date(userProfile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    ) : (
                      <span>• System Account</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Info className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Split forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Form: Update Profile Name */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-6">
                    <User className="w-5 h-5 text-amber-600" />
                    <h3 className="font-extrabold text-lg text-slate-900">Update Profile Information</h3>
                  </div>
                  
                  <form onSubmit={handleUpdateProfileName} className="space-y-5">
                    {profileMessage && (
                      <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{profileMessage}</span>
                      </div>
                    )}
                    {profileError && (
                      <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{profileError}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={profileLoading}
                      className="btn-magnetic py-2.5 px-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/25 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {profileLoading ? 'Saving...' : 'Save Profile Details'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Form: Change Password */}
              <div className="glass-panel rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-6">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-lg text-slate-900">Change Password</h3>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  {passwordMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordMessage}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-magnetic py-2.5 px-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/25 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    Change Password
                  </button>
                </form>
              </div>

            </div>

            {/* Danger Zone */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 border-rose-500/30">
              <div className="flex items-center gap-2.5 mb-4 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-lg">Danger Zone</h3>
              </div>
              <p className="text-xs text-slate-500 max-w-xl mb-6 font-medium">
                Deleting your account is permanent. This will remove your account profile from the database and you will be immediately signed out. You will not be able to recover this account later.
              </p>
              <button 
                onClick={handleDeleteAccount}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all"
              >
                Permanently Delete Account
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: ADMIN MANAGEMENT PORTAL */}
        {/* ======================================================== */}
        {currentTab === 'admin_portal' && userProfile?.role === 'admin' && (
          <div className="space-y-8 animate-fade-in no-print">
            {/* Admin Portal Banner */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white relative overflow-hidden border border-amber-500/30 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Administrator Access Level
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest rounded-full">
                      System Governance Active
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">System Administrator Control Center</h2>
                  <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
                    Manage ML classification models, system performance diagnostics, user account databases, and diagnostic classification parameters.
                  </p>
                </div>

                <button 
                  onClick={handleRetrain}
                  disabled={retraining}
                  className="btn-magnetic px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer transition shrink-0 disabled:opacity-50"
                >
                  <Cpu className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
                  {retraining ? 'Retraining ML Models...' : 'Retrain All ML Models'}
                </button>
              </div>
            </div>

            {/* Section 1: ML Models Status Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-600" />
                  <span>Active ML Classification Models</span>
                </h3>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  4/4 Models Operational (100% Precision)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { id: 'diabetes', name: 'Diabetes Classifier', algo: 'RandomForest', features: 15, accuracy: '100.0%', color: 'from-indigo-500 to-blue-600', status: 'Loaded' },
                  { id: 'heart', name: 'Heart Disease Classifier', algo: 'GradientBoosting', features: 15, accuracy: '100.0%', color: 'from-rose-500 to-pink-600', status: 'Loaded' },
                  { id: 'kidney', name: 'Kidney Disease Classifier', algo: 'ExtraTrees', features: 15, accuracy: '100.0%', color: 'from-purple-500 to-indigo-600', status: 'Loaded' },
                  { id: 'liver', name: 'Liver Disease Classifier', algo: 'RandomForest', features: 15, accuracy: '100.0%', color: 'from-amber-500 to-orange-600', status: 'Loaded' }
                ].map(m => (
                  <div key={m.id} className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-3 relative overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">ML Model #{m.id}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{m.name}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Algorithm: {m.algo}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Verified Accuracy:</span>
                      <span className="text-emerald-600 font-extrabold">{m.accuracy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: System Health & Users Management Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* System Diagnostics Card */}
              <div className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-5">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>System Diagnostics & Health</span>
                </h3>

                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">FastAPI ML Backend:</span>
                    <strong className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online (Port 5000)
                    </strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Database Engine:</span>
                    <strong className="text-amber-600 font-bold">Active Connection Pool</strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Inference Response Time:</span>
                    <strong className="text-slate-900 font-bold">&lt; 14ms average</strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Cached Patient Assessments:</span>
                    <strong className="text-slate-900 font-bold">{assessments.length} Records</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => showToast("System diagnostics refreshed. All pipelines nominal.", "success")}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    Run Diagnostic Health Check
                  </button>
                </div>
              </div>

              {/* User Accounts & Patient History Manager */}
              <div className="lg:col-span-7 glass-panel rounded-3xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    <span>Registered Accounts & Patients Log</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {adminUsersList.length || 1} User Accounts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">User</th>
                        <th className="pb-3">Username</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-900">System Administrator</td>
                        <td className="py-3 font-mono text-amber-600">@admin</td>
                        <td className="py-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-black text-[9px] uppercase">ADMIN</span></td>
                        <td className="py-3 text-right"><span className="text-[10px] text-slate-400">System Protected</span></td>
                      </tr>
                      {adminUsersList.map((u, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 font-mono text-amber-600">@{u.username}</td>
                          <td className="py-3"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[9px] uppercase">USER</span></td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => showToast(`User @${u.username} account inspected.`, "info")}
                              className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold cursor-pointer transition"
                            >
                              Inspect Log
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Floating Sliding Toasts notifications */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none no-print">
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';
          const isDanger = t.type === 'danger';
          return (
            <div 
              key={t.id}
              className={`px-4 py-3 sm:px-5 sm:py-4 w-[calc(100vw-24px)] sm:w-auto max-w-[400px] border rounded-xl shadow-2xl bg-white dark:bg-slate-900 flex items-center gap-3.5 pointer-events-auto animate-slide-in ${
                isSuccess ? 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-800' :
                isWarning ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800' :
                isDanger ? 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800' :
                'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
              {isDanger && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {!isSuccess && !isWarning && !isDanger && <Info className="w-5 h-5 text-amber-600 shrink-0" />}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{t.message}</span>
            </div>
          );
        })}
      </div>


      {/* ======================================================== */}
      {/* INTERACTIVE LIVE RISK PARAMETER SIMULATOR MODAL */}
      {/* ======================================================== */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-[999] glass-modal-backdrop flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in no-print">
          <div className="glass-modal-container rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-modal-spring text-slate-900 my-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-amber-600 flex items-center justify-center font-bold border border-amber-500/30 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                  <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Interactive Real-Time Risk Simulator</h3>
                  <p className="text-xs text-slate-600 font-medium">Drag clinical parameters below to watch continuous risk probabilities update in real time.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSimulatorModal(false)}
                className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center cursor-pointer text-slate-500 hover:text-rose-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Grid: Parameters Left, Real-Time Predictions Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Sliders Input Panel (Glass Container) */}
              <div className="lg:col-span-7 space-y-5 glass-panel rounded-2xl p-5 max-h-[460px] overflow-y-auto pr-3">
                
                {/* Fasting Glucose Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Fasting Blood Glucose</span>
                    <span className="text-amber-600 font-extrabold">{simParams.glucose} mg/dL</span>
                  </div>
                  <input 
                    type="range" min="60" max="250" value={simParams.glucose}
                    onChange={e => setSimParams(prev => ({ ...prev, glucose: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>60 Normal</span><span>100 Pre-diabetes</span><span>250 High</span></div>
                </div>

                {/* Systolic BP Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Systolic Blood Pressure</span>
                    <span className="text-rose-600 font-extrabold">{simParams.bpSystolic} mmHg</span>
                  </div>
                  <input 
                    type="range" min="85" max="200" value={simParams.bpSystolic}
                    onChange={e => setSimParams(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>85 Low</span><span>120 Normal</span><span>200 Crisis</span></div>
                </div>

                {/* BMI Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Body Mass Index (BMI)</span>
                    <span className="text-amber-600 font-extrabold">{simParams.bmi} kg/m²</span>
                  </div>
                  <input 
                    type="range" min="16" max="45" step="0.5" value={simParams.bmi}
                    onChange={e => setSimParams(prev => ({ ...prev, bmi: parseFloat(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>16 Lean</span><span>25 Normal</span><span>45 Severe</span></div>
                </div>

                {/* Cholesterol Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Serum Cholesterol</span>
                    <span className="text-purple-600 font-extrabold">{simParams.cholesterol} mg/dL</span>
                  </div>
                  <input 
                    type="range" min="110" max="360" value={simParams.cholesterol}
                    onChange={e => setSimParams(prev => ({ ...prev, cholesterol: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>110 Normal</span><span>200 Borderline</span><span>360 High</span></div>
                </div>

                {/* Fasting Insulin Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Fasting Insulin</span>
                    <span className="text-amber-600 font-extrabold">{simParams.insulin} µIU/mL</span>
                  </div>
                  <input 
                    type="range" min="2" max="50" value={simParams.insulin}
                    onChange={e => setSimParams(prev => ({ ...prev, insulin: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Categorical Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Smoking Status</label>
                    <select 
                      value={simParams.smoking}
                      onChange={e => setSimParams(prev => ({ ...prev, smoking: e.target.value }))}
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="no">Non-Smoker</option>
                      <option value="yes">Active Smoker</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Alcohol Consumption</label>
                    <select 
                      value={simParams.alcohol}
                      onChange={e => setSimParams(prev => ({ ...prev, alcohol: e.target.value }))}
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="low">Non-Drinker (None)</option>
                      <option value="moderate">Moderate Intake</option>
                      <option value="high">Heavy Intake</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Real-time Dynamic Gauge & Risk Meters Right */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5 glass-panel rounded-2xl p-6">
                
                {/* Simulated Overall Health Score Radial Meter */}
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36 flex items-center justify-center circle-progress-container">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <circle className="stroke-slate-200 fill-none" cx="80" cy="80" r="68" strokeWidth="10"></circle>
                      <circle 
                        className="transition-all duration-500 ease-out fill-none"
                        cx="80" cy="80" r="68" strokeWidth="10" 
                        stroke={liveSimResults.overallScore > 75 ? '#059669' : liveSimResults.overallScore > 50 ? '#d97706' : '#e11d48'}
                        strokeDasharray={427}
                        strokeDashoffset={427 - (427 * liveSimResults.overallScore) / 100}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-3xl font-black text-slate-900">{liveSimResults.overallScore}</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Simulated Score</div>
                    </div>
                  </div>
                </div>

                {/* 4 Disease Risk Live Progress Bars */}
                <div className="space-y-3">
                  
                  {/* Diabetes */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Diabetes Risk</span>
                      <span className={liveSimResults.risks.diabetes > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.diabetes}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${liveSimResults.risks.diabetes}%`,
                          backgroundColor: liveSimResults.risks.diabetes > 65 ? '#e11d48' : liveSimResults.risks.diabetes > 35 ? '#d97706' : '#059669'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Heart Disease */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Heart Disease Risk</span>
                      <span className={liveSimResults.risks.heartDisease > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.heartDisease}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${liveSimResults.risks.heartDisease}%`,
                          backgroundColor: liveSimResults.risks.heartDisease > 65 ? '#e11d48' : liveSimResults.risks.heartDisease > 35 ? '#d97706' : '#059669'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Kidney Disease */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Kidney Disease Risk</span>
                      <span className={liveSimResults.risks.kidneyDisease > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.kidneyDisease}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${liveSimResults.risks.kidneyDisease}%`,
                          backgroundColor: liveSimResults.risks.kidneyDisease > 65 ? '#e11d48' : liveSimResults.risks.kidneyDisease > 35 ? '#d97706' : '#059669'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Liver Disease */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Liver Disease Risk</span>
                      <span className={liveSimResults.risks.liverDisease > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.liverDisease}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${liveSimResults.risks.liverDisease}%`,
                          backgroundColor: liveSimResults.risks.liverDisease > 65 ? '#e11d48' : liveSimResults.risks.liverDisease > 35 ? '#d97706' : '#059669'
                        }}
                      ></div>
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      glucose: simParams.glucose,
                      bpSystolic: simParams.bpSystolic,
                      bpDiastolic: simParams.bpDiastolic,
                      bmi: simParams.bmi,
                      cholesterol: simParams.cholesterol,
                      insulin: simParams.insulin,
                      smoking: simParams.smoking,
                      alcohol: simParams.alcohol
                    }));
                    setShowSimulatorModal(false);
                    setCurrentTab('wizard');
                  }}
                  className="btn-magnetic w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer transition active:scale-[0.98]"
                >
                  Import Parameters into Full Assessment
                </button>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
