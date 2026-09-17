import React from 'react';
import { Search, Inbox, Eye, Trash2 } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function History({
  historySearch,
  setHistorySearch,
  historyFilter,
  setHistoryFilter,
  filteredAssessments,
  getRiskLevelDetails,
  setResultsAssessment,
  setCurrentTab,
  handleDeleteAssessment,
  renderProtectedTab
}) {
  return renderProtectedTab(
    <div className="space-y-6 animate-tab-fade no-print text-slate-100">
      
      {/* Table Filters controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search patient record by name..."
            value={historySearch}
            onChange={e => setHistorySearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-input rounded-2xl text-sm font-bold transition"
          />
        </div>
        
        <div className="sm:w-64">
          <select 
            value={historyFilter}
            onChange={e => {
              soundFX.play('click');
              setHistoryFilter(e.target.value);
            }}
            className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold transition cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">All Risk Categories</option>
            <option value="high" className="bg-slate-900 text-white">High Alert Categories</option>
            <option value="medium" className="bg-slate-900 text-white">Moderate Risk Levels</option>
            <option value="low" className="bg-slate-900 text-white">Optimal Low Risk</option>
          </select>
        </div>
      </div>

      {/* History grid table */}
      {filteredAssessments.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4 border border-white/10 shadow-xl">
          <Inbox className="w-16 h-16 text-amber-400 animate-pulse" />
          <h3 className="font-black text-xl text-white">No Clinical Logs Found</h3>
          <p className="text-sm text-slate-400 font-medium">No diagnostic patient assessments matched the selected filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl glass-panel shadow-2xl border border-white/10">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/90 border-b border-white/10 text-slate-300 font-black text-xs uppercase tracking-wider">
                <th className="p-4 px-6">Patient Profile</th>
                <th className="p-4">Assessed Date</th>
                <th className="p-4">Cardio Score</th>
                <th className="p-4">Heart Risk</th>
                <th className="p-4">Blood Pressure</th>
                <th className="p-4">Cholesterol</th>
                <th className="p-4">Resting HR</th>
                <th className="p-4">Alert Class</th>
                <th className="p-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssessments.map(item => {
                const heartVal = item.results.risks.heartDisease ?? item.results.risks.heart ?? 15;
                const rDetails = getRiskLevelDetails(heartVal);
                const dateObj = new Date(item.timestamp);
                const dateFormatted = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-white">{item.name}</span>
                        <span className="text-xs text-slate-400 font-bold">{item.personal.gender.toUpperCase()}, {item.personal.age} yrs</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-300 font-mono text-xs">{dateFormatted}</td>
                    <td className="p-4 font-black text-amber-400 font-mono">{item.results.overallScore} / 100</td>
                    <td className="p-4 font-black text-rose-400 font-mono">{heartVal}%</td>
                    <td className="p-4 font-bold text-slate-200 font-mono">{item.medical?.bpSystolic}/{item.medical?.bpDiastolic} mmHg</td>
                    <td className="p-4 font-bold text-slate-200 font-mono">{item.medical?.cholesterol} mg/dL</td>
                    <td className="p-4 font-bold text-slate-200 font-mono">{item.medical?.heartRate || 70} BPM</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${rDetails.badge}`}>
                        {rDetails.label.split(' ')[0]}
                      </span>
                    </td>

                    <td className="p-4 px-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            soundFX.play('click');
                            setResultsAssessment(item);
                            setCurrentTab('results');
                          }}
                          className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition cursor-pointer"
                          title="View Full Diagnostic Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => {
                            soundFX.play('alert');
                            handleDeleteAssessment(item.id);
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                          title="Delete Assessment Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
