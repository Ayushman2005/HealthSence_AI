import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  HeartPulse, Stethoscope, Bot, ArrowRight, Activity,
  ShieldCheck, Zap, Droplet, Sliders, Eye, Sparkles,
  TrendingUp, TrendingDown, Clock, BarChart3, Cpu
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

/* Animated counter hook */
function useAnimatedNumber(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const initial = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(initial + (target - initial) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

export default function Dashboard({
  activeUser,
  latestAssessment,
  overviewRadarData: _overviewRadarData,
  overviewTrendData: _overviewTrendData,
  getScoreBadgeStyles: _getScoreBadgeStyles,
  setCurrentTab,
  setShowSimulatorModal: _setShowSimulatorModal
}) {
  const [sliderBP, setSliderBP] = useState(latestAssessment?.medical?.bpSystolic || 120);
  const [sliderChol, setSliderChol] = useState(latestAssessment?.medical?.cholesterol || 180);
  const [sliderSleep, setSliderSleep] = useState(latestAssessment?.lifestyle?.sleepDuration || 7.5);
  const barsRef = useRef(null);
  const [barsVisible, setBarsVisible] = useState(false);

  const hasAssessment = Boolean(latestAssessment && latestAssessment.results && latestAssessment.results.overallScore != null);
  const overallScore = hasAssessment ? latestAssessment.results.overallScore : null;
  const animatedScore = useAnimatedNumber(hasAssessment ? overallScore : 0);

  const baseScore = hasAssessment ? (latestAssessment.results.overallScore || 80) : null;
  const baseHeartRisk = hasAssessment ? (latestAssessment.results.risks?.heartDisease ?? latestAssessment.results.risks?.heart ?? 15) : null;

  useEffect(() => {
    if (latestAssessment?.medical?.bpSystolic) {
      setSliderBP(latestAssessment.medical.bpSystolic);
    }
    if (latestAssessment?.medical?.cholesterol) {
      setSliderChol(latestAssessment.medical.cholesterol);
    }
    if (latestAssessment?.lifestyle?.sleepDuration) {
      setSliderSleep(latestAssessment.lifestyle.sleepDuration);
    }
  }, [latestAssessment]);

  const liveProjectedScore = useMemo(() => {
    if (baseScore == null) return null;
    const bpDiff = (120 - sliderBP) * 0.3;
    const cholDiff = (180 - sliderChol) * 0.15;
    const sleepDiff = (sliderSleep - 7) * 1.5;
    return Math.min(99, Math.max(20, Math.round(baseScore + bpDiff + cholDiff + sleepDiff)));
  }, [baseScore, sliderBP, sliderChol, sliderSleep]);

  const liveProjectedRisk = useMemo(() => {
    if (baseHeartRisk == null) return null;
    const bpDiff = (sliderBP - 120) * 0.35;
    const cholDiff = (sliderChol - 180) * 0.2;
    return Math.min(95, Math.max(3, Math.round(baseHeartRisk + bpDiff + cholDiff)));
  }, [baseHeartRisk, sliderBP, sliderChol]);

  // Animate risk bars on mount
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarsVisible(true); }, { threshold: 0.1 });
    if (barsRef.current) obs.observe(barsRef.current);
    return () => obs.disconnect();
  }, []);

  // Determine score color
  const scoreColor = hasAssessment
    ? overallScore >= 80
      ? { stroke: '#10b981', text: 'text-emerald-400', label: 'Excellent Cardiac Health', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' }
      : overallScore >= 65
      ? { stroke: '#f59e0b', text: 'text-amber-400', label: 'Moderate Cardiac Health', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' }
      : { stroke: '#f43f5e', text: 'text-rose-400', label: 'Elevated Cardiac Risk', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400' }
    : { stroke: '#64748b', text: 'text-slate-400', label: 'Inputs Required', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300' };

  const vitals = [
    {
      label: 'Blood Pressure',
      value: latestAssessment?.medical?.bpSystolic
        ? `${latestAssessment.medical.bpSystolic}/${latestAssessment.medical.bpDiastolic}`
        : '--/--',
      unit: 'mmHg',
      status: latestAssessment?.medical?.bpSystolic
        ? ((latestAssessment.medical.bpSystolic || 120) < 130 ? 'Optimal' : 'Elevated')
        : 'Pending Input',
      statusOk: latestAssessment?.medical?.bpSystolic ? ((latestAssessment.medical.bpSystolic || 120) < 130) : false,
      icon: Activity,
      colorClass: 'stat-card-emerald',
      iconBg: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-400',
      badgeOk: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      badgeBad: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      trendIcon: TrendingDown,
      trendColor: 'text-emerald-400',
    },
    {
      label: 'Total Cholesterol',
      value: latestAssessment?.medical?.cholesterol
        ? `${latestAssessment.medical.cholesterol}`
        : '--',
      unit: 'mg/dL',
      status: latestAssessment?.medical?.cholesterol
        ? ((latestAssessment.medical.cholesterol || 180) < 200 ? 'Desirable' : 'Borderline')
        : 'Pending Input',
      statusOk: latestAssessment?.medical?.cholesterol ? ((latestAssessment.medical.cholesterol || 185) < 200) : false,
      icon: Droplet,
      colorClass: 'stat-card-amber',
      iconBg: 'bg-amber-500/12 border-amber-500/25 text-amber-400',
      badgeOk: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      badgeBad: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      trendIcon: TrendingDown,
      trendColor: 'text-amber-400',
    },
    {
      label: 'Fasting Glucose',
      value: latestAssessment?.medical?.glucose
        ? `${latestAssessment.medical.glucose}`
        : '--',
      unit: 'mg/dL',
      status: latestAssessment?.medical?.glucose
        ? ((latestAssessment.medical.glucose || 92) < 100 ? 'Normal' : 'Impaired')
        : 'Pending Input',
      statusOk: latestAssessment?.medical?.glucose ? ((latestAssessment.medical.glucose || 92) < 100) : false,
      icon: Zap,
      colorClass: 'stat-card-cyan',
      iconBg: 'bg-cyan-500/12 border-cyan-500/25 text-cyan-400',
      badgeOk: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      badgeBad: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
      trendIcon: TrendingDown,
      trendColor: 'text-cyan-400',
    },
    {
      label: 'Resting Heart Rate',
      value: latestAssessment?.medical?.heartRate
        ? `${latestAssessment.medical.heartRate}`
        : '--',
      unit: 'BPM',
      status: latestAssessment?.medical?.heartRate ? 'Sinus Rhythm' : 'Pending Input',
      statusOk: Boolean(latestAssessment?.medical?.heartRate),
      icon: HeartPulse,
      colorClass: 'stat-card-rose',
      iconBg: 'bg-rose-500/12 border-rose-500/25 text-rose-400',
      badgeOk: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      badgeBad: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
      trendIcon: TrendingUp,
      trendColor: 'text-rose-400',
    }
  ];

  const risks = [
    { label: 'Heart Disease Likelihood', value: hasAssessment ? (latestAssessment?.results?.risks?.heartDisease ?? 12) : null, desc: 'Composite probability of cardiovascular events', color: '#f43f5e' },
    { label: 'Type 2 Diabetes Risk', value: hasAssessment ? (latestAssessment?.results?.risks?.diabetes ?? 10) : null, desc: 'Fasting glucose, insulin resistance & metabolic likelihood', color: '#10b981' },
    { label: 'Coronary Artery Disease', value: hasAssessment ? (latestAssessment?.results?.risks?.coronaryArtery ?? 9) : null, desc: 'Arterial stenosis & myocardial perfusion', color: '#f59e0b' },
    { label: 'Hypertensive Heart Strain', value: hasAssessment ? (latestAssessment?.results?.risks?.hypertensiveHeart ?? 14) : null, desc: 'Left ventricular workload & vascular resistance', color: '#f97316' },
    { label: 'Atherosclerosis Index', value: hasAssessment ? (latestAssessment?.results?.risks?.atherosclerosis ?? 8) : null, desc: 'Vascular wall compliance & oxidized LDL', color: '#8b5cf6' },
    { label: 'Cardiac Rhythm Stability', value: hasAssessment ? (latestAssessment?.results?.risks?.arrhythmia ?? 6) : null, desc: 'Autonomic & sinoatrial conduction health', color: '#06b6d4' },
    { label: 'Cardio-Metabolic Score', value: hasAssessment ? (latestAssessment?.results?.risks?.cardioMetabolic ?? 11) : null, desc: 'Microvascular glycemic & insulin resilience', color: '#38bdf8' },
  ];

  return (
    <div className="space-y-6 animate-tab-fade no-print text-slate-100 max-w-7xl mx-auto">

      {/* ═══ 0. NEW USER / INPUTS REQUIRED CALLOUT ═══ */}
      {!hasAssessment && (
        <div className="glass-panel rounded-3xl p-5 border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white">Cardiovascular Health Score Uncalculated</h4>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Provide your vital signs and biomarker inputs to generate your personalized health score and clinical risk breakdown.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.play('switch');
              setCurrentTab('wizard');
            }}
            className="btn-magnetic px-5 py-3 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/25 shrink-0 cursor-pointer hover:scale-105 transition-all"
          >
            <span>Input Biomarkers Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ═══ 1. HERO CARD ═══ */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/8 relative overflow-hidden shimmer-card">
        {/* Ambient glows */}
        <div className="absolute -top-28 -right-28 w-95 h-95 rounded-full bg-amber-500/12 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-85 h-85 rounded-full bg-emerald-500/8 blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none rounded-3xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">

          {/* Left: Summary */}
          <div className="space-y-5 max-w-2xl flex-1">
            {/* Status badges row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 border ${
                hasAssessment ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/12 text-amber-300 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hasAssessment ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                {hasAssessment ? 'Assessment Calibrated' : 'Inputs Required'}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Active Profile: <strong className="text-slate-200 font-bold">{activeUser || 'Patient Record'}</strong>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold ml-auto">
                <Cpu className="w-3 h-3 text-amber-400" />
                Multi-Vector AI
              </span>
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-3xl sm:text-[2.4rem] font-black text-white tracking-tight leading-tight">
                {hasAssessment ? (
                  <>Cardiovascular <span className="text-gradient-amber">Health Intelligence</span></>
                ) : (
                  <>Evaluate Your <span className="text-gradient-amber">Health Score</span> in 2 Minutes</>
                )}
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mt-3 max-w-lg">
                {hasAssessment
                  ? 'Your multi-biomarker profile has been analyzed using trained machine learning models with calibrated clinical risk metrics across 6 cardiovascular dimensions.'
                  : 'Please input your vital signs and lifestyle markers to generate a calibrated cardiovascular evaluation across 6 distinct cardiac sub-dimensions.'}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => { soundFX.play('switch'); setCurrentTab('wizard'); }}
                id="dashboard-start-assessment"
                className="btn-magnetic px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-black text-sm inline-flex items-center gap-2.5 shadow-lg shadow-amber-500/30 cursor-pointer"
              >
                <HeartPulse className="w-4.5 h-4.5 animate-pulse" />
                <span>{hasAssessment ? 'Recalculate Risk' : 'Enter Inputs & Calculate Score'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {hasAssessment && (
                <button
                  onClick={() => { soundFX.play('switch'); setCurrentTab('results'); }}
                  id="dashboard-view-report"
                  className="px-5 py-3.5 rounded-2xl btn-ghost text-slate-200 hover:text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>View Full Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Health Score Dial */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative p-5 rounded-3xl glass-card-interactive border border-white/8 group">
              {/* Outer ambient glow ring */}
              <div
                className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none transition-opacity group-hover:opacity-60"
                style={{ boxShadow: `0 0 40px ${scoreColor.stroke}40` }}
              />

              {/* SVG Dial */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
                  {/* Background track */}
                  <circle cx="55" cy="55" r="46" stroke="rgba(30,41,59,0.8)" strokeWidth="8" fill="none" />
                  {/* Glow filter */}
                  <defs>
                    <filter id="dialGlow">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {/* Progress arc */}
                  {hasAssessment ? (
                    <circle
                      cx="55" cy="55" r="46"
                      stroke={scoreColor.stroke}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      strokeDashoffset={2 * Math.PI * 46 - (2 * Math.PI * 46 * Math.min(100, Math.max(0, overallScore))) / 100}
                      strokeLinecap="round"
                      fill="none"
                      filter="url(#dialGlow)"
                      style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    />
                  ) : (
                    <circle
                      cx="55" cy="55" r="46"
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth="8"
                      strokeDasharray="4 8"
                      fill="none"
                    />
                  )}
                  {/* Tick marks at 25, 50, 75 */}
                  {[0, 25, 50, 75].map(pct => {
                    const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
                    const x1 = 55 + 50 * Math.cos(angle);
                    const y1 = 55 + 50 * Math.sin(angle);
                    const x2 = 55 + 44 * Math.cos(angle);
                    const y2 = 55 + 44 * Math.sin(angle);
                    return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />;
                  })}
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {hasAssessment ? (
                    <>
                      <span className={`text-4xl font-black font-mono tracking-tight ${scoreColor.text}`}>
                        {animatedScore}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">/ 100</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black font-mono tracking-tight text-slate-500">
                        --
                      </span>
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">No Score</span>
                    </>
                  )}
                </div>
              </div>

              {/* Score label */}
              <div className="mt-3 text-center">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black ${scoreColor.bg}`}>
                  {hasAssessment ? <Sparkles className="w-3 h-3" /> : <Activity className="w-3 h-3 text-amber-400 animate-pulse" />}
                  <span>{scoreColor.label}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium mt-1.5 font-mono">
                  {hasAssessment ? 'HealthSence Score™' : 'Inputs Needed'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ 2. VITALS TELEMETRY GRID ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {vitals.map((v, idx) => {
          const Icon = v.icon;
          const TrendIcon = v.trendIcon;
          return (
            <div
              key={idx}
              className={`glass-card-interactive rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden group shimmer-card border border-white/6 ${v.colorClass} cursor-default`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Top row: label + icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v.label}</span>
                <div className={`p-2 rounded-xl border ${v.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Value + Unit */}
              <div className="flex items-end gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">{v.value}</span>
                <span className="text-[11px] text-slate-500 font-bold mb-0.5">{v.unit}</span>
              </div>

              {/* Status badge + trend icon */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block border ${
                  v.statusOk ? v.badgeOk : v.badgeBad
                }`}>
                  {v.status}
                </span>
                <TrendIcon className={`w-3.5 h-3.5 ${v.trendColor} opacity-60`} />
              </div>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-40 transition-opacity group-hover:opacity-80`}
                style={{ background: `linear-gradient(90deg, transparent, ${
                  v.colorClass.includes('emerald') ? '#10b981' :
                  v.colorClass.includes('amber') ? '#f59e0b' :
                  v.colorClass.includes('cyan') ? '#06b6d4' : '#f43f5e'
                }, transparent)` }}
              />
            </div>
          );
        })}
      </div>

      {/* ═══ 3. MIDDLE: RISK DIMENSIONS + SIMULATOR ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: 6 Cardiovascular Risk Dimensions */}
        <div ref={barsRef} className="lg:col-span-7 glass-panel rounded-3xl p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/12 border border-emerald-500/25">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Cardiovascular Risk Dimensions</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">6 biomarker vectors · AI-calibrated clinical assessment</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-300 bg-emerald-500/8 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Analysis
            </span>
          </div>

          {/* Risk bars */}
          <div className="space-y-4 pt-1">
            {!hasAssessment && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span>Awaiting health inputs to calculate calibrated clinical risk vectors.</span>
                </div>
                <button
                  type="button"
                  onClick={() => { soundFX.play('switch'); setCurrentTab('wizard'); }}
                  className="font-black text-amber-400 hover:text-white underline cursor-pointer shrink-0"
                >
                  Enter Inputs &rarr;
                </button>
              </div>
            )}
            {risks.map((r, idx) => {
              const hasVal = r.value !== null && Number.isFinite(r.value);
              const isHigh = hasVal && r.value > 20;
              const isMedium = hasVal && r.value > 12;
              return (
                <div key={idx} className="space-y-1.5" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border font-mono ${
                          !hasVal ? 'text-slate-500 bg-slate-500/10 border-slate-500/20' :
                          isHigh ? 'text-rose-400 bg-rose-500/10 border-rose-500/25' :
                          isMedium ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
                          'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                        }`}
                      >
                        {hasVal ? `${r.value}%` : '--%'}
                      </span>
                    </div>
                  </div>
                  {/* Bar track */}
                  <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-white/4 relative">
                    <div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        width: hasVal && barsVisible ? `${Math.max(3, r.value)}%` : '0%',
                        background: hasVal ? `linear-gradient(90deg, ${r.color}99, ${r.color})` : 'transparent',
                        boxShadow: hasVal ? `0 0 10px ${r.color}50` : 'none',
                        transition: `width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.08}s`
                      }}
                    >
                      {/* Shimmer inside bar */}
                      {hasVal && (
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                          style={{ animation: 'shimmerLight 2s ease-in-out infinite' }}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: What-If Simulator */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-5 flex flex-col justify-between border-amber-500/15">
          {/* Header */}
          <div className="border-b border-white/8 pb-4">
            <h3 className="font-black text-base text-white flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/12 border border-amber-500/25">
                <Sliders className="w-4 h-4 text-amber-400" />
              </div>
              <span>What-If Habit Simulator</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Adjust lifestyle markers — see projected score in real-time</p>
          </div>

          <div className="space-y-5 flex-1">
            {/* Slider: Systolic BP */}
            {[
              {
                label: 'Systolic Blood Pressure',
                value: sliderBP, setValue: setSliderBP,
                min: 100, max: 180, step: 2, unit: 'mmHg',
                color: sliderBP > 140 ? '#f43f5e' : sliderBP > 120 ? '#f59e0b' : '#10b981'
              },
              {
                label: 'Total Cholesterol',
                value: sliderChol, setValue: setSliderChol,
                min: 140, max: 280, step: 5, unit: 'mg/dL',
                color: sliderChol > 240 ? '#f43f5e' : sliderChol > 200 ? '#f59e0b' : '#10b981'
              },
              {
                label: 'Sleep Duration',
                value: sliderSleep, setValue: setSliderSleep,
                min: 4, max: 10, step: 0.5, unit: 'hrs',
                color: sliderSleep < 6 ? '#f43f5e' : sliderSleep < 7 ? '#f59e0b' : '#10b981'
              }
            ].map((s, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {s.label}
                  </span>
                  <span className="font-black font-mono" style={{ color: s.color }}>{s.value} {s.unit}</span>
                </div>
                <input
                  type="range" min={s.min} max={s.max} step={s.step}
                  value={s.value}
                  onChange={e => {
                    soundFX.play('slider');
                    s.setValue(parseFloat(e.target.value));
                  }}
                  className="w-full cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Projected outcome box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/8 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Projected Outcome</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Health Score</span>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                {hasAssessment ? (
                  <>
                    <span className="text-2xl font-black text-amber-400 font-mono">{liveProjectedScore}</span>
                    <span className="text-xs text-slate-600 font-bold">/ 100</span>
                  </>
                ) : (
                  <span className="text-xl font-black text-slate-500 font-mono">-- / 100</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Cardiac Risk</span>
              {hasAssessment ? (
                <span className={`text-lg font-black font-mono ${liveProjectedRisk > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {liveProjectedRisk}%
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-500">Requires Baseline</span>
              )}
            </div>

            <button
              onClick={() => { soundFX.play('switch'); setCurrentTab('wizard'); }}
              id="dashboard-simulator-cta"
              className="w-full mt-1 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-500/20"
            >
              <span>{hasAssessment ? 'Run Full Assessment' : 'Enter Initial Biomarkers'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ═══ 4. FEATURE ACTION CARDS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'dashboard-action-wizard',
            tab: 'wizard',
            Icon: HeartPulse,
            iconBg: 'bg-amber-500/12 border-amber-500/30 text-amber-400',
            hoverText: 'group-hover:text-amber-400',
            ctaColor: 'text-amber-400',
            ctaHover: 'group-hover:text-amber-300',
            tag: 'ML-Powered',
            tagColor: 'bg-amber-500/8 border-amber-500/20 text-amber-400',
            title: 'Risk Assessor Wizard',
            desc: 'Step-by-step diagnostic prediction assessing 6 cardiovascular risk sub-dimensions using multi-model ML.',
            cta: 'Launch Wizard',
          },
          {
            id: 'dashboard-action-symptom',
            tab: 'symptom_checker',
            Icon: Stethoscope,
            iconBg: 'bg-cyan-500/12 border-cyan-500/30 text-cyan-400',
            hoverText: 'group-hover:text-cyan-400',
            ctaColor: 'text-cyan-400',
            ctaHover: 'group-hover:text-cyan-300',
            tag: 'Red-Flag Detection',
            tagColor: 'bg-cyan-500/8 border-cyan-500/20 text-cyan-400',
            title: 'Symptom Checker & Triage',
            desc: 'Analyze chest tightness, palpitations, or dyspnea for immediate clinical red-flag identification.',
            cta: 'Check Symptoms',
          },
          {
            id: 'dashboard-action-chatbot',
            tab: 'chatbot',
            Icon: Bot,
            iconBg: 'bg-emerald-500/12 border-emerald-500/30 text-emerald-400',
            hoverText: 'group-hover:text-emerald-400',
            ctaColor: 'text-emerald-400',
            ctaHover: 'group-hover:text-emerald-300',
            tag: '24/7 AI',
            tagColor: 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400',
            title: 'HealthBot AI Companion',
            desc: '24/7 intelligent answers on blood pressure, cholesterol, and heart-healthy lifestyle management.',
            cta: 'Consult Cardio AI',
          }
        ].map((card) => {
          const CardIcon = card.Icon;
          return (
            <div
              key={card.id}
              id={card.id}
              onClick={() => { soundFX.play('switch'); setCurrentTab(card.tab); }}
              className="glass-card-interactive rounded-3xl p-5 space-y-3.5 cursor-pointer group shimmer-card border border-white/6"
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${card.iconBg}`}>
                  <CardIcon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${card.tagColor}`}>{card.tag}</span>
              </div>
              <div>
                <h4 className={`font-black text-sm text-white transition-colors ${card.hoverText}`}>{card.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{card.desc}</p>
              </div>
              <div className={`text-xs font-black flex items-center gap-1.5 ${card.ctaColor} ${card.ctaHover} transition-colors`}>
                <span>{card.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
