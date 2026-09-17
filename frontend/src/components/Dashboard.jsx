import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, Stethoscope, Bot, ArrowRight, Activity, 
  ShieldCheck, Zap, Droplet, Sliders, Eye, Sparkles, TrendingUp
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function Dashboard({
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

  const baseScore = latestAssessment?.results?.overallScore || 82;
  const baseHeartRisk = latestAssessment?.results?.risks?.heartDisease ?? latestAssessment?.results?.risks?.heart ?? 12;

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
      status: latestAssessment?.medical?.bpSystolic ? ((latestAssessment.medical.bpSystolic || 120) < 130 ? 'Optimal' : 'Elevated') : 'Baseline Normal',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Activity,
      glow: 'group-hover:border-emerald-500/40'
    },
    {
      label: 'Total Cholesterol',
      value: latestAssessment?.medical?.cholesterol ? `${latestAssessment.medical.cholesterol} mg/dL` : '185 mg/dL',
      status: latestAssessment?.medical?.cholesterol ? ((latestAssessment.medical.cholesterol || 180) < 200 ? 'Desirable' : 'Borderline') : 'Desirable',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: Droplet,
      glow: 'group-hover:border-amber-500/40'
    },
    {
      label: 'Fasting Glucose',
      value: latestAssessment?.medical?.glucose ? `${latestAssessment.medical.glucose} mg/dL` : '92 mg/dL',
      status: latestAssessment?.medical?.glucose ? ((latestAssessment.medical.glucose || 92) < 100 ? 'Normal Fasting' : 'Impaired') : 'Optimal Glycemic',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      icon: Zap,
      glow: 'group-hover:border-cyan-500/40'
    },
    {
      label: 'Resting Heart Rate',
      value: latestAssessment?.medical?.heartRate ? `${latestAssessment.medical.heartRate} BPM` : '68 BPM',
      status: 'Resting Sinus Rhythm',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      icon: HeartPulse,
      glow: 'group-hover:border-rose-500/40'
    }
  ];

  const risks = [
    { label: 'Heart Disease Likelihood', value: latestAssessment?.results?.risks?.heartDisease ?? 12, desc: 'Composite probability of cardiovascular events' },
    { label: 'Coronary Artery Disease (CAD)', value: latestAssessment?.results?.risks?.coronaryArtery ?? 9, desc: 'Arterial stenosis and myocardial perfusion' },
    { label: 'Hypertensive Heart Strain', value: latestAssessment?.results?.risks?.hypertensiveHeart ?? 14, desc: 'Left ventricular workload & vascular resistance' },
    { label: 'Atherosclerosis Plaque Index', value: latestAssessment?.results?.risks?.atherosclerosis ?? 8, desc: 'Vascular wall compliance & oxidized LDL deposition' },
    { label: 'Cardiac Rhythm & Stability', value: latestAssessment?.results?.risks?.arrhythmia ?? 6, desc: 'Autonomic stability & sinoatrial conduction' },
    { label: 'Cardio-Metabolic Endothelium', value: latestAssessment?.results?.risks?.cardioMetabolic ?? 11, desc: 'Microvascular glycemic & insulin resilience' }
  ];

  const overallScore = latestAssessment?.results?.overallScore != null ? latestAssessment.results.overallScore : 82;

  return (
    <div className="space-y-8 animate-tab-fade no-print text-slate-100 max-w-7xl mx-auto">
      
      {/* 1. Main Hero Card: Health Score & Direct Assessment CTA */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl shimmer-card">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Summary & Patient Status */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                latestAssessment 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {latestAssessment ? 'Clinical Assessment Calibrated' : 'Precision Engine Ready'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Active Profile: <strong className="text-white font-bold">{activeUser || 'Patient Record'}</strong>
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {latestAssessment ? (
                <>Cardiovascular <span className="text-gradient-amber">Health Intelligence</span></>
              ) : (
                <>Evaluate Your <span className="text-gradient-amber">Cardiac Risk</span> in 2 Minutes</>
              )}
            </h2>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {latestAssessment 
                ? 'Your multi-biomarker profile has been analyzed using trained machine learning models with calibrated clinical risk metrics.'
                : 'Input your vital signs and lifestyle markers to generate a calibrated cardiovascular evaluation across 6 distinct cardiac sub-dimensions.'}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  soundFX.play('switch');
                  setCurrentTab('wizard');
                }}
                className="btn-magnetic px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs inline-flex items-center gap-2.5 shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                <HeartPulse className="w-4 h-4 animate-pulse" />
                <span>{latestAssessment ? 'Recalculate Heart Risk' : 'Start Heart Risk Assessment'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {latestAssessment && (
                <button
                  onClick={() => {
                    soundFX.play('switch');
                    setCurrentTab('results');
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs inline-flex items-center gap-2 border border-white/10 hover:border-amber-500/40 transition cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>View Full Clinical Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Dynamic Radial Score Dial */}
          <div className="flex flex-col items-center justify-center p-6 glass-card-interactive rounded-3xl min-w-56 shrink-0 relative group">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 filter drop-shadow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-slate-800" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="42" 
                  className="stroke-amber-400 transition-all duration-1000 ease-out" 
                  strokeWidth="8" 
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * Math.min(100, Math.max(0, overallScore))) / 100}
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {overallScore}
                </span>
                <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">Health Score</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{overallScore >= 75 ? 'Optimal Cardiac Resilience' : 'Moderate Clinical Attention'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Core Vitals Telemetry Grid (4 High-Contrast Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((v, idx) => {
          const Icon = v.icon;
          return (
            <div 
              key={idx} 
              className={`glass-card-interactive rounded-2xl p-4.5 space-y-2.5 relative overflow-hidden group ${v.glow}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{v.label}</span>
                <div className="p-2 rounded-xl bg-white/5 text-amber-400 border border-white/5 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">{v.value}</div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block border ${v.color}`}>
                {v.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Section: 6 Cardiovascular Pillars & Interactive Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 6 Cardiovascular Risk Dimensions */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                <span>Cardiovascular Risk Dimensions</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated across 6 clinical biomarker vectors</p>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Multi-Vector AI</span>
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {risks.map((r, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{r.label}</span>
                  <span className="font-black text-amber-400 font-mono">
                    {r.value}% Risk
                  </span>
                </div>
                <div className="w-full bg-slate-900/90 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-linear-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.max(4, r.value)}%` }} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick "What-If" Habit Simulator */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-5 flex flex-col justify-between border-amber-500/20">
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3.5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-amber-400" />
                <span>Interactive "What-If" Simulator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Adjust lifestyle habits to see real-time score projection</p>
            </div>

            {/* Slider 1: Systolic BP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Systolic Blood Pressure</span>
                <span className="text-amber-400 font-mono">{sliderBP} mmHg</span>
              </div>
              <input 
                type="range" min="100" max="180" step="2"
                value={sliderBP}
                onChange={e => {
                  soundFX.play('slider');
                  setSliderBP(parseInt(e.target.value));
                }}
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 2: Cholesterol */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Total Cholesterol</span>
                <span className="text-amber-400 font-mono">{sliderChol} mg/dL</span>
              </div>
              <input 
                type="range" min="140" max="280" step="5"
                value={sliderChol}
                onChange={e => {
                  soundFX.play('slider');
                  setSliderChol(parseInt(e.target.value));
                }}
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 3: Sleep */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Daily Sleep Duration</span>
                <span className="text-amber-400 font-mono">{sliderSleep} hrs</span>
              </div>
              <input 
                type="range" min="4" max="10" step="0.5"
                value={sliderSleep}
                onChange={e => {
                  soundFX.play('slider');
                  setSliderSleep(parseFloat(e.target.value));
                }}
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Projected Outcome Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Projected Heart Score:</span>
              <span className="text-xl font-black text-amber-400 font-mono">{liveProjectedScore} / 100</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Projected Cardiac Risk:</span>
              <span className="text-sm font-black text-emerald-400 font-mono">{liveProjectedRisk}%</span>
            </div>
            <button
              onClick={() => {
                soundFX.play('switch');
                setCurrentTab('wizard');
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-amber-500/20"
            >
              <span>Test in Full Risk Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 4. 3 Interactive Clinical Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Feature 1: Wizard */}
        <div 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('wizard');
          }}
          className="glass-card-interactive rounded-3xl p-5 space-y-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
              Risk Assessor Wizard
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Step-by-step diagnostic prediction assessing 6 targeted cardiovascular clinical sub-dimensions.
            </p>
          </div>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1 pt-1">
            <span>Launch Wizard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Feature 2: Symptom Checker */}
        <div 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('symptom_checker');
          }}
          className="glass-card-interactive rounded-3xl p-5 space-y-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
              Symptom Checker & Triage
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Analyze chest tightness, shortness of breath, or palpitations for immediate red-flag detection.
            </p>
          </div>
          <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 pt-1">
            <span>Check Symptoms</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Feature 3: Cardio AI Assistant */}
        <div 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('chatbot');
          }}
          className="glass-card-interactive rounded-3xl p-5 space-y-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
              HealthBot AI Companion
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              24/7 intelligent answers on blood pressure management, cholesterol levels, and heart-healthy lifestyle.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-1">
            <span>Consult Cardio AI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

      </div>

    </div>
  );
}
