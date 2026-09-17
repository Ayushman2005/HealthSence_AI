import React from 'react';
import { PlusCircle, Inbox, TrendingUp, Sparkles } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { soundFX } from '../utils/audioFX';

export default function Insights({
  insightsUser,
  setInsightsUser,
  uniquePatients,
  insightsScoreTrendData,
  insightsVitalsData,
  insightsAggregates,
  resetWizard,
  setCurrentTab,
  renderProtectedTab
}) {
  return renderProtectedTab(
    <div className="space-y-6 animate-tab-fade no-print text-slate-100">
      
      {/* Header select patient */}
      <div className="flex justify-between items-center flex-wrap gap-4 glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-slate-300 uppercase tracking-wider">Select Patient Dataset:</label>
          <select 
            value={insightsUser}
            onChange={e => {
              soundFX.play('click');
              setInsightsUser(e.target.value);
            }}
            className="px-4 py-2.5 glass-input rounded-2xl outline-none text-sm font-black transition cursor-pointer"
          >
            {uniquePatients.length === 0 ? (
              <option value="" className="bg-slate-900 text-white">No patients recorded</option>
            ) : (
              uniquePatients.map(name => (
                <option key={name} value={name} className="bg-slate-900 text-white">{name}</option>
              ))
            )}
          </select>
        </div>

        <button 
          onClick={() => {
            soundFX.play('switch');
            resetWizard();
            setCurrentTab('wizard');
          }}
          className="btn-magnetic bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 px-5 rounded-2xl font-black text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/25"
        >
          <PlusCircle className="w-4 h-4" /> Assess Patient Again
        </button>
      </div>

      {uniquePatients.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4 border border-white/10 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center animate-pulse">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-black text-2xl text-white">No Patient Longitudinal History</h3>
          <p className="text-sm text-slate-400 font-medium max-w-sm">Perform multiple clinical assessments to plot longitudinal cardiovascular trends and shifts.</p>
          <button 
            onClick={() => {
              soundFX.play('switch');
              setCurrentTab('wizard');
            }}
            className="btn-magnetic mt-2 bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-black py-3 px-6 rounded-2xl inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/25 text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Perform First Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Score Trend Line Chart */}
          <div className="glass-panel rounded-3xl p-6 xl:col-span-8 h-90 border border-white/10 shadow-xl flex flex-col">
            <h2 className="font-black text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Cardiovascular Health Score Progression</span>
            </h2>
            <div className="flex-1 w-full min-h-0">
              <Line 
                data={insightsScoreTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } },
                    y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } }
                  }
                }}
              />
            </div>
          </div>

          {/* Score Trend Stats aggregates */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex-1 flex flex-col justify-center border border-white/10 shadow-xl">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold mb-1">Mean Cardiovascular Score</h4>
              <div className="text-3xl font-black text-white font-mono">{insightsAggregates.avg} / 100</div>
              <p className="text-xs text-slate-400 font-medium mt-1">Average rating across patient longitudinal timeline.</p>
            </div>
            
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex-1 flex flex-col justify-center border border-white/10 shadow-xl">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold mb-1">Peak Cardiovascular Event Risk</h4>
              <div className="text-3xl font-black text-rose-400 font-mono">{insightsAggregates.maxRisk}%</div>
              <p className="text-xs text-amber-400 font-black mt-1 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{insightsAggregates.advice}</span>
              </p>
            </div>
          </div>

          {/* Biomarker charts timeline */}
          <div className="glass-panel rounded-3xl p-6 xl:col-span-12 h-90 border border-white/10 shadow-xl flex flex-col">
            <h2 className="font-black text-lg text-white mb-4">Longitudinal Biomarkers & Hemodynamic Trajectory</h2>

            <div className="flex-1 w-full min-h-0">
              <Line 
                data={insightsVitalsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' } } } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } }
                  }
                }}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
