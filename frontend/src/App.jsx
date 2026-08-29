import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';

import Navbar from './components/Navbar';
import SplashLoader from './components/SplashLoader';
import ToastContainer from './components/ToastContainer';
import AuthModal from './components/AuthModal';
import SimulatorModal from './components/SimulatorModal';
import ChatWidget from './components/ChatWidget';
import Dashboard from './components/Dashboard';
import Wizard from './components/Wizard';
import SymptomChecker from './components/SymptomChecker';
import HealthChatbot from './components/HealthChatbot';
import Results from './components/Results';
import History from './components/History';
import Insights from './components/Insights';
import Account from './components/Account';
import AdminPortal from './components/AdminPortal';
import CommandPalette from './components/CommandPalette';
import { API_BASE_URL } from './config';


import { ClipboardList, AlertCircle, ArrowRight } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  RadialLinearScale, Title, Tooltip, Legend, Filler
);

export default function App() {
  
  // Force Dark Mode exclusively
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('healthrisk_theme', 'dark');
  }, []);

  // Navigation & Authentication state
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('healthrisk_auth_token') || '');
  const [authMode, setAuthMode] = useState('login'); 
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // App domain data
  const [assessments, setAssessments] = useState([]);
  const [activeUser, setActiveUser] = useState('');
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // User Profile state
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
  const [adminUsersList, setAdminUsersList] = useState([]);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'male', height: '', weight: '',
    smoking: 'no', alcohol: 'low', physicalActivity: 'moderate', sleepDuration: '',
    bpSystolic: '', bpDiastolic: '', cholesterol: '', glucose: '', insulin: '', heartRate: '',
    algorithm: 'auto'
  });
  const [errors, setErrors] = useState({});
  const [predicting, setPredicting] = useState(false);

  // Splash & Simulator state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState('Initializing Clinical AI Engines...');
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simParams, setSimParams] = useState({
    age: 45, bmi: 26.5, bpSystolic: 132, bpDiastolic: 84, glucose: 110,
    cholesterol: 215, insulin: 14, sleepDuration: 7, smoking: 'no',
    alcohol: 'low', physicalActivity: 'moderate'
  });

  const [retraining, setRetraining] = useState(false);
  const [resultsAssessment, setResultsAssessment] = useState(null);
  const [expandedRisks, setExpandedRisks] = useState({ heart: false, coronaryArtery: false, hypertensiveHeart: false, atherosclerosis: false, arrhythmia: false, cardioMetabolic: false });

  // History & Insights filter state
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [insightsUser, setInsightsUser] = useState('');

  // Symptom Checker state
  const [symptomTags, setSymptomTags] = useState(['Stomach ache']);
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomDesc, setSymptomDesc] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('1-3 days');
  const [symptomSeverity, setSymptomSeverity] = useState('Moderate');
  const [analyzingSymptom, setAnalyzingSymptom] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      category: 'Welcome & System Ready',
      text: 'Hello! I am **HealthBot AI**, your 24/7 cardiovascular & precision health AI assistant. Ask me anything about heart disease prevention, blood pressure, cholesterol, ECG rhythms, cardiac biomarkers, symptoms, exercise, or healthy cardiovascular nutrition.',
      suggested_prompts: [
        'How to lower blood pressure naturally?',
        'What are optimal cholesterol target levels?',
        'What are early signs of coronary artery disease?',
        'How does exercise improve cardiovascular health?'
      ],
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toasts notification state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'primary') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Setup Splash Screen Loading Timer
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 100) {
        progress = 100;
        setLoadingProgress(100);
        setLoadingPhase('System Calibration Complete!');
        clearInterval(interval);
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 500);
      } else {
        setLoadingProgress(progress);
        if (progress < 35) {
          setLoadingPhase('Initializing Clinical AI Engines...');
        } else if (progress < 70) {
          setLoadingPhase('Loading AHA/ADA Biomarker Reference Guidelines...');
        } else {
          setLoadingPhase('Calibrating Neural Ensemble Confidence Weights...');
        }
      }
    }, 110);

    return () => clearInterval(interval);
  }, []);

  // Compute live simulator results for Heart Disease & Cardiovascular Risk
  const liveSimResults = useMemo(() => {
    const age = parseFloat(simParams?.age) || 45;
    const bmi = parseFloat(simParams?.bmi) || 24;
    const glucose = parseFloat(simParams?.glucose) || 90;
    const systolic = parseFloat(simParams?.bpSystolic) || 120;
    const diastolic = parseFloat(simParams?.bpDiastolic) || 80;
    const cholesterol = parseFloat(simParams?.cholesterol) || 180;
    const insulin = parseFloat(simParams?.insulin) || 10;
    const smoking = simParams?.smoking === 'yes';
    const alcoholHigh = simParams?.alcohol === 'high';
    const sedentary = simParams?.physicalActivity === 'sedentary';

    // Core Heart Disease ML Logistic Approximation
    const zHeart = -5.2 + 0.040*(systolic - 120) + 0.022*(cholesterol - 180) + 0.035*(age - 40) + (smoking ? 0.95 : 0) + 0.050*(bmi - 25) + (sedentary ? 0.45 : 0) + (alcoholHigh ? 0.5 : 0);
    const heartProb = Math.min(99, Math.max(3, Math.round(100 / (1 + Math.exp(-zHeart))))) || 10;

    // Sub-Risks
    const zCad = -4.8 + 0.038*(systolic - 120) + 0.030*(cholesterol - 180) + 0.032*(age - 40) + (smoking ? 1.2 : 0) + 0.04*(bmi - 24);
    const cadProb = Math.min(99, Math.max(3, Math.round(100 / (1 + Math.exp(-zCad))))) || 10;

    const zHyp = -4.5 + 0.055*(systolic - 120) + 0.035*(diastolic - 80) + 0.03*(bmi - 24);
    const hypProb = Math.min(99, Math.max(3, Math.round(100 / (1 + Math.exp(-zHyp))))) || 10;

    const zAth = -4.6 + 0.042*(cholesterol - 180) + 0.022*(glucose - 90) + (smoking ? 0.9 : 0) + 0.035*(age - 40);
    const athProb = Math.min(99, Math.max(3, Math.round(100 / (1 + Math.exp(-zAth))))) || 10;

    const zArr = -5.0 + 0.025*(systolic - 120) + (alcoholHigh ? 0.8 : 0);
    const arrProb = Math.min(99, Math.max(2, Math.round(100 / (1 + Math.exp(-zArr))))) || 8;

    const zMet = -4.7 + 0.035*(glucose - 90) + 0.030*(insulin - 8) + 0.05*(bmi - 24) + (sedentary ? 0.5 : 0);
    const metProb = Math.min(99, Math.max(3, Math.round(100 / (1 + Math.exp(-zMet))))) || 10;

    const cardioAvg = (heartProb * 0.4) + (cadProb * 0.2) + (hypProb * 0.15) + (athProb * 0.15) + (arrProb * 0.1);
    let score = Math.min(99, Math.max(15, Math.round(100 - (cardioAvg * 0.75))));
    if (heartProb >= 70 || systolic >= 150) score = Math.max(15, score - 8);
    if (!Number.isFinite(score)) score = 85;

    return {
      risks: {
        heartDisease: Number.isFinite(heartProb) ? heartProb : 15,
        coronaryArtery: Number.isFinite(cadProb) ? cadProb : 12,
        hypertensiveHeart: Number.isFinite(hypProb) ? hypProb : 14,
        atherosclerosis: Number.isFinite(athProb) ? athProb : 10,
        arrhythmia: Number.isFinite(arrProb) ? arrProb : 8,
        cardioMetabolic: Number.isFinite(metProb) ? metProb : 10
      },
      overallScore: score
    };
  }, [simParams]);

  // Authentication API handlers
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
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
    if (e) e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      showToast("Passwords do not match", "danger");
      setRegisterLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
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
    setUserProfile(null);
    setCurrentTab('dashboard');
    showToast("Signed out successfully.", "info");
  };

  // Data fetching effects
  const fetchAssessments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assessments`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAssessments(data);
        if (data.length > 0) {
          const firstUser = data[0].name;
          setActiveUser(firstUser);
          setInsightsUser(firstUser);
          setLatestAssessment(data[0]);
        }
      }
    } catch (err) {
      console.warn("Could not fetch assessments from backend API.", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/metrics`, {
        headers: authToken ? { "Authorization": `Bearer ${authToken}` } : {}
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok) setMetrics(data);
    } catch (err) {
      console.warn("Could not fetch ML metrics.", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok && (data.username || data.name || data.role)) {
        setUserProfile(data);
        setProfileName(data.name || '');
        if (data.role === 'admin') fetchAdminUsersList();
      }
    } catch (err) {
      console.warn("Could not fetch user profile.", err);
    }
  };

  const fetchAdminUsersList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.users)) {
        setAdminUsersList(data.users);
      }
    } catch (err) {
      console.warn("Admin users fetch failed.", err);
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

  useEffect(() => {
    if (currentTab === 'admin_portal') {
      if (!authToken || (userProfile && userProfile.role !== 'admin')) {
        setCurrentTab('dashboard');
        showToast('Access Denied: Administrator privileges required to view Admin Management Portal.', 'danger');
      }
    }
  }, [currentTab, userProfile, authToken]);

  useEffect(() => {
    if (activeUser && assessments.length > 0) {
      const matched = assessments.find(a => a.name === activeUser);
      if (matched) setLatestAssessment(matched);
    }
  }, [activeUser, assessments]);

  // Account profile handlers
  const handleUpdateProfileName = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    setProfileError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
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
      const res = await fetch(`${API_BASE_URL}/api/user/password`, {
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
      const res = await fetch(`${API_BASE_URL}/api/user/account`, {
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

  // Symptom Checker API handler
  const handleCheckSymptom = async (overrideSymptoms = null) => {
    const listToAnalyze = overrideSymptoms || symptomTags;
    if (listToAnalyze.length === 0 && !symptomDesc.trim()) {
      showToast("Please select or describe at least one symptom.", "warning");
      return;
    }

    setAnalyzingSymptom(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/check-symptom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: listToAnalyze,
          description: symptomDesc,
          duration: symptomDuration,
          severity: symptomSeverity,
          age: formData.age ? parseInt(formData.age) : 35,
          gender: formData.gender || 'male'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSymptomResult(data);
        showToast("Symptom analysis & clinical triage completed!", "success");
      } else {
        showToast(data.detail || "Symptom check failed", "danger");
      }
    } catch (err) {
      showToast("Failed to connect to symptom checker service", "danger");
    } finally {
      setAnalyzingSymptom(false);
    }
  };

  // Chatbot AI handler
  const handleSendChatMessage = async (presetText = null) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    const userMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsgObj]);
    if (!presetText) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          patient_context: activeUser ? { name: activeUser } : null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            category: data.category,
            text: data.response,
            specialist: data.specialist_recommendation,
            suggested_prompts: data.suggested_prompts,
            disclaimer: data.disclaimer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        showToast(data.detail || "Chat response failed", "danger");
      }
    } catch (err) {
      showToast("Failed to connect to HealthBot AI server", "danger");
    } finally {
      setChatLoading(false);
    }
  };

  // ML Retrain API handler
  const handleRetrain = async () => {
    setRetraining(true);
    try {
      showToast("Updating health diagnostic pipeline...", "primary");
      const res = await fetch(`${API_BASE_URL}/api/retrain`, {
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

  // Delete Assessment handler
  const handleDeleteAssessment = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this health assessment record?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assessments/${id}`, {
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

  // Wizard Helper functions
  const resetWizard = () => {
    setWizardStep(1);
    setFormData({
      name: '', age: '', gender: 'male', height: '', weight: '',
      smoking: 'no', alcohol: 'low', physicalActivity: 'moderate', sleepDuration: '',
      bpSystolic: '', bpDiastolic: '', cholesterol: '', glucose: '', insulin: '', heartRate: '',
      algorithm: 'auto'
    });
    setErrors({});
  };

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
    if (!bmiVal) return { text: 'Pending Inputs', color: 'badge-neutral' };
    if (bmiVal < 18.5) return { text: 'Underweight (WHO)', color: 'badge-elevated' };
    if (bmiVal < 25) return { text: 'Normal BMI (WHO)', color: 'badge-optimal' };
    if (bmiVal < 30) return { text: 'Overweight (WHO)', color: 'badge-elevated' };
    return { text: 'Obese Class (WHO)', color: 'badge-high' };
  }, [calculatedBMI]);

  const handleNextStep = () => {
    if (wizardStep === 1) {
      const errs = {};
      if (!formData.name.trim()) errs.name = "Patient Name is required";
      if (!formData.age || formData.age <= 0) errs.age = "Valid Age is required";
      if (!formData.height || formData.height <= 0) errs.height = "Valid Height is required";
      if (!formData.weight || formData.weight <= 0) errs.weight = "Valid Weight is required";

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        showToast("Please fix all step errors before continuing.", "danger");
        return;
      }
      setErrors({});
      setWizardStep(2);
    } else if (wizardStep === 2) {
      setWizardStep(3);
    } else if (wizardStep === 3) {
      handleSubmitWizard();
    }
  };

  const calculateFallbackRisks = (data, bmi) => {
    const age = parseInt(data.age) || 35;
    const sys = parseInt(data.bpSystolic) || 120;
    const dia = parseInt(data.bpDiastolic) || 80;
    const chol = parseInt(data.cholesterol) || 180;
    const glu = parseInt(data.glucose) || 90;
    const hr = parseInt(data.heartRate) || 70;
    const isSmoker = data.smoking === 'yes';

    let hRisk = 12 + (sys - 120) * 0.45 + (chol - 180) * 0.22 + (isSmoker ? 18 : 0) + (bmi ? (bmi - 24) * 1.2 : 0) + (age - 35) * 0.3;
    let cadRisk = 10 + (sys - 120) * 0.38 + (chol - 180) * 0.28 + (isSmoker ? 15 : 0) + (age - 40) * 0.35;
    let hypRisk = 10 + (sys - 120) * 0.55 + (dia - 80) * 0.35 + (hr - 70) * 0.25;
    let athRisk = 8 + (chol - 180) * 0.35 + (glu - 90) * 0.2 + (isSmoker ? 12 : 0);
    let arrRisk = 8 + (hr - 70) * 0.45 + (sys - 120) * 0.2;
    let metRisk = 10 + (glu - 90) * 0.35 + (bmi ? (bmi - 24) * 1.4 : 0);

    const heartVal = Math.min(96, Math.max(5, Math.round(hRisk)));
    const cadVal = Math.min(96, Math.max(5, Math.round(cadRisk)));
    const hypVal = Math.min(96, Math.max(5, Math.round(hypRisk)));
    const athVal = Math.min(96, Math.max(5, Math.round(athRisk)));
    const arrVal = Math.min(96, Math.max(4, Math.round(arrRisk)));
    const metVal = Math.min(96, Math.max(5, Math.round(metRisk)));

    const explanations = {
      heart: [],
      heartDisease: [],
      coronaryArtery: [],
      hypertensiveHeart: [],
      atherosclerosis: [],
      arrhythmia: [],
      cardioMetabolic: []
    };
    if (sys >= 130) explanations.heartDisease.push(`Systolic blood pressure of ${sys} mmHg increases cardiovascular strain.`);
    if (chol > 200) explanations.heartDisease.push(`Total cholesterol (${chol} mg/dL) exceeds optimal limits (<200 mg/dL).`);
    if (isSmoker) explanations.heartDisease.push("Active smoking accelerates coronary endothelial plaque buildup.");
    if (sys >= 140) explanations.hypertensiveHeart.push(`Hypertension (${sys}/${dia} mmHg) creates pressure resistance on left ventricle.`);
    if (chol >= 220) explanations.coronaryArtery.push(`Elevated serum lipids (${chol} mg/dL) increase coronary atheroma risk.`);

    return {
      risks: {
        heartDisease: heartVal,
        coronaryArtery: cadVal,
        hypertensiveHeart: hypVal,
        atherosclerosis: athVal,
        arrhythmia: arrVal,
        cardioMetabolic: metVal
      },
      overallScore: Math.max(15, 100 - Math.round(heartVal * 0.6 + (sys >= 140 ? 12 : 0) + (chol >= 220 ? 8 : 0))),
      confidence: 100,
      recommendations: {
        immediate: sys >= 150 ? ["Schedule urgent clinical checkup for high blood pressure."] : [],
        lifestyle: isSmoker ? ["Start smoking cessation program.", "Incorporate 150 minutes of aerobic exercise weekly."] : ["Incorporate 150 minutes of aerobic exercise weekly."],
        medical: ["Schedule standard yearly lipid panel and cardiology screening."]
      },
      explanations
    };
  };

  const handleSubmitWizard = async () => {
    setPredicting(true);
    const payload = {
      name: formData.name,
      personal: {
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        bmi: parseFloat(calculatedBMI)
      },
      lifestyle: {
        smoking: formData.smoking,
        alcohol: formData.alcohol,
        physicalActivity: formData.physicalActivity,
        sleepDuration: parseFloat(formData.sleepDuration) || 7
      },
      medical: {
        bpSystolic: parseInt(formData.bpSystolic) || 120,
        bpDiastolic: parseInt(formData.bpDiastolic) || 80,
        cholesterol: parseInt(formData.cholesterol) || 180,
        glucose: parseInt(formData.glucose) || 95,
        insulin: parseInt(formData.insulin) || 10,
        heartRate: parseInt(formData.heartRate) || 72
      },
      algorithm: formData.algorithm
    };

    let computedResults = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) computedResults = data.assessment.results;
      }
    } catch (err) {
      console.warn("Backend API unavailable. Using fallback predictive model logic.", err);
    }

    if (!computedResults) {
      computedResults = calculateFallbackRisks(payload.medical, payload.personal.bmi);
    }

    const newRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...payload,
      results: computedResults
    };

    const updatedAssessments = [newRecord, ...assessments];
    setAssessments(updatedAssessments);
    setActiveUser(newRecord.name);
    setLatestAssessment(newRecord);
    setResultsAssessment(newRecord);
    setPredicting(false);
    
    showToast("Cardiovascular Assessment Calculated!", "success");
    setCurrentTab('results');
  };

  // Protected tab helper
  const renderProtectedTab = (component) => {
    if (!authToken) {
      return (
        <div className="max-w-[480px] mx-auto my-12 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in backdrop-blur-md">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-2xl text-zinc-900">Database Access Portal</h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">Enter administrator credentials to view patient assessment records, clinical vitals metrics, and retrain ML studio models.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="e.g. admin"
                required
                className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 rounded-xl outline-none text-sm font-semibold text-zinc-900 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 rounded-xl outline-none text-sm font-semibold text-zinc-900 transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full mt-2 btn bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-700 text-white py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
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

  // Helper Memoized chart datasets
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(historySearch.toLowerCase());
      if (historyFilter === 'all') return matchesSearch;
      
      const heartRisk = a.results?.risks?.heartDisease ?? a.results?.risks?.heart ?? 0;
      if (historyFilter === 'high') return matchesSearch && heartRisk >= 65;
      if (historyFilter === 'medium') return matchesSearch && heartRisk >= 35 && heartRisk < 65;
      if (historyFilter === 'low') return matchesSearch && heartRisk < 35;
      return matchesSearch;
    });
  }, [assessments, historySearch, historyFilter]);

  const insightsTimelineData = useMemo(() => {
    if (!insightsUser) return [];
    return assessments
      .filter(a => a.name === insightsUser)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [assessments, insightsUser]);

  const overviewRadarData = useMemo(() => {
    if (!latestAssessment) return null;
    const r = latestAssessment.results?.risks || {};
    return {
      labels: [
        'Heart Disease (ML)',
        'Coronary Artery (CAD)',
        'Hypertensive Strain',
        'Atherosclerosis Index',
        'Cardiac Rhythm & HR',
        'Cardio-Metabolic Synergy'
      ],
      datasets: [{
        label: 'Cardiovascular Risk Profile (%)',
        data: [
          r.heartDisease ?? r.heart ?? 15,
          r.coronaryArtery ?? 12,
          r.hypertensiveHeart ?? 14,
          r.atherosclerosis ?? 10,
          r.arrhythmia ?? 8,
          r.cardioMetabolic ?? 10
        ],
        backgroundColor: 'rgba(244, 63, 94, 0.2)',
        borderColor: 'rgba(244, 63, 94, 0.9)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(244, 63, 94, 1)',
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
          borderWidth: 2
        },
        {
          label: 'Systolic BP (mmHg)',
          data: insightsTimelineData.map(h => h.medical.bpSystolic),
          borderColor: 'rgba(239, 68, 68, 0.9)',
          borderWidth: 2
        },
        {
          label: 'Cholesterol (mg/dL)',
          data: insightsTimelineData.map(h => h.medical.cholesterol),
          borderColor: 'rgba(168, 85, 247, 0.9)',
          borderWidth: 2
        }
      ]
    };
  }, [insightsTimelineData]);

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
        if (val < 120) return { label: 'Optimal (AHA)', color: 'badge-optimal' };
        if (val < 140) return { label: 'Elevated (AHA)', color: 'badge-elevated' };
        return { label: 'Hypertension (AHA)', color: 'badge-high' };
      case 'bpDiastolic':
        if (val < 80) return { label: 'Optimal (AHA)', color: 'badge-optimal' };
        if (val < 90) return { label: 'Elevated (AHA)', color: 'badge-elevated' };
        return { label: 'Hypertension (AHA)', color: 'badge-high' };
      case 'cholesterol':
        if (val < 200) return { label: 'Desirable (NCEP)', color: 'badge-optimal' };
        if (val < 240) return { label: 'Borderline High', color: 'badge-elevated' };
        return { label: 'High Risk (NCEP)', color: 'badge-high' };
      case 'glucose':
        if (val < 100) return { label: 'Normal Fasting (ADA)', color: 'badge-optimal' };
        if (val < 126) return { label: 'Impaired Fasting (ADA)', color: 'badge-elevated' };
        return { label: 'Diabetic Range (ADA)', color: 'badge-high' };
      case 'insulin':
        if (val < 15) return { label: 'Normal Fasting', color: 'badge-optimal' };
        if (val < 25) return { label: 'Borderline Resistance', color: 'badge-elevated' };
        return { label: 'Insulin Resistant', color: 'badge-high' };
      case 'heartRate':
        if (val >= 60 && val <= 90) return { label: 'Optimal Resting', color: 'badge-optimal' };
        if ((val >= 50 && val < 60) || (val > 90 && val <= 100)) return { label: 'Borderline Range', color: 'badge-elevated' };
        return { label: 'Clinical Alert', color: 'badge-high' };
      default:
        return { label: 'Normal Range', color: 'badge-neutral' };
    }
  };

  const uniquePatients = useMemo(() => {
    return [...new Set(assessments.map(a => a.name))];
  }, [assessments]);

  // If unauthenticated, show AuthModal
  if (!authToken) {
    return (
      <>
        <AuthModal 
          authMode={authMode}
          setAuthMode={setAuthMode}
          loginUsername={loginUsername}
          setLoginUsername={setLoginUsername}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginError={loginError}
          setLoginError={setLoginError}
          loginLoading={loginLoading}
          handleLogin={handleLogin}
          registerName={registerName}
          setRegisterName={setRegisterName}
          registerUsername={registerUsername}
          setRegisterUsername={setRegisterUsername}
          registerPassword={registerPassword}
          setRegisterPassword={setRegisterPassword}
          registerConfirmPassword={registerConfirmPassword}
          setRegisterConfirmPassword={setRegisterConfirmPassword}
          registerError={registerError}
          setRegisterError={setRegisterError}
          registerLoading={registerLoading}
          handleRegister={handleRegister}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative smooth-hardware">

      {/* Dynamic Animated Splash Loading Screen */}
      <SplashLoader 
        isInitialLoading={isInitialLoading} 
        loadingPhase={loadingPhase} 
        loadingProgress={loadingProgress} 
      />

      {/* Ambient background glow mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="absolute -top-20 -left-20 w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-amber-500/15 via-yellow-500/12 to-amber-400/10 blur-[130px] animate-float-blob" />
        <div className="absolute top-[35%] -right-20 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-yellow-500/15 via-amber-400/12 to-yellow-600/10 blur-[140px] animate-float-blob-reverse" />
        <div className="absolute -bottom-20 left-[20%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-amber-400/12 via-yellow-500/10 to-amber-500/10 blur-[120px] animate-float-blob-slow" />
      </div>

      {/* Top Navbar Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        resetWizard={resetWizard}
        userProfile={userProfile}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        authToken={authToken}
        handleLogout={handleLogout}
        setShowSimulatorModal={setShowSimulatorModal}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
      />

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto pb-24 sm:pb-12">

        {/* Admin Superuser Active Banner (Visible to Admin in User Views) */}
        {userProfile?.role === 'admin' && currentTab !== 'admin_portal' && (
          <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900/80 to-amber-950/40 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg animate-fade-in no-print">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
              <span className="font-bold text-slate-200">
                <strong className="text-rose-400 font-black uppercase tracking-wider mr-1.5">👑 Admin Superuser Mode:</strong>
                You have full access to test all patient clinical tools and manage the system.
              </span>
            </div>
            <button
              onClick={() => {
                soundFX.play('switch');
                setCurrentTab('admin_portal');
              }}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-[11px] transition cursor-pointer shrink-0 text-center"
            >
              Open Admin Console &rarr;
            </button>
          </div>
        )}

        {/* Dynamic Page Header Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 no-print">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentTab === 'dashboard' && 'AI Health Risk Dashboard'}
              {currentTab === 'wizard' && 'Clinical Diagnostics Wizard'}
              {currentTab === 'symptom_checker' && 'AI Symptom Checker & Clinical Triage'}
              {currentTab === 'chatbot' && 'HealthBot AI Clinical Assistant'}
              {currentTab === 'results' && 'Diagnostic Risk Evaluation'}
              {currentTab === 'history' && 'Audit History Log'}
              {currentTab === 'insights' && 'Chronological Health Insights'}
              {currentTab === 'account' && 'Account Settings & Management'}
              {currentTab === 'admin_portal' && 'Admin Governance & Management Portal'}
            </h1>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              {currentTab === 'dashboard' && 'Precision predictive metrics and diagnostic profiles.'}
              {currentTab === 'wizard' && 'Record biomarkers to calculate diagnostic health risk evaluations.'}
              {currentTab === 'symptom_checker' && 'Analyze physical symptoms (stomach ache, headache, fever, chest pain) to receive instant clinical triage & specialist advice.'}
              {currentTab === 'chatbot' && '24/7 Conversational AI assistant answering medical, disease, dietary, and lifestyle questions.'}
              {currentTab === 'results' && 'Patient diagnostic probability report.'}
              {currentTab === 'history' && 'Query, review, and manage past risk summaries.'}
              {currentTab === 'insights' && 'Chart vital sign shifts and health index progressions.'}
              {currentTab === 'account' && 'Manage your personal credentials, profile name, and account status.'}
              {currentTab === 'admin_portal' && 'Manage system diagnostics, user accounts, and health assessment pipelines.'}
            </p>
          </div>
        </div>

        {/* Tab Views */}
        {currentTab === 'dashboard' && (
          <Dashboard
            assessments={assessments}
            activeUser={activeUser}
            latestAssessment={latestAssessment}
            overviewRadarData={overviewRadarData}
            overviewTrendData={overviewTrendData}
            getScoreBadgeStyles={getScoreBadgeStyles}
            setCurrentTab={setCurrentTab}
            setShowSimulatorModal={setShowSimulatorModal}
          />
        )}

        {currentTab === 'wizard' && (
          <Wizard
            wizardStep={wizardStep}
            setWizardStep={setWizardStep}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            predicting={predicting}
            calculatedBMI={calculatedBMI}
            bmiDetails={bmiDetails}
            getBiomarkerStatus={getBiomarkerStatus}
            handleNextStep={handleNextStep}
          />
        )}

        {currentTab === 'symptom_checker' && (
          <SymptomChecker
            symptomTags={symptomTags}
            setSymptomTags={setSymptomTags}
            symptomInput={symptomInput}
            setSymptomInput={setSymptomInput}
            symptomDesc={symptomDesc}
            setSymptomDesc={setSymptomDesc}
            symptomDuration={symptomDuration}
            setSymptomDuration={setSymptomDuration}
            symptomSeverity={symptomSeverity}
            setSymptomSeverity={setSymptomSeverity}
            analyzingSymptom={analyzingSymptom}
            symptomResult={symptomResult}
            handleCheckSymptom={handleCheckSymptom}
            resetWizard={resetWizard}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'chatbot' && (
          <HealthChatbot
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            chatLoading={chatLoading}
            handleSendChatMessage={handleSendChatMessage}
            userProfile={userProfile}
          />
        )}

        {currentTab === 'results' && (
          <Results
            resultsAssessment={resultsAssessment}
            getScoreBadgeStyles={getScoreBadgeStyles}
            getRiskLevelDetails={getRiskLevelDetails}
            expandedRisks={expandedRisks}
            setExpandedRisks={setExpandedRisks}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'history' && (
          <History
            historySearch={historySearch}
            setHistorySearch={setHistorySearch}
            historyFilter={historyFilter}
            setHistoryFilter={setHistoryFilter}
            filteredAssessments={filteredAssessments}
            getRiskLevelDetails={getRiskLevelDetails}
            setResultsAssessment={setResultsAssessment}
            setCurrentTab={setCurrentTab}
            handleDeleteAssessment={handleDeleteAssessment}
            renderProtectedTab={renderProtectedTab}
          />
        )}

        {currentTab === 'insights' && (
          <Insights
            insightsUser={insightsUser}
            setInsightsUser={setInsightsUser}
            uniquePatients={uniquePatients}
            insightsScoreTrendData={insightsScoreTrendData}
            insightsVitalsData={insightsVitalsData}
            insightsAggregates={insightsAggregates}
            resetWizard={resetWizard}
            setCurrentTab={setCurrentTab}
            renderProtectedTab={renderProtectedTab}
          />
        )}

        {currentTab === 'account' && (
          <Account
            userProfile={userProfile}
            handleLogout={handleLogout}
            profileName={profileName}
            setProfileName={setProfileName}
            profileMessage={profileMessage}
            profileError={profileError}
            profileLoading={profileLoading}
            handleUpdateProfileName={handleUpdateProfileName}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmNewPassword={confirmNewPassword}
            setConfirmNewPassword={setConfirmNewPassword}
            passwordMessage={passwordMessage}
            passwordError={passwordError}
            handleUpdatePassword={handleUpdatePassword}
            handleDeleteAccount={handleDeleteAccount}
            renderProtectedTab={renderProtectedTab}
          />
        )}

        {currentTab === 'admin_portal' && (
          <AdminPortal
            userProfile={userProfile}
            handleRetrain={handleRetrain}
            retraining={retraining}
            assessments={assessments}
            adminUsersList={adminUsersList}
            showToast={showToast}
            setCurrentTab={setCurrentTab}
            API_BASE_URL={API_BASE_URL}
            authToken={authToken}
          />
        )}

      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        setCurrentTab={setCurrentTab}
        setShowSimulatorModal={setShowSimulatorModal}
        userProfile={userProfile}
        resetWizard={resetWizard}
      />

      {/* Simulator Modal */}
      <SimulatorModal
        showSimulatorModal={showSimulatorModal}
        setShowSimulatorModal={setShowSimulatorModal}
        simParams={simParams}
        setSimParams={setSimParams}
        liveSimResults={liveSimResults}
        setFormData={setFormData}
        setCurrentTab={setCurrentTab}
      />

      {/* Floating Chat Widget Drawer */}
      <ChatWidget
        isChatWidgetOpen={isChatWidgetOpen}
        setIsChatWidgetOpen={setIsChatWidgetOpen}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatLoading={chatLoading}
        handleSendChatMessage={handleSendChatMessage}
      />

    </div>
  );
}
