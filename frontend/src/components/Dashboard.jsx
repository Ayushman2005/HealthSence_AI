import React from 'react';
import { 
  Inbox, HeartPulse, FileText, ClipboardList, AlertOctagon, 
  Stethoscope, Sparkles, ArrowRight, Activity, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { Radar, Line } from 'react-chartjs-2';

export default function Dashboard({
  assessments,
  activeUser,
  latestAssessment,
  overviewRadarData,
  overviewTrendData,
  getScoreBadgeStyles,
  setCurrentTab
}) {
  return (
    <div className="space-y-8 animate-fade-in no-print">
      {assessments.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-5 border border-amber-500/20 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center animate-heartbeat shadow-lg shadow-amber-500/20">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">No assessments found</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md leading-relaxed">
            Enter patient biometrics in the clinical wizard or upload a medical lab report to run your first diagnostic assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button 
              onClick={() => setCurrentTab('wizard')} 
              className="btn-magnetic bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold py-3.5 px-7 rounded-2xl inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-amber-500/30 transition text-sm"
            >
              <HeartPulse className="w-5 h-5 animate-pulse" /> Start New Risk Assessor
            </button>
            <button 
              onClick={() => setCurrentTab('upload_report')} 
              className="btn-magnetic bg-white/90 dark:bg-slate-800/90 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-extrabold py-3.5 px-7 rounded-2xl inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition text-sm hover:border-amber-500"
            >
              <FileText className="w-5 h-5 text-amber-500" /> Scan Medical Lab Report
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4 border-amber-500/20">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-xs">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Evaluations Run</h4>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {assessments.filter(a => a.name === activeUser).length}
                </div>
              </div>
            </div>
            
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4 border-rose-500/20">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center shadow-xs">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Critical Risk Flags</h4>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {latestAssessment ? Object.values(latestAssessment.results.risks).filter(r => r >= 70).length : 0}
                </div>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4 border-emerald-500/20">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-xs">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Risk Status</h4>
                <div className={`text-xs font-black mt-1 px-3 py-1 rounded-full border text-center ${
                  latestAssessment && Object.values(latestAssessment.results.risks).some(r => r >= 70)
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  {latestAssessment && Object.values(latestAssessment.results.risks).some(r => r >= 70) ? 'Critical Alert' : 'Standard Range'}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Health Score Circular Wheel */}
            <div className="glass-panel rounded-3xl p-8 xl:col-span-4 flex flex-col justify-between border-amber-500/20">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" />
                    <span>Overall Health Score</span>
                  </h2>
                  {latestAssessment && (
                    <span className={`text-[11px] font-black uppercase tracking-wider border rounded-full px-3 py-1 ${getScoreBadgeStyles(latestAssessment.results.overallScore).style}`}>
                      {getScoreBadgeStyles(latestAssessment.results.overallScore).label}
                    </span>
                  )}
                </div>

                {latestAssessment && (
                  <div className="flex justify-center py-4">
                    <div className="circle-progress-container relative w-48 h-48 flex items-center justify-center cursor-pointer group">
                      <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md" viewBox="0 0 160 160">
                        <circle className="stroke-slate-200 dark:stroke-slate-700/60 fill-none" cx="80" cy="80" r="70" strokeWidth="11"></circle>
                        <circle 
                          className="transition-all duration-1000 ease-out fill-none"
                          cx="80" 
                          cy="80" 
                          r="70" 
                          strokeWidth="11" 
                          stroke={getScoreBadgeStyles(latestAssessment.results.overallScore).color}
                          strokeDasharray={439.8}
                          strokeDashoffset={439.8 - (439.8 * latestAssessment.results.overallScore) / 100}
                          strokeLinecap="round"
                        ></circle>
                      </svg>
                      <div className="absolute text-center group-hover:scale-110 transition-transform">
                        <div className="text-4xl font-black text-slate-900 dark:text-white">{latestAssessment.results.overallScore}</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-extrabold mt-1">Score / 100</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 glass-pill rounded-2xl p-4 flex gap-3 border-amber-500/20 bg-amber-500/5">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Clinical Recommendation</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                    {latestAssessment?.results.recommendations.immediate[0] || latestAssessment?.results.recommendations.lifestyle[0] || 'No critical warnings. Maintain healthy nutrition and exercise levels.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Graphs */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Radar Chart */}
              <div className="glass-panel rounded-3xl p-6 h-[330px] border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <span>Patient Organ Risk Profile</span>
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
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
                            pointLabels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' } }
                          }
                        }
                      }} 
                    />
                  )}
                </div>
              </div>

              {/* Timeline Line Chart */}
              <div className="glass-panel rounded-3xl p-6 h-[330px] border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>Health Score Progression</span>
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
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
              onClick={() => setCurrentTab('wizard')}
              className="glass-panel glass-panel-hover rounded-3xl p-6 text-left flex items-center justify-between cursor-pointer transition-all border-amber-500/20 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base">Perform Health Assessment</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Input biometrics to calculate precision diagnostic risk predictions.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => setCurrentTab('history')}
              className="glass-panel glass-panel-hover rounded-3xl p-6 text-left flex items-center justify-between cursor-pointer transition-all border-emerald-500/20 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base">Browse Audit History</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Review, filter, and compare past patient risk logs.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
