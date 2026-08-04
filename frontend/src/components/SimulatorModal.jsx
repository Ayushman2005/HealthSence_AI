import React from 'react';
import { Zap, X } from 'lucide-react';

export default function SimulatorModal({
  showSimulatorModal,
  setShowSimulatorModal,
  simParams,
  setSimParams,
  liveSimResults,
  setFormData,
  setCurrentTab
}) {
  if (!showSimulatorModal) return null;

  return (
    <div className="fixed inset-0 z-[999] glass-modal-backdrop flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in no-print">
      <div className="glass-modal-container rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-modal-spring text-slate-900 my-auto border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-amber-600 flex items-center justify-center font-bold border border-amber-500/30 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Interactive Real-Time Risk Simulator</h3>
              <p className="text-xs text-slate-600 font-medium">Drag clinical parameters below to watch continuous risk probabilities update in real time.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSimulatorModal(false)}
            className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center cursor-pointer text-slate-500 hover:text-rose-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid: Parameters Left, Real-Time Predictions Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sliders Input Panel (Glass Container) */}
          <div className="lg:col-span-7 space-y-5 glass-panel rounded-2xl p-5 max-h-[460px] overflow-y-auto pr-3">
            
            {/* Fasting Glucose Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Fasting Blood Glucose</span>
                <span className="text-amber-600 font-extrabold">{simParams.glucose} mg/dL</span>
              </div>
              <input 
                type="range" min="60" max="250" value={simParams.glucose}
                onChange={e => setSimParams(prev => ({ ...prev, glucose: parseInt(e.target.value) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>60 Normal</span><span>100 Pre-diabetes</span><span>250 High</span></div>
            </div>

            {/* Systolic BP Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Systolic Blood Pressure</span>
                <span className="text-rose-600 font-extrabold">{simParams.bpSystolic} mmHg</span>
              </div>
              <input 
                type="range" min="85" max="200" value={simParams.bpSystolic}
                onChange={e => setSimParams(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>85 Low</span><span>120 Normal</span><span>200 Crisis</span></div>
            </div>

            {/* BMI Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Body Mass Index (BMI)</span>
                <span className="text-amber-600 font-extrabold">{simParams.bmi} kg/m²</span>
              </div>
              <input 
                type="range" min="16" max="45" step="0.5" value={simParams.bmi}
                onChange={e => setSimParams(prev => ({ ...prev, bmi: parseFloat(e.target.value) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>16 Lean</span><span>25 Normal</span><span>45 Severe</span></div>
            </div>

            {/* Cholesterol Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Serum Cholesterol</span>
                <span className="text-purple-600 font-extrabold">{simParams.cholesterol} mg/dL</span>
              </div>
              <input 
                type="range" min="110" max="360" value={simParams.cholesterol}
                onChange={e => setSimParams(prev => ({ ...prev, cholesterol: parseInt(e.target.value) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold"><span>110 Normal</span><span>200 Borderline</span><span>360 High</span></div>
            </div>

            {/* Fasting Insulin Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Fasting Insulin</span>
                <span className="text-amber-600 font-extrabold">{simParams.insulin} µIU/mL</span>
              </div>
              <input 
                type="range" min="2" max="50" value={simParams.insulin}
                onChange={e => setSimParams(prev => ({ ...prev, insulin: parseInt(e.target.value) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Categorical Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Smoking Status</label>
                <select 
                  value={simParams.smoking}
                  onChange={e => setSimParams(prev => ({ ...prev, smoking: e.target.value }))}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="no">Non-Smoker</option>
                  <option value="yes">Active Smoker</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Alcohol Consumption</label>
                <select 
                  value={simParams.alcohol}
                  onChange={e => setSimParams(prev => ({ ...prev, alcohol: e.target.value }))}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="low">Non-Drinker (None)</option>
                  <option value="moderate">Moderate Intake</option>
                  <option value="high">Heavy Intake</option>
                </select>
              </div>
            </div>

          </div>

          {/* Real-time Dynamic Gauge & Risk Meters Right */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 glass-panel rounded-2xl p-6">
            
            {/* Simulated Overall Health Score Radial Meter */}
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36 flex items-center justify-center circle-progress-container">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle className="stroke-slate-200 fill-none" cx="80" cy="80" r="68" strokeWidth="10"></circle>
                  <circle 
                    className="transition-all duration-500 ease-out fill-none"
                    cx="80" cy="80" r="68" strokeWidth="10" 
                    stroke={liveSimResults.overallScore > 75 ? '#059669' : liveSimResults.overallScore > 50 ? '#d97706' : '#e11d48'}
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * liveSimResults.overallScore) / 100}
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-black text-slate-900">{liveSimResults.overallScore}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Simulated Score</div>
                </div>
              </div>
            </div>

            {/* 4 Disease Risk Live Progress Bars */}
            <div className="space-y-3">
              
              {/* Diabetes */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Diabetes Risk</span>
                  <span className={liveSimResults.risks.diabetes > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.diabetes}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.diabetes}%`,
                      backgroundColor: liveSimResults.risks.diabetes > 65 ? '#e11d48' : liveSimResults.risks.diabetes > 35 ? '#d97706' : '#059669'
                    }}
                  ></div>
                </div>
              </div>

              {/* Heart Disease */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Heart Disease Risk</span>
                  <span className={liveSimResults.risks.heartDisease > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.heartDisease}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.heartDisease}%`,
                      backgroundColor: liveSimResults.risks.heartDisease > 65 ? '#e11d48' : liveSimResults.risks.heartDisease > 35 ? '#d97706' : '#059669'
                    }}
                  ></div>
                </div>
              </div>

              {/* Kidney Disease */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Kidney Disease Risk</span>
                  <span className={liveSimResults.risks.kidneyDisease > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.kidneyDisease}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.kidneyDisease}%`,
                      backgroundColor: liveSimResults.risks.kidneyDisease > 65 ? '#e11d48' : liveSimResults.risks.kidneyDisease > 35 ? '#d97706' : '#059669'
                    }}
                  ></div>
                </div>
              </div>

              {/* Liver Disease */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Liver Disease Risk</span>
                  <span className={liveSimResults.risks.liverDisease > 65 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{liveSimResults.risks.liverDisease}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.liverDisease}%`,
                      backgroundColor: liveSimResults.risks.liverDisease > 65 ? '#e11d48' : liveSimResults.risks.liverDisease > 35 ? '#d97706' : '#059669'
                    }}
                  ></div>
                </div>
              </div>

            </div>

            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  glucose: simParams.glucose,
                  bpSystolic: simParams.bpSystolic,
                  bpDiastolic: simParams.bpDiastolic,
                  bmi: simParams.bmi,
                  cholesterol: simParams.cholesterol,
                  insulin: simParams.insulin,
                  smoking: simParams.smoking,
                  alcohol: simParams.alcohol
                }));
                setShowSimulatorModal(false);
                setCurrentTab('wizard');
              }}
              className="btn-magnetic w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/30 cursor-pointer transition active:scale-[0.98]"
            >
              Import Parameters into Full Assessment
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
