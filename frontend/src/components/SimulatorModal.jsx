import React from 'react';
import { Zap, X, Sparkles, Activity, ShieldCheck, HeartPulse, Sliders } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

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

  const presets = [
    {
      name: 'Athletic / Optimal',
      icon: '🏃',
      params: { glucose: 85, bpSystolic: 110, bpDiastolic: 72, bmi: 21.5, cholesterol: 165, insulin: 6, smoking: 'no', alcohol: 'low' }
    },
    {
      name: 'Sedentary Standard',
      icon: '🛋️',
      params: { glucose: 105, bpSystolic: 128, bpDiastolic: 82, bmi: 26.2, cholesterol: 205, insulin: 12, smoking: 'no', alcohol: 'moderate' }
    },
    {
      name: 'Metabolic Warning',
      icon: '⚠️',
      params: { glucose: 155, bpSystolic: 142, bpDiastolic: 90, bmi: 31.0, cholesterol: 245, insulin: 22, smoking: 'yes', alcohol: 'moderate' }
    },
    {
      name: 'Hypertensive Crisis',
      icon: '🚨',
      params: { glucose: 195, bpSystolic: 175, bpDiastolic: 108, bmi: 35.5, cholesterol: 290, insulin: 35, smoking: 'yes', alcohol: 'high' }
    }
  ];

  return (
    <div className="fixed inset-0 z-[999] glass-modal-backdrop flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in no-print">
      <div className="glass-modal-container rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-modal-spring text-white my-auto border border-amber-500/30 bg-slate-950/95 backdrop-blur-2xl">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30 shadow-lg shadow-amber-500/15">
              <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white tracking-tight">Interactive Real-Time Risk Simulator</h3>
              <p className="text-xs text-slate-300 font-medium">Drag clinical parameters below to watch continuous risk probabilities update in real time.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              soundFX.play('click');
              setShowSimulatorModal(false);
            }}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Scenarios Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Interactive Simulation Scenario:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  soundFX.play('click');
                  setSimParams(p.params);
                }}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-base mb-0.5">{p.icon}</div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Parameters Left, Real-Time Predictions Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sliders Input Panel */}
          <div className="lg:col-span-7 space-y-4 glass-panel rounded-2xl p-5 max-h-[420px] overflow-y-auto pr-3 border border-slate-800 bg-slate-900/70">
            
            {/* Fasting Glucose Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Fasting Blood Glucose</span>
                <span className="text-amber-400 font-mono font-black">{simParams.glucose} mg/dL</span>
              </div>
              <input 
                type="range" min="60" max="250" value={simParams.glucose}
                onChange={e => {
                  soundFX.play('slider');
                  setSimParams(prev => ({ ...prev, glucose: parseInt(e.target.value) }));
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold"><span>60 Normal</span><span>100 Pre-diabetes</span><span>250 High</span></div>
            </div>

            {/* Systolic BP Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Systolic Blood Pressure</span>
                <span className="text-rose-400 font-mono font-black">{simParams.bpSystolic} mmHg</span>
              </div>
              <input 
                type="range" min="85" max="200" value={simParams.bpSystolic}
                onChange={e => {
                  soundFX.play('slider');
                  setSimParams(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) }));
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold"><span>85 Low</span><span>120 Normal</span><span>200 Crisis</span></div>
            </div>

            {/* BMI Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Body Mass Index (BMI)</span>
                <span className="text-amber-400 font-mono font-black">{simParams.bmi} kg/m²</span>
              </div>
              <input 
                type="range" min="16" max="45" step="0.5" value={simParams.bmi}
                onChange={e => {
                  soundFX.play('slider');
                  setSimParams(prev => ({ ...prev, bmi: parseFloat(e.target.value) }));
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold"><span>16 Lean</span><span>25 Normal</span><span>45 Severe</span></div>
            </div>

            {/* Cholesterol Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Serum Cholesterol</span>
                <span className="text-purple-400 font-mono font-black">{simParams.cholesterol} mg/dL</span>
              </div>
              <input 
                type="range" min="110" max="360" value={simParams.cholesterol}
                onChange={e => {
                  soundFX.play('slider');
                  setSimParams(prev => ({ ...prev, cholesterol: parseInt(e.target.value) }));
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold"><span>110 Normal</span><span>200 Borderline</span><span>360 High</span></div>
            </div>

            {/* Fasting Insulin Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Fasting Insulin</span>
                <span className="text-amber-400 font-mono font-black">{simParams.insulin} µIU/mL</span>
              </div>
              <input 
                type="range" min="2" max="50" value={simParams.insulin}
                onChange={e => {
                  soundFX.play('slider');
                  setSimParams(prev => ({ ...prev, insulin: parseInt(e.target.value) }));
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Categorical Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block mb-1">Smoking Status</label>
                <select 
                  value={simParams.smoking}
                  onChange={e => setSimParams(prev => ({ ...prev, smoking: e.target.value }))}
                  className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold outline-none cursor-pointer text-white bg-slate-900"
                >
                  <option value="no">Non-Smoker</option>
                  <option value="yes">Active Smoker</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block mb-1">Alcohol Consumption</label>
                <select 
                  value={simParams.alcohol}
                  onChange={e => setSimParams(prev => ({ ...prev, alcohol: e.target.value }))}
                  className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold outline-none cursor-pointer text-white bg-slate-900"
                >
                  <option value="low">Non-Drinker (None)</option>
                  <option value="moderate">Moderate Intake</option>
                  <option value="high">Heavy Intake</option>
                </select>
              </div>
            </div>

          </div>

          {/* Real-time Dynamic Gauge & Risk Meters Right */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/70">
            
            {/* Simulated Overall Health Score Radial Meter */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center circle-progress-container">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle className="stroke-slate-800 fill-none" cx="80" cy="80" r="68" strokeWidth="10"></circle>
                  <circle 
                    className="transition-all duration-500 ease-out fill-none"
                    cx="80" cy="80" r="68" strokeWidth="10" 
                    stroke={liveSimResults.overallScore > 75 ? '#10b981' : liveSimResults.overallScore > 50 ? '#f59e0b' : '#f43f5e'}
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * liveSimResults.overallScore) / 100}
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-black text-white font-mono">{liveSimResults.overallScore}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">Simulated Score</div>
                </div>
              </div>
            </div>

            {/* 4 Disease Risk Live Progress Bars */}
            <div className="space-y-2.5">
              
              {/* Diabetes */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Diabetes Risk</span>
                  <span className={liveSimResults.risks.diabetes > 65 ? 'text-rose-400 font-mono font-black' : 'text-emerald-400 font-mono font-black'}>{liveSimResults.risks.diabetes}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.diabetes}%`,
                      backgroundColor: liveSimResults.risks.diabetes > 65 ? '#f43f5e' : liveSimResults.risks.diabetes > 35 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>

              {/* Heart Disease */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Heart Disease Risk</span>
                  <span className={liveSimResults.risks.heartDisease > 65 ? 'text-rose-400 font-mono font-black' : 'text-emerald-400 font-mono font-black'}>{liveSimResults.risks.heartDisease}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.heartDisease}%`,
                      backgroundColor: liveSimResults.risks.heartDisease > 65 ? '#f43f5e' : liveSimResults.risks.heartDisease > 35 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>

              {/* Kidney Disease */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Kidney Disease Risk</span>
                  <span className={liveSimResults.risks.kidneyDisease > 65 ? 'text-rose-400 font-mono font-black' : 'text-emerald-400 font-mono font-black'}>{liveSimResults.risks.kidneyDisease}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.kidneyDisease}%`,
                      backgroundColor: liveSimResults.risks.kidneyDisease > 65 ? '#f43f5e' : liveSimResults.risks.kidneyDisease > 35 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>

              {/* Liver Disease */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Liver Disease Risk</span>
                  <span className={liveSimResults.risks.liverDisease > 65 ? 'text-rose-400 font-mono font-black' : 'text-emerald-400 font-mono font-black'}>{liveSimResults.risks.liverDisease}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${liveSimResults.risks.liverDisease}%`,
                      backgroundColor: liveSimResults.risks.liverDisease > 65 ? '#f43f5e' : liveSimResults.risks.liverDisease > 35 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>

            </div>

            <button
              onClick={() => {
                soundFX.play('success');
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
              className="btn-magnetic w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-500/30 cursor-pointer transition active:scale-[0.98]"
            >
              Import Parameters into Risk Assessor
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
