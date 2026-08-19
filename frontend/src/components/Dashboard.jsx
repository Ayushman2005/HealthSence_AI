import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, HeartPulse, ClipboardList, AlertOctagon, 
  Stethoscope, Sparkles, ArrowRight, Activity, TrendingUp, ShieldCheck,
  Zap, Sliders, RefreshCw, Volume2, VolumeX, Eye, Info, ChevronDown, 
  CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Heart, Droplets, Wind, Brain
} from 'lucide-react';
import { Radar, Line } from 'react-chartjs-2';
import { soundFX } from '../utils/audioFX';

export default function Dashboard({
  assessments,
  activeUser,
  latestAssessment,
  overviewRadarData,
  overviewTrendData,
  getScoreBadgeStyles,
  setCurrentTab,
  setShowSimulatorModal
}) {
  // Live Biometric Recalibration Knobs
  const [quickSystolic, setQuickSystolic] = useState(latestAssessment?.medical?.bpSystolic || 120);
  const [quickDiastolic, setQuickDiastolic] = useState(latestAssessment?.medical?.bpDiastolic || 80);
  const [quickGlucose, setQuickGlucose] = useState(latestAssessment?.medical?.glucose || 95);
  const [quickCholesterol, setQuickCholesterol] = useState(latestAssessment?.medical?.cholesterol || 180);
  const [quickBMI, setQuickBMI] = useState(latestAssessment?.personal?.bmi || 23.5);
  const [quickSleep, setQuickSleep] = useState(latestAssessment?.lifestyle?.sleepDuration || 7);

  // Sync with latest assessment whenever it changes
  useEffect(() => {
    if (latestAssessment) {
      setQuickSystolic(latestAssessment.medical?.bpSystolic || 120);
      setQuickDiastolic(latestAssessment.medical?.bpDiastolic || 80);
      setQuickGlucose(latestAssessment.medical?.glucose || 95);
      setQuickCholesterol(latestAssessment.medical?.cholesterol || 180);
      setQuickBMI(latestAssessment.personal?.bmi || 23.5);
      setQuickSleep(latestAssessment.lifestyle?.sleepDuration || 7);
    }
  }, [latestAssessment]);

  // Interactive ECG Rhythm Monitor state
  const [ecgRhythm, setEcgRhythm] = useState('normal'); // 'normal' | 'athletic' | 'elevated' | 'tachy'
  const [isHeartSoundActive, setIsHeartSoundActive] = useState(false);
  const [selectedOrganDetail, setSelectedOrganDetail] = useState(null);

  // AI Voice Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ECG Rhythm parameters
  const rhythmConfig = {
    normal: { bpm: 72, label: 'Normal Sinus Rhythm', color: '#f59e0b', strokeSpeed: '3.2s' },
    athletic: { bpm: 54, label: 'Sinus Bradycardia (Athletic)', color: '#10b981', strokeSpeed: '4.5s' },
    elevated: { bpm: 98, label: 'Elevated Sinus Rhythm', color: '#f59e0b', strokeSpeed: '2.4s' },
    tachy: { bpm: 115, label: 'Sinus Tachycardia (Alert)', color: '#ef4444', strokeSpeed: '1.8s' },
  };

  const activeRhythm = rhythmConfig[ecgRhythm] || rhythmConfig.normal;

  // Heartbeat sound interval
  useEffect(() => {
    if (!isHeartSoundActive) return;
    const intervalMs = Math.round((60 / activeRhythm.bpm) * 1000);
    const timer = setInterval(() => {
      soundFX.play('heartbeat');
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isHeartSoundActive, activeRhythm.bpm]);

  // Dynamic live score simulation calculation based on knobs
  const dynamicMetrics = useMemo(() => {
    let base = latestAssessment?.results?.overallScore || 85;
    const bpDelta = (120 - quickSystolic) * 0.22 + (80 - quickDiastolic) * 0.12;
    const gluDelta = (90 - quickGlucose) * 0.28;
    const cholDelta = (180 - quickCholesterol) * 0.12;
    const bmiDelta = (23.5 - quickBMI) * 0.7;
    const sleepDelta = (quickSleep - 7) * 1.5;

    const computedScore = Math.min(99, Math.max(15, Math.round(base + bpDelta + gluDelta + cholDelta + bmiDelta + sleepDelta)));

    // Recompute organ risks dynamically
    const heartRisk = Math.min(98, Math.max(4, Math.round(
      (latestAssessment?.results?.risks?.heartDisease || 15) + (quickSystolic - 120)*0.35 + (quickCholesterol - 180)*0.18 + (quickBMI - 23.5)*0.8
    )));

    const diabRisk = Math.min(98, Math.max(3, Math.round(
      (latestAssessment?.results?.risks?.diabetes || 12) + (quickGlucose - 90)*0.42 + (quickBMI - 23.5)*1.1
    )));

    const kidneyRisk = Math.min(98, Math.max(2, Math.round(
      (latestAssessment?.results?.risks?.kidneyDisease || 8) + (quickSystolic - 120)*0.25 + (quickGlucose - 90)*0.2
    )));

    const liverRisk = Math.min(98, Math.max(2, Math.round(
      (latestAssessment?.results?.risks?.liverDisease || 9) + (quickBMI - 23.5)*1.2 + (quickCholesterol - 180)*0.1
    )));

    const respRisk = Math.min(98, Math.max(3, Math.round(
      10 + (quickBMI > 28 ? (quickBMI - 28)*1.8 : 0) + (quickSleep < 6 ? 12 : 0)
    )));

    const neuroRisk = Math.min(98, Math.max(4, Math.round(
      12 + (quickSleep < 6 ? 18 : quickSleep > 8 ? 5 : 0) + (quickSystolic > 140 ? 15 : 0)
    )));

    return {
      score: computedScore,
      scoreDelta: computedScore - base,
      heartRisk,
      diabRisk,
      kidneyRisk,
      liverRisk,
      respRisk,
      neuroRisk
    };
  }, [latestAssessment, quickSystolic, quickDiastolic, quickGlucose, quickCholesterol, quickBMI, quickSleep]);

  // 6-Organ Health Matrix Definitions
  const organData = [
    {
      id: 'heart',
      name: 'Cardiovascular System',
      icon: Heart,
      risk: dynamicMetrics.heartRisk,
      vitals: `${quickSystolic}/${quickDiastolic} mmHg`,
      status: dynamicMetrics.heartRisk < 30 ? 'Optimal' : dynamicMetrics.heartRisk < 65 ? 'Elevated' : 'High Risk',
      color: 'from-rose-500 to-pink-600',
      badgeColor: dynamicMetrics.heartRisk < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : dynamicMetrics.heartRisk < 65 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      summary: 'Monitors arterial pressure, coronary perfusion, cardiac output, and lipid deposition indices.',
      tests: ['Lipid Panel (LDL/HDL)', 'Coronary Calcium Scan', '12-Lead ECG']
    },
    {
      id: 'diabetes',
      name: 'Metabolic & Glycemic',
      icon: Activity,
      risk: dynamicMetrics.diabRisk,
      vitals: `${quickGlucose} mg/dL Glucose`,
      status: dynamicMetrics.diabRisk < 30 ? 'Normal Range' : dynamicMetrics.diabRisk < 65 ? 'Borderline' : 'Diabetic Alert',
      color: 'from-amber-500 to-yellow-600',
      badgeColor: dynamicMetrics.diabRisk < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : dynamicMetrics.diabRisk < 65 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      summary: 'Measures beta-cell insulin sensitivity, HbA1c trajectory, and postprandial glucose regulation.',
      tests: ['HbA1c Glycated Hemoglobin', 'Fasting Plasma Insulin', 'HOMA-IR Score']
    },
    {
      id: 'kidney',
      name: 'Renal & Filtration',
      icon: Zap,
      risk: dynamicMetrics.kidneyRisk,
      vitals: `eGFR 108 mL/min`,
      status: dynamicMetrics.kidneyRisk < 30 ? 'Normal Function' : 'Renal Caution',
      color: 'from-indigo-500 to-blue-600',
      badgeColor: dynamicMetrics.kidneyRisk < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      summary: 'Evaluates glomeruli filtration pressure, microalbuminuria clearance, and electrolyte retention.',
      tests: ['Serum Creatinine & eGFR', 'Blood Urea Nitrogen (BUN)', 'Urine Albumin/Creatinine Ratio']
    },
    {
      id: 'liver',
      name: 'Hepatic Function',
      icon: Droplets,
      risk: dynamicMetrics.liverRisk,
      vitals: `ALT/AST Nominal`,
      status: dynamicMetrics.liverRisk < 30 ? 'Optimal Clearance' : 'Elevated Enzymes',
      color: 'from-orange-500 to-amber-600',
      badgeColor: dynamicMetrics.liverRisk < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      summary: 'Tracks hepatic lipid accumulation, transaminase enzymes, bile clearance, and detox pathways.',
      tests: ['Comprehensive Metabolic Panel', 'Liver Ultrasound', 'GGT & Bilirubin']
    },
    {
      id: 'lungs',
      name: 'Pulmonary & Oxygenation',
      icon: Wind,
      risk: dynamicMetrics.respRisk,
      vitals: `SpO2 99% • RR 15/min`,
      status: dynamicMetrics.respRisk < 30 ? 'High Capacity' : 'Airway Caution',
      color: 'from-teal-500 to-emerald-600',
      badgeColor: dynamicMetrics.respRisk < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      summary: 'Analyzes alveolar gas exchange efficiency, forced expiratory volume, and sleep apnea susceptibility.',
      tests: ['Pulse Oximetry', 'Spirometry (FEV1/FVC)', 'High-Resolution Chest CT']
    },
    {
      id: 'neuro',
      name: 'Neurological & Autonomic',
      icon: Brain,
      risk: dynamicMetrics.neuroRisk,
      vitals: `${quickSleep}h Sleep • HRV 68ms`,
      status: dynamicMetrics.neuroRisk < 30 ? 'Balanced Tone' : 'Stress Alert',
      color: 'from-purple-500 to-violet-600',
      badgeColor: dynamicMetrics.neuroRisk < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      summary: 'Evaluates parasympathetic heart rate variability, REM restorative sleep, and cerebrovascular risk.',
      tests: ['Heart Rate Variability (HRV)', 'Polysomnography', 'Cognitive Assessment']
    }
  ];

  // Presets for quick recalibration
  const applyPreset = (type) => {
    soundFX.play('switch');
    if (type === 'optimal') {
      setQuickSystolic(112);
      setQuickDiastolic(74);
      setQuickGlucose(86);
      setQuickCholesterol(165);
      setQuickBMI(21.8);
      setQuickSleep(8);
      setEcgRhythm('athletic');
    } else if (type === 'prediabetic') {
      setQuickSystolic(134);
      setQuickDiastolic(86);
      setQuickGlucose(118);
      setQuickCholesterol(225);
      setQuickBMI(28.4);
      setQuickSleep(6);
      setEcgRhythm('elevated');
    } else if (type === 'hypertensive') {
      setQuickSystolic(158);
      setQuickDiastolic(98);
      setQuickGlucose(145);
      setQuickCholesterol(260);
      setQuickBMI(32.1);
      setQuickSleep(5.5);
      setEcgRhythm('tachy');
    } else {
      // Reset to actual assessment
      if (latestAssessment) {
        setQuickSystolic(latestAssessment.medical?.bpSystolic || 120);
        setQuickDiastolic(latestAssessment.medical?.bpDiastolic || 80);
        setQuickGlucose(latestAssessment.medical?.glucose || 95);
        setQuickCholesterol(latestAssessment.medical?.cholesterol || 180);
        setQuickBMI(latestAssessment.personal?.bmi || 23.5);
        setQuickSleep(latestAssessment.lifestyle?.sleepDuration || 7);
      }
      setEcgRhythm('normal');
    }
  };

  // Text-To-Speech Clinical Readout handler
  const handleVoiceReadout = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      soundFX.play('voice_end');
      return;
    }

    const recommendation = latestAssessment?.results?.recommendations?.immediate?.[0] || 
      latestAssessment?.results?.recommendations?.lifestyle?.[0] || 
      `Clinical health index is rated at ${dynamicMetrics.score} out of 100. Key vitals reflect blood pressure of ${quickSystolic} over ${quickDiastolic} mmHg and fasting blood sugar of ${quickGlucose} milligrams per deciliter. All major organ systems are actively monitored.`;

    const speechText = `HealthSence AI Clinical Diagnostic Summary. Overall health score is ${dynamicMetrics.score} out of 100. Recommendation: ${recommendation}`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      soundFX.play('voice_start');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      soundFX.play('voice_end');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8 animate-fade-in no-print">
      {assessments.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-5 border border-amber-500/20 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center animate-heartbeat shadow-lg shadow-amber-500/20">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="font-extrabold text-2xl text-white">No assessments found</h3>
          <p className="text-sm text-slate-300 font-medium max-w-md leading-relaxed">
            Enter patient biometrics in the clinical wizard to compute your first diagnostic assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button 
              onClick={() => {
                soundFX.play('click');
                setCurrentTab('wizard');
              }}
              className="btn-magnetic bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold py-3.5 px-7 rounded-2xl inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-amber-500/30 transition text-sm"
            >
              <HeartPulse className="w-5 h-5 animate-pulse" /> Start New Risk Assessor
            </button>
            <button 
              onClick={() => {
                soundFX.play('click');
                setCurrentTab('symptom_checker');
              }}
              className="btn-magnetic bg-slate-800/90 hover:bg-slate-750 text-amber-400 border border-amber-500/30 font-extrabold py-3.5 px-7 rounded-2xl inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition text-sm hover:border-amber-400"
            >
              <Stethoscope className="w-5 h-5 text-amber-500" /> Check Symptoms & Triage
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Animated Clinical ECG Telemetry Hero Strip */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-amber-500/25 shadow-xl relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              
              {/* Left Patient Status Tag */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Telemetry Synchronized
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                    Case: {activeUser || 'Primary Patient'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                    {activeRhythm.label}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Clinical Diagnostics Command Center
                </h2>
              </div>

              {/* Center Live Animated ECG Rhythm Wave & Audio Switcher */}
              <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto bg-slate-950/80 border border-amber-500/25 rounded-2xl px-4 py-2.5 shadow-inner">
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      soundFX.play('click');
                      setIsHeartSoundActive(!isHeartSoundActive);
                    }}
                    title={isHeartSoundActive ? "Mute Heartbeat Telemetry Audio" : "Listen to Heartbeat Telemetry Audio"}
                    className="p-1.5 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-rose-400 hover:text-rose-300 cursor-pointer transition"
                  >
                    <HeartPulse className={`w-5 h-5 ${isHeartSoundActive ? 'text-rose-500 animate-heartbeat' : 'text-slate-400'}`} />
                  </button>
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Heart Rate</span>
                    <span className="text-sm font-black text-white font-mono">{activeRhythm.bpm} BPM</span>
                  </div>
                </div>

                {/* SVG ECG Waveform */}
                <div className="w-36 sm:w-56 h-8 overflow-hidden relative">
                  <svg className="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
                    <path
                      d="M 0,20 L 40,20 L 50,5 L 60,35 L 70,10 L 80,25 L 90,20 L 150,20 L 160,5 L 170,35 L 180,10 L 190,25 L 200,20 L 300,20"
                      fill="none"
                      stroke={activeRhythm.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-ecg filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                      style={{ animationDuration: activeRhythm.strokeSpeed }}
                    />
                  </svg>
                </div>

                {/* Rhythm Selector Buttons */}
                <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-3">
                  {[
                    { id: 'normal', label: '72', title: 'Normal Sinus 72 BPM' },
                    { id: 'athletic', label: '54', title: 'Athletic 54 BPM' },
                    { id: 'elevated', label: '98', title: 'Elevated 98 BPM' },
                    { id: 'tachy', label: '115', title: 'Tachycardia 115 BPM' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        soundFX.play('slider');
                        setEcgRhythm(r.id);
                      }}
                      title={r.title}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-extrabold transition cursor-pointer ${
                        ecgRhythm === r.id 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Quick Action Button */}
              <button
                onClick={() => {
                  soundFX.play('click');
                  if (setShowSimulatorModal) setShowSimulatorModal(true);
                }}
                className="btn-magnetic px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer shrink-0"
              >
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Launch Simulator</span>
              </button>

            </div>
          </div>

          {/* Overview Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4 border border-amber-500/20 shadow-lg">
              <div className="w-14 h-14 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-xs">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Evaluations Run</h4>
                <div className="text-3xl font-black text-white font-mono">
                  {assessments.filter(a => a.name === activeUser).length || assessments.length}
                </div>
              </div>
            </div>
            
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4 border border-rose-500/25 shadow-lg">
              <div className="w-14 h-14 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center shadow-xs">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Critical Risk Flags</h4>
                <div className="text-3xl font-black text-white font-mono">
                  {[dynamicMetrics.heartRisk, dynamicMetrics.diabRisk, dynamicMetrics.kidneyRisk, dynamicMetrics.liverRisk, dynamicMetrics.respRisk, dynamicMetrics.neuroRisk].filter(r => r >= 65).length}
                </div>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4 border border-emerald-500/25 shadow-lg">
              <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-xs">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Diagnostic Status</h4>
                <div className={`text-xs font-black mt-1 px-3 py-1 rounded-full border text-center ${
                  [dynamicMetrics.heartRisk, dynamicMetrics.diabRisk, dynamicMetrics.kidneyRisk, dynamicMetrics.liverRisk].some(r => r >= 65)
                    ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                    : 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                }`}>
                  {[dynamicMetrics.heartRisk, dynamicMetrics.diabRisk, dynamicMetrics.kidneyRisk, dynamicMetrics.liverRisk].some(r => r >= 65) ? 'Critical Alert Flagged' : 'Normal Physiological Range'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 6-Organ Health Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>Multi-Organ Physiological Diagnostic Matrix</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                <span>Click any organ card to inspect clinical indicators</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {organData.map(organ => {
                const Icon = organ.icon;
                const isSelected = selectedOrganDetail?.id === organ.id;
                return (
                  <div
                    key={organ.id}
                    onClick={() => {
                      soundFX.play('click');
                      setSelectedOrganDetail(isSelected ? null : organ);
                    }}
                    className={`glass-panel rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                      isSelected 
                        ? 'border-amber-400 shadow-xl shadow-amber-500/25 ring-2 ring-amber-500/30 scale-[1.03] bg-slate-900/90' 
                        : 'border-amber-500/20 hover:border-amber-500/50 hover:scale-[1.02] shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${organ.badgeColor}`}>
                        {organ.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-white truncate">{organ.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{organ.vitals}</p>

                    {/* Risk progress bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-slate-400">Risk</span>
                        <span className="text-white font-mono">{organ.risk}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${organ.color}`}
                          style={{ width: `${organ.risk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Organ Deep-Dive Banner */}
            {selectedOrganDetail && (
              <div className="p-5 glass-panel rounded-3xl border border-amber-500/30 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 animate-modal-spring flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-400" />
                      <span>{selectedOrganDetail.name} Clinical Protocol</span>
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${selectedOrganDetail.badgeColor}`}>
                      Calculated Risk: {selectedOrganDetail.risk}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {selectedOrganDetail.summary}
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400">Recommended Panels:</span>
                    {selectedOrganDetail.tests.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrganDetail(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Health Score Wheel + Live Recalibration Studio */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 xl:col-span-4 flex flex-col justify-between border border-amber-500/20 shadow-xl space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-lg text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <span>Overall Health Score</span>
                  </h2>
                  <span className={`text-[11px] font-black uppercase tracking-wider border rounded-full px-3 py-1 ${getScoreBadgeStyles(dynamicMetrics.score).style}`}>
                    {getScoreBadgeStyles(dynamicMetrics.score).label}
                  </span>
                </div>

                {/* Score Circular Wheel */}
                <div className="flex justify-center py-2">
                  <div className="circle-progress-container relative w-44 h-44 flex items-center justify-center cursor-pointer group">
                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md" viewBox="0 0 160 160">
                      <circle className="stroke-slate-800 fill-none" cx="80" cy="80" r="70" strokeWidth="11"></circle>
                      <circle 
                        className="transition-all duration-500 ease-out fill-none"
                        cx="80" 
                        cy="80" 
                        r="70" 
                        strokeWidth="11" 
                        stroke={getScoreBadgeStyles(dynamicMetrics.score).color}
                        strokeDasharray={439.8}
                        strokeDashoffset={439.8 - (439.8 * dynamicMetrics.score) / 100}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute text-center group-hover:scale-110 transition-transform">
                      <div className="text-4xl font-black text-white font-mono">{dynamicMetrics.score}</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mt-1">Score / 100</div>
                      {dynamicMetrics.scoreDelta !== 0 && (
                        <div className={`text-[10px] font-bold ${dynamicMetrics.scoreDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {dynamicMetrics.scoreDelta > 0 ? `+${dynamicMetrics.scoreDelta}` : dynamicMetrics.scoreDelta} vs baseline
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Interactive Biometrics Recalibration Knobs */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-amber-400" /> Live Recalibration Knobs</span>
                    <span className="text-amber-400 font-mono text-[10px]">Real-Time Sync</span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pb-1">
                    <button
                      type="button"
                      onClick={() => applyPreset('optimal')}
                      className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold cursor-pointer"
                    >
                      Optimal
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('prediabetic')}
                      className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold cursor-pointer"
                    >
                      Pre-Diab
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('hypertensive')}
                      className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold cursor-pointer"
                    >
                      High BP
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('reset')}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] font-bold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Systolic BP slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Systolic Blood Pressure</span>
                      <span className="text-white font-mono">{quickSystolic} mmHg</span>
                    </div>
                    <input 
                      type="range"
                      min="90"
                      max="180"
                      value={quickSystolic}
                      onChange={e => {
                        soundFX.play('slider');
                        setQuickSystolic(parseInt(e.target.value));
                      }}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  {/* Fasting Glucose slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Fasting Glucose</span>
                      <span className="text-white font-mono">{quickGlucose} mg/dL</span>
                    </div>
                    <input 
                      type="range"
                      min="70"
                      max="220"
                      value={quickGlucose}
                      onChange={e => {
                        soundFX.play('slider');
                        setQuickGlucose(parseInt(e.target.value));
                      }}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  {/* Total Cholesterol slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Total Cholesterol</span>
                      <span className="text-white font-mono">{quickCholesterol} mg/dL</span>
                    </div>
                    <input 
                      type="range"
                      min="130"
                      max="300"
                      value={quickCholesterol}
                      onChange={e => {
                        soundFX.play('slider');
                        setQuickCholesterol(parseInt(e.target.value));
                      }}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Recommendation Card with Voice Readout */}
              <div className="glass-pill rounded-2xl p-4 flex flex-col gap-3 border border-amber-500/20 bg-amber-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="font-extrabold text-xs text-white">Clinical AI Recommendation</span>
                  </div>

                  {/* TTS Voice Readout Button */}
                  <button
                    onClick={handleVoiceReadout}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[10px] font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    {isSpeaking ? (
                      <>
                        {/* Equalizer Sound Wave Animation */}
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-1 bg-amber-400 animate-eq-1 rounded-full" />
                          <span className="w-1 bg-amber-400 animate-eq-2 rounded-full" />
                          <span className="w-1 bg-amber-400 animate-eq-3 rounded-full" />
                          <span className="w-1 bg-amber-400 animate-eq-4 rounded-full" />
                        </div>
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Listen AI Voice</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {latestAssessment?.results?.recommendations?.immediate?.[0] || latestAssessment?.results?.recommendations?.lifestyle?.[0] || 'No critical warnings. Maintain healthy nutrition, regular aerobic exercise, and annual clinical screenings.'}
                </p>
              </div>
            </div>

            {/* Right Column: Graphs */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Radar Chart */}
              <div className="glass-panel rounded-3xl p-6 h-[330px] border border-amber-500/20 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-lg text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <span>Patient Organ Risk Profile</span>
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                    6-Point Biomarker Model
                  </span>
                </div>
                <div className="h-full max-h-[240px] flex justify-center">
                  {overviewRadarData && (
                    <Radar 
                      data={overviewRadarData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          r: {
                            grid: { color: 'rgba(245, 158, 11, 0.15)' },
                            angleLines: { color: 'rgba(245, 158, 11, 0.2)' },
                            ticks: { display: false },
                            pointLabels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' } }
                          }
                        }
                      }} 
                    />
                  )}
                </div>
              </div>

              {/* Timeline Line Chart */}
              <div className="glass-panel rounded-3xl p-6 h-[330px] border border-amber-500/20 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Health Score Progression</span>
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                    Temporal Analytics
                  </span>
                </div>
                <div className="h-full max-h-[240px]">
                  {overviewTrendData && (
                    <Line 
                      data={overviewTrendData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } },
                          y: { min: 0, max: 100, grid: { color: 'rgba(245, 158, 11, 0.15)' }, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } }
                        }
                      }} 
                    />
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => {
                soundFX.play('click');
                setCurrentTab('wizard');
              }}
              className="glass-panel glass-panel-hover rounded-3xl p-6 text-left flex items-center justify-between cursor-pointer transition-all border border-amber-500/20 group shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">Perform Health Assessment</h4>
                  <p className="text-xs text-slate-300 mt-1 font-medium">Input biometrics to calculate precision diagnostic risk predictions.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button 
              onClick={() => {
                soundFX.play('click');
                setCurrentTab('history');
              }}
              className="glass-panel glass-panel-hover rounded-3xl p-6 text-left flex items-center justify-between cursor-pointer transition-all border border-emerald-500/25 group shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">Browse Audit History</h4>
                  <p className="text-xs text-slate-300 mt-1 font-medium">Review, filter, and compare past patient risk logs.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
