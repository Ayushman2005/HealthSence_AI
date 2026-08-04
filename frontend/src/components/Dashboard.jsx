import React from 'react';
import { 
  Inbox, HeartPulse, FileText, ClipboardList, AlertOctagon, 
  Stethoscope, Sparkles, ArrowRight 
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
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center gap-4 border border-slate-200/90 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-2xl text-slate-900">No assessments found</h3>
          <p className="text-sm text-slate-600 font-medium max-w-sm">Enter original patient details in the clinical wizard or scan a medical report to perform your first assessment.</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-3">
            <button onClick={() => setCurrentTab('wizard')} className="btn-magnetic bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/35">
              <HeartPulse className="w-5 h-5" /> Start New Assessment
            </button>
            <button onClick={() => setCurrentTab('upload_report')} className="btn-magnetic bg-white/90 hover:bg-white text-amber-600 border border-amber-200 font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer transition shadow-md">
              <FileText className="w-5 h-5 text-amber-500" /> Scan Medical Lab Report
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-2xl flex items-center justify-center">
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
                          strokeDasharray={452.3}
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
  );
}
