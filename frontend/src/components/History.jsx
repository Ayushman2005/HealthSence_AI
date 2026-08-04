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
            className="w-full pl-12 pr-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition"
          />
        </div>
        
        <div className="sm:w-60">
          <select 
            value={historyFilter}
            onChange={e => setHistoryFilter(e.target.value)}
            className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 transition cursor-pointer"
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
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center gap-4">
          <Inbox className="w-16 h-16 text-amber-500" />
          <h3 className="font-extrabold text-xl text-slate-900">No logs found</h3>
          <p className="text-sm text-slate-600 font-medium">No diagnostic assessments fit the selected query parameters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200/90 rounded-2xl glass-panel shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold">
                <th className="p-4 px-6">Patient Profile</th>
                <th className="p-4">Calculated Date</th>
                <th className="p-4">Health Score</th>
                <th className="p-4">Diabetes Risk</th>
                <th className="p-4">Heart Risk</th>
                <th className="p-4">Kidney Risk</th>
                <th className="p-4">Liver Risk</th>
                <th className="p-4">Alert Class</th>
                <th className="p-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {filteredAssessments.map(item => {
                const maxVal = Math.max(item.results.risks.diabetes, item.results.risks.heartDisease, item.results.risks.kidneyDisease, item.results.risks.liverDisease);
                const rDetails = getRiskLevelDetails(maxVal);
                const dateObj = new Date(item.timestamp);
                const dateFormatted = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                
                return (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition">
                    <td className="p-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-xs text-slate-500 font-semibold">{item.personal.gender.toUpperCase()}, {item.personal.age} yrs</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{dateFormatted}</td>
                    <td className="p-4 font-extrabold text-slate-900">{item.results.overallScore}/100</td>
                    <td className="p-4 font-bold text-slate-700">{item.results.risks.diabetes}%</td>
                    <td className="p-4 font-bold text-slate-700">{item.results.risks.heartDisease}%</td>
                    <td className="p-4 font-bold text-slate-700">{item.results.risks.kidneyDisease}%</td>
                    <td className="p-4 font-bold text-slate-700">{item.results.risks.liverDisease}%</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${rDetails.badge}`}>
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
                          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-500/40 hover:bg-amber-50 flex items-center justify-center cursor-pointer transition"
                          title="View Diagnostic Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteAssessment(item.id)}
                          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-500/40 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition"
                          title="Delete Log Record"
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
