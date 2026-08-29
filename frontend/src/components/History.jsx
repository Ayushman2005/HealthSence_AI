import React from 'react';
import { Search, Inbox, Eye, Trash2 } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in no-print">
      
      {/* Table Filters controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search patient name..."
            value={historySearch}
            onChange={e => setHistorySearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-input rounded-2xl text-sm font-extrabold transition shadow-inner"
          />
        </div>
        
        <div className="sm:w-60">
          <select 
            value={historyFilter}
            onChange={e => setHistoryFilter(e.target.value)}
            className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-extrabold transition cursor-pointer"
          >
            <option value="all">All Risk Classes</option>
            <option value="high">High Risk Alerts</option>
            <option value="medium">Medium Risk Indicators</option>
            <option value="low">Optimal Low Risks Only</option>
          </select>
        </div>
      </div>

      {/* History grid table */}
      {filteredAssessments.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4 border border-amber-500/20">
          <Inbox className="w-16 h-16 text-amber-500 animate-pulse" />
          <h3 className="font-black text-xl text-slate-900 dark:text-white">No logs found</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No diagnostic assessments fit the selected query parameters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-amber-500/20 rounded-3xl glass-panel shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-amber-500/10 border-b border-amber-500/20 text-slate-700 dark:text-slate-200 font-black">
                <th className="p-4 px-6">Patient Profile</th>
                <th className="p-4">Calculated Date</th>
                <th className="p-4">Cardio Score</th>
                <th className="p-4">Heart Risk</th>
                <th className="p-4">Blood Pressure</th>
                <th className="p-4">Cholesterol</th>
                <th className="p-4">Resting HR</th>
                <th className="p-4">Alert Class</th>
                <th className="p-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {filteredAssessments.map(item => {
                const heartVal = item.results.risks.heartDisease ?? item.results.risks.heart ?? 15;
                const rDetails = getRiskLevelDetails(heartVal);
                const dateObj = new Date(item.timestamp);
                const dateFormatted = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                
                return (
                  <tr key={item.id} className="hover:bg-amber-500/5 transition">
                    <td className="p-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white">{item.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{item.personal.gender.toUpperCase()}, {item.personal.age} yrs</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{dateFormatted}</td>
                    <td className="p-4 font-black text-amber-500">{item.results.overallScore}/100</td>
                    <td className="p-4 font-extrabold text-rose-400">{heartVal}%</td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-slate-200">{item.medical?.bpSystolic}/{item.medical?.bpDiastolic} mmHg</td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-slate-200">{item.medical?.cholesterol} mg/dL</td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-slate-200">{item.medical?.heartRate || 70} BPM</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${rDetails.badge}`}>
                        {rDetails.label.split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            setResultsAssessment(item);
                            setCurrentTab('results');
                          }}
                          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl transition cursor-pointer"
                          title="View Full Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteAssessment(item.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition cursor-pointer"
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
