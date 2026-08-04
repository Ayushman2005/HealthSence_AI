import React from 'react';
import { PlusCircle, Inbox } from 'lucide-react';
import { Line } from 'react-chartjs-2';

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
          <p className="text-sm text-slate-600 font-medium max-w-sm">Perform an original clinical assessment or upload a medical lab report to view longitudinal timeline graphs.</p>
          <button 
            onClick={() => setCurrentTab('wizard')}
            className="btn-magnetic mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/25 text-xs"
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
  );
}
