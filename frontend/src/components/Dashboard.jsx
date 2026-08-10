import React, { useState } from 'react';
import { 
  Inbox, HeartPulse, FileText, ClipboardList, AlertOctagon, 
  Stethoscope, Sparkles, ArrowRight, Activity, TrendingUp, ShieldCheck,
  Zap, Sliders, RefreshCw, ChevronRight, CheckCircle2
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
  // Interactive Dashboard Live Biometric Quick Adjuster
  const [quickSystolic, setQuickSystolic] = useState(latestAssessment?.medical?.bpSystolic || 120);
  const [quickGlucose, setQuickGlucose] = useState(latestAssessment?.medical?.glucose || 95);
  const [activeOrganHover, setActiveOrganHover] = useState(null);

  // Dynamic score simulation calculation
  const simulatedScore = React.useMemo(() => {
    let base = latestAssessment?.results?.overallScore || 85;
    const bpDelta = (120 - quickSystolic) * 0.25;
    const gluDelta = (90 - quickGlucose) * 0.3;
    const computed = Math.min(100, Math.max(20, Math.round(base + bpDelta + gluDelta)));
    return computed;
  }, [latestAssessment, quickSystolic, quickGlucose]);

  const organData = [
    {
      id: 'heart',
      name: 'Cardiovascular System',
      icon: HeartPulse,
      risk: latestAssessment?.results?.risks?.heartDisease || 12,
      vitals: `${latestAssessment?.medical?.bpSystolic || quickSystolic}/${latestAssessment?.medical?.bpDiastolic || 80} mmHg`,
      status: (latestAssessment?.results?.risks?.heartDisease || 12) < 30 ? 'Optimal' : (latestAssessment?.results?.risks?.heartDisease || 12) < 70 ? 'Elevated' : 'High Risk',
      color: 'from-rose-500 to-pink-600',
      badgeColor: (latestAssessment?.results?.risks?.heartDisease || 12) < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      id: 'diabetes',
      name: 'Metabolic & Glycemic',
      icon: Activity,
      risk: latestAssessment?.results?.risks?.diabetes || 15,
      vitals: `${latestAssessment?.medical?.glucose || quickGlucose} mg/dL Glucose`,
      status: (latestAssessment?.results?.risks?.diabetes || 15) < 30 ? 'Normal Range' : (latestAssessment?.results?.risks?.diabetes || 15) < 70 ? 'Borderline' : 'Diabetic Alert',
      color: 'from-indigo-500 to-blue-600',
      badgeColor: (latestAssessment?.results?.risks?.diabetes || 15) < 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'kidney',
      name: 'Renal & Filtration',
      icon: Zap,
      risk: latestAssessment?.results?.risks?.kidneyDisease || 8,
      vitals: `eGFR 110 mL/min`,
      status: (latestAssessment?.results?.risks?.kidneyDisease || 8) < 30 ? 'Normal Function' : 'Renal Caution',
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'liver',
      name: 'Hepatic Function',
      icon: Stethoscope,
      risk: latestAssessment?.results?.risks?.liverDisease || 9,
      vitals: `ALT/AST Nominal`,
      status: (latestAssessment?.results?.risks?.liverDisease || 9) < 30 ? 'Optimal Clearance' : 'Elevated Enzymes',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in no-print">
      {assessments.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-5 border border-amber-500/20 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center animate-heartbeat shadow-lg shadow-amber-500/20">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="font-extrabold text-2xl text-white">No assessments found</h3>
          <p className="text-sm text-slate-300 font-medium max-w-md leading-relaxed">
            Enter patient biometrics in the clinical wizard or upload a medical lab report to run your first diagnostic assessment.
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
                setCurrentTab('upload_report');
              }}
              className="btn-magnetic bg-slate-800/90 hover:bg-slate-750 text-amber-400 border border-amber-500/30 font-extrabold py-3.5 px-7 rounded-2xl inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition text-sm hover:border-amber-400"
            >
              <FileText className="w-5 h-5 text-amber-500" /> Scan Medical Lab Report
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
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Telemetry Synchronized
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                    Patient: {activeUser || 'Active Case'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Clinical Diagnostics Command Center
                </h2>
              </div>

              {/* Center Live Animated ECG Heart Rhythm Wave */}
              <div className="flex items-center gap-4 w-full lg:w-auto bg-slate-950/70 border border-amber-500/20 rounded-2xl px-4 py-2.5 shadow-inner">
                <div className="flex items-center gap-2 shrink-0">
                  <HeartPulse className="w-5 h-5 text-rose-500 animate-heartbeat" />
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Heart Rate</span>
                    <span className="text-sm font-black text-white font-mono">72 BPM</span>
                  </div>
                </div>

                <div className="w-48 sm:w-64 h-8 overflow-hidden relative">
                  <svg className="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
                    <path
                      d="M 0,20 L 50,20 L 60,5 L 70,35 L 80,10 L 90,25 L 100,20 L 160,20 L 170,5 L 180,35 L 190,10 L 200,25 L 210,20 L 300,20"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-ecg filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                    />
                  </svg>
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
                  {assessments.filter(a => a.name === activeUser).length}
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
                  {latestAssessment ? Object.values(latestAssessment.results.risks).filter(r => r >= 70).length : 0}
                </div>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4 border border-emerald-500/25 shadow-lg">
              <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-xs">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Overall Status</h4>
                <div className={`text-xs font-black mt-1 px-3 py-1 rounded-full border text-center ${
                  latestAssessment && Object.values(latestAssessment.results.risks).some(r => r >= 70)
                    ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                    : 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                }`}>
                  {latestAssessment && Object.values(latestAssessment.results.risks).some(r => r >= 70) ? 'Critical Alert Flagged' : 'Normal Physiological Range'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 4-Organ Health Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>Multi-Organ Physiological Diagnostic Matrix</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">4 Major Systems Tracked</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {organData.map(organ => {
                const Icon = organ.icon;
                const isHovered = activeOrganHover === organ.id;
                return (
                  <div
                    key={organ.id}
                    onMouseEnter={() => {
                      soundFX.play('slider');
                      setActiveOrganHover(organ.id);
                    }}
                    onMouseLeave={() => setActiveOrganHover(null)}
                    className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                      isHovered 
                        ? 'border-amber-500/60 shadow-xl shadow-amber-500/15 scale-[1.02]' 
                        : 'border-amber-500/20 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${organ.badgeColor}`}>
                        {organ.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-white">{organ.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{organ.vitals}</p>

                    {/* Risk progress bar */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400">Calculated Risk</span>
                        <span className="text-white font-mono">{organ.risk}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${organ.color}`}
                          style={{ width: `${organ.risk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Health Score Circular Wheel + Quick Tuner */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 xl:col-span-4 flex flex-col justify-between border border-amber-500/20 shadow-xl space-y-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-lg text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <span>Overall Health Score</span>
                  </h2>
                  {latestAssessment && (
                    <span className={`text-[11px] font-black uppercase tracking-wider border rounded-full px-3 py-1 ${getScoreBadgeStyles(simulatedScore).style}`}>
                      {getScoreBadgeStyles(simulatedScore).label}
                    </span>
                  )}
                </div>

                {latestAssessment && (
                  <div className="flex justify-center py-2">
                    <div className="circle-progress-container relative w-44 h-44 flex items-center justify-center cursor-pointer group">
                      <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md" viewBox="0 0 160 160">
                        <circle className="stroke-slate-800 fill-none" cx="80" cy="80" r="70" strokeWidth="11"></circle>
                        <circle 
                          className="transition-all duration-700 ease-out fill-none"
                          cx="80" 
                          cy="80" 
                          r="70" 
                          strokeWidth="11" 
                          stroke={getScoreBadgeStyles(simulatedScore).color}
                          strokeDasharray={439.8}
                          strokeDashoffset={439.8 - (439.8 * simulatedScore) / 100}
                          strokeLinecap="round"
                        ></circle>
                      </svg>
                      <div className="absolute text-center group-hover:scale-110 transition-transform">
                        <div className="text-4xl font-black text-white font-mono">{simulatedScore}</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mt-1">Score / 100</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Interactive Biometrics Recalibration Knobs */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-amber-400" /> Quick-Test Vitals</span>
                    <span className="text-amber-400 font-mono text-[10px]">Real-Time Sync</span>
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
                </div>
              </div>

              <div className="glass-pill rounded-2xl p-4 flex gap-3 border border-amber-500/20 bg-amber-500/10">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="font-extrabold text-xs text-white">Clinical Recommendation</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                    {latestAssessment?.results?.recommendations?.immediate?.[0] || latestAssessment?.results?.recommendations?.lifestyle?.[0] || 'No critical warnings. Maintain healthy nutrition and exercise levels.'}
                  </p>
                </div>
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
