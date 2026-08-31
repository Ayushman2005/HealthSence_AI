import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, Stethoscope, Bot, ArrowRight, Activity, 
  ShieldCheck, AlertTriangle, Zap, CheckCircle2, TrendingUp,
  Droplet, Sliders, RefreshCw, Eye
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function Dashboard({
  assessments,
  activeUser,
  latestAssessment,
  overviewRadarData: _overviewRadarData,
  overviewTrendData: _overviewTrendData,
  getScoreBadgeStyles: _getScoreBadgeStyles,
  setCurrentTab,
  setShowSimulatorModal: _setShowSimulatorModal
}) {
  // Simple quick-slider simulator states
  const [sliderBP, setSliderBP] = useState(latestAssessment?.medical?.bpSystolic || 120);
  const [sliderChol, setSliderChol] = useState(latestAssessment?.medical?.cholesterol || 180);
  const [sliderSleep, setSliderSleep] = useState(latestAssessment?.lifestyle?.sleepDuration || 7.5);

  const baseScore = latestAssessment?.results?.overallScore || 85;
  const baseHeartRisk = latestAssessment?.results?.risks?.heartDisease ?? latestAssessment?.results?.risks?.heart ?? 6;

  // Real-time projected score based on quick sliders
  const liveProjectedScore = useMemo(() => {
    const bpDiff = (120 - sliderBP) * 0.3;
    const cholDiff = (180 - sliderChol) * 0.15;
    const sleepDiff = (sliderSleep - 7) * 1.5;
    return Math.min(99, Math.max(20, Math.round(baseScore + bpDiff + cholDiff + sleepDiff)));
  }, [baseScore, sliderBP, sliderChol, sliderSleep]);

  const liveProjectedRisk = useMemo(() => {
    const bpDiff = (sliderBP - 120) * 0.35;
    const cholDiff = (sliderChol - 180) * 0.2;
    return Math.min(95, Math.max(3, Math.round(baseHeartRisk + bpDiff + cholDiff)));
  }, [baseHeartRisk, sliderBP, sliderChol]);

  const vitals = [
    {
      label: 'Blood Pressure',
      value: latestAssessment?.medical?.bpSystolic ? `${latestAssessment.medical.bpSystolic} / ${latestAssessment.medical.bpDiastolic} mmHg` : '120 / 80 mmHg',
      status: (latestAssessment?.medical?.bpSystolic || 120) < 130 ? 'Normal' : 'Elevated',
      color: (latestAssessment?.medical?.bpSystolic || 120) < 130 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10',
      icon: Activity
    },
    {
      label: 'Total Cholesterol',
      value: latestAssessment?.medical?.cholesterol ? `${latestAssessment.medical.cholesterol} mg/dL` : '180 mg/dL',
      status: (latestAssessment?.medical?.cholesterol || 180) < 200 ? 'Desirable' : 'Borderline',
      color: (latestAssessment?.medical?.cholesterol || 180) < 200 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10',
      icon: Droplet
    },
    {
      label: 'Fasting Glucose',
      value: latestAssessment?.medical?.glucose ? `${latestAssessment.medical.glucose} mg/dL` : '92 mg/dL',
      status: (latestAssessment?.medical?.glucose || 92) < 100 ? 'Normal' : 'Elevated',
      color: (latestAssessment?.medical?.glucose || 92) < 100 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10',
      icon: Zap
    },
    {
      label: 'Resting Heart Rate',
      value: latestAssessment?.medical?.heartRate ? `${latestAssessment.medical.heartRate} BPM` : '72 BPM',
      status: 'Resting Sinus',
      color: 'text-emerald-400 bg-emerald-500/10',
      icon: HeartPulse
    }
  ];

  const risks = [
    { label: 'Heart Disease Likelihood (Core ML)', value: latestAssessment?.results?.risks?.heartDisease ?? 5, desc: 'Ensemble probability of cardiovascular events' },
    { label: 'Coronary Artery Disease (CAD)', value: latestAssessment?.results?.risks?.coronaryArtery ?? 4, desc: 'Arterial stenosis and myocardial perfusion' },
    { label: 'Hypertensive Heart Strain', value: latestAssessment?.results?.risks?.hypertensiveHeart ?? 4, desc: 'Left ventricular workload & vascular resistance' },
    { label: 'Atherosclerosis Plaque Index', value: latestAssessment?.results?.risks?.atherosclerosis ?? 4, desc: 'Vascular stiffness & oxidized LDL lipids' },
    { label: 'Cardiac Rhythm & Stability', value: latestAssessment?.results?.risks?.arrhythmia ?? 3, desc: 'Resting rhythm & autonomic electrophysiology' },
    { label: 'Cardio-Metabolic Endothelium', value: latestAssessment?.results?.risks?.cardioMetabolic ?? 4, desc: 'Microvascular glycemic & insulin resilience' }
  ];

  return (
    <div className="space-y-6 animate-fade-in no-print text-slate-800 max-w-7xl mx-auto">
      
      {/* 1. Main Hero Card: Health Score & Direct Assessment CTA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Summary & Patient Status */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {latestAssessment ? 'Latest Assessment Verified' : 'Ready for New Assessment'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Patient: <strong className="text-slate-900">{activeUser || 'Active Patient'}</strong>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {latestAssessment ? 'Cardiovascular Health Overview' : 'Check Your Heart Disease Risk in 2 Minutes'}
            </h2>

            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {latestAssessment 
                ? 'Your cardiovascular biomarkers and lifestyle habits indicate optimal heart health with low probability of coronary artery disease.'
                : 'Evaluate your heart disease risk using 5 calibrated machine learning models. Enter your vitals to receive immediate clinical insights and actionable guidance.'}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  soundFX.play('switch');
                  setCurrentTab('wizard');
                }}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs inline-flex items-center gap-2 shadow-sm shadow-amber-500/20 transition cursor-pointer"
              >
                <HeartPulse className="w-4 h-4" />
                <span>{latestAssessment ? 'Recalculate Heart Risk' : 'Start Heart Risk Check'}</span>
              </button>

              {latestAssessment && (
                <button
                  onClick={() => {
                    soundFX.play('switch');
                    setCurrentTab('results');
                  }}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-2 border border-slate-200 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>View Detailed Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Clean Heart Score Dial */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 min-w-52 shrink-0 shadow-xs">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-slate-200" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="42" 
                  className="stroke-amber-500 transition-all duration-1000" 
                  strokeWidth="8" 
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * (latestAssessment?.results?.overallScore || 85)) / 100}
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 font-mono">{latestAssessment?.results?.overallScore || 85}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">/ 100 Score</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 mt-2.5">Optimal Heart Health</span>
          </div>

        </div>
      </div>

      {/* 2. Core Vitals Grid (4 Clean Metric Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((v, idx) => {
          const Icon = v.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{v.label}</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">{v.value}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                v.status === 'Normal' || v.status === 'Desirable' || v.status === 'Resting Sinus'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {v.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Section: 6 Cardiovascular Pillars & Interactive Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 6 Cardiovascular Risk Dimensions */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cardiovascular Risk Dimensions</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated across 5 machine learning models</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Low Risk Range
            </span>
          </div>

          <div className="space-y-3.5">
            {risks.map((r, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{r.label}</span>
                  <span className="font-black text-emerald-600 font-mono">{r.value}% Risk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(4, r.value)}%` }} 
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick What-If Simulator */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Quick "What-If" Habit Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Adjust habits to see projected heart score changes</p>
            </div>

            {/* Slider 1: Systolic BP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Systolic Blood Pressure</span>
                <span className="text-amber-600 font-mono">{sliderBP} mmHg</span>
              </div>
              <input 
                type="range" min="100" max="180" step="2"
                value={sliderBP}
                onChange={e => setSliderBP(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 2: Cholesterol */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Total Cholesterol</span>
                <span className="text-amber-600 font-mono">{sliderChol} mg/dL</span>
              </div>
              <input 
                type="range" min="140" max="280" step="5"
                value={sliderChol}
                onChange={e => setSliderChol(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 3: Sleep */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Daily Sleep Duration</span>
                <span className="text-amber-600 font-mono">{sliderSleep} hrs</span>
              </div>
              <input 
                type="range" min="4" max="10" step="0.5"
                value={sliderSleep}
                onChange={e => setSliderSleep(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Projected Outcome Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Projected Heart Score:</span>
              <span className="text-lg font-black text-amber-600 font-mono">{liveProjectedScore} / 100</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Projected Heart Risk:</span>
              <span className="text-sm font-black text-emerald-600 font-mono">{liveProjectedRisk}%</span>
            </div>
            <button
              onClick={() => {
                soundFX.play('switch');
                setCurrentTab('wizard');
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-amber-600 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <span>Test in Full Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 4. 3 Clean Clinical Feature Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Feature 1: Wizard */}
        <div 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('wizard');
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.01] group shadow-xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
              Risk Assessor Wizard
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step assessment calculating 6 heart risk sub-dimensions with 5 ML models.
            </p>
          </div>
          <div className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-1">
            <span>Start Assessment</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Feature 2: Symptom Checker */}
        <div 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('symptom_checker');
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-yellow-500/40 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.01] group shadow-xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-yellow-600 transition-colors">
              Symptom Checker & Triage
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Analyze chest pain, shortness of breath, or fatigue for immediate red-flag detection.
            </p>
          </div>
          <div className="text-xs font-bold text-yellow-600 flex items-center gap-1 pt-1">
            <span>Check Symptoms</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Feature 3: Cardio AI Assistant */}
        <div 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('chatbot');
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500/40 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.01] group shadow-xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
              HealthBot AI Assistant
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Ask questions on blood pressure, cholesterol management, DASH diet, and cardiac health.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-1">
            <span>Chat with AI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

    </div>
  );
}

