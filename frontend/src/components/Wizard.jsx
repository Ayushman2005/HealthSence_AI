import React from 'react';
import { ArrowLeft, ArrowRight, Activity } from 'lucide-react';

export default function Wizard({
  wizardStep,
  setWizardStep,
  formData,
  setFormData,
  errors,
  predicting,
  calculatedBMI,
  bmiDetails,
  getBiomarkerStatus,
  handleNextStep
}) {
  return (
    <div className="max-w-[900px] mx-auto animate-fade-in no-print">
      
      {/* Step navigation nodes */}
      <div className="flex justify-between items-center relative mb-10 px-4">
        <div className="absolute top-[25px] left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
        <div 
          className="absolute top-[25px] left-0 h-0.5 bg-amber-500 z-10 transition-all duration-300"
          style={{ width: `${((wizardStep - 1) / 2) * 100}%` }}
        ></div>

        {[
          { step: 1, label: 'Personal Profile' },
          { step: 2, label: 'Lifestyle Habits' },
          { step: 3, label: 'Biomarkers' }
        ].map(item => (
          <div key={item.step} className="flex flex-col items-center gap-2 relative z-20">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
              wizardStep === item.step
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-white border-amber-500 shadow-lg shadow-amber-500/35 ring-4 ring-amber-500/20'
                : wizardStep > item.step
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white/80 text-slate-400 border-slate-200'
            }`}>
              {item.step}
            </div>
            <span className={`text-xs font-bold transition-all ${
              wizardStep === item.step ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium'
            }`}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Wizards Form Card */}
      <div className="glass-panel rounded-2xl p-8 shadow-2xl">
        <form onSubmit={e => e.preventDefault()} className="space-y-6">
          
          {/* STEP 1: Personal profile information */}
          {wizardStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200/60 pb-4">
                <h3 className="font-extrabold text-xl text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Provide baseline identity metrics for reference in clinical risk records.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sarah Connor"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                      errors.name ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                    }`}
                  />
                  {errors.name && <span className="text-[10px] font-bold text-rose-600">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Age</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 40"
                    value={formData.age}
                    onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                      errors.age ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                    }`}
                  />
                  {errors.age && <span className="text-[10px] font-bold text-rose-600">{errors.age}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gender (At Birth)</label>
                  <div className="flex gap-4">
                    {['male', 'female', 'other'].map(g => (
                      <label key={g} className="flex-1 relative cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          checked={formData.gender === g}
                          onChange={() => setFormData(prev => ({ ...prev, gender: g }))}
                          className="sr-only peer"
                        />
                        <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-sm font-bold text-slate-600 rounded-xl transition shadow-sm">
                          {g.toUpperCase()}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Height (cm)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 170"
                      value={formData.height}
                      onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                        errors.height ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                      }`}
                    />
                    {errors.height && <span className="text-[10px] font-bold text-rose-600">{errors.height}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 68"
                      value={formData.weight}
                      onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      className={`w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-900 ${
                        errors.weight ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                      }`}
                    />
                    {errors.weight && <span className="text-[10px] font-bold text-rose-400">{errors.weight}</span>}
                  </div>
                </div>

                {/* BMI indicator card */}
                <div className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex justify-between items-center shadow-xs">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Estimated Patient BMI (WHO Standard)</h4>
                    <div className="text-3xl font-black text-zinc-900 flex items-baseline gap-1">
                      {calculatedBMI || '--'} <span className="text-xs font-semibold text-zinc-500">kg/m²</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${bmiDetails.color}`}>
                    {bmiDetails.text}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Lifestyle Habits */}
          {wizardStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200/60 pb-4">
                <h3 className="font-extrabold text-xl text-slate-900">Lifestyle Habits</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Provide social and routine metrics that influence baseline metabolic strain values.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tobacco Smoking</label>
                  <div className="flex gap-4">
                    {['no', 'yes'].map(opt => (
                      <label key={opt} className="flex-1 relative cursor-pointer">
                        <input 
                          type="radio" 
                          name="smoking" 
                          checked={formData.smoking === opt}
                          onChange={() => setFormData(prev => ({ ...prev, smoking: opt }))}
                          className="sr-only peer"
                        />
                        <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-sm font-bold text-slate-600 rounded-xl transition shadow-sm">
                          {opt === 'no' ? 'NON-SMOKER' : 'ACTIVE SMOKER'}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alcohol Consumption</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'low', label: 'NON-DRINKER' },
                      { value: 'moderate', label: 'MODERATE' },
                      { value: 'high', label: 'HEAVY' }
                    ].map(item => (
                      <label key={item.value} className="flex-1 relative cursor-pointer">
                        <input 
                          type="radio" 
                          name="alcohol" 
                          checked={formData.alcohol === item.value}
                          onChange={() => setFormData(prev => ({ ...prev, alcohol: item.value }))}
                          className="sr-only peer"
                        />
                        <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-xs sm:text-sm font-bold text-slate-600 rounded-xl transition shadow-xs">
                          {item.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Physical Activity Level</label>
                  <div className="flex gap-3">
                    {['sedentary', 'moderate', 'active'].map(opt => (
                      <label key={opt} className="flex-1 relative cursor-pointer">
                        <input 
                          type="radio" 
                          name="activity" 
                          checked={formData.physicalActivity === opt}
                          onChange={() => setFormData(prev => ({ ...prev, physicalActivity: opt }))}
                          className="sr-only peer"
                        />
                        <div className="w-full text-center py-3 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 text-sm font-bold text-slate-600 rounded-xl transition shadow-sm font-semibold">
                          {opt.toUpperCase()}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <label htmlFor="sleepDurationInput">Sleep Duration (Hours per day)</label>
                    <span className="text-amber-600 font-extrabold text-sm">{formData.sleepDuration || 0} hrs</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <input 
                      id="sleepDurationInput"
                      type="number" 
                      min="0" 
                      max="24" 
                      step="0.5"
                      value={formData.sleepDuration}
                      onChange={e => setFormData(prev => ({ ...prev, sleepDuration: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                      onBlur={e => {
                        const val = parseFloat(e.target.value);
                        if (isNaN(val) || val < 0) setFormData(prev => ({ ...prev, sleepDuration: 7 }));
                      }}
                      className="w-28 px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-sm font-bold text-slate-900 outline-none shadow-xs"
                      placeholder="Hours"
                    />
                    <input 
                      type="range" 
                      min="1" 
                      max="16" 
                      step="0.5"
                      value={formData.sleepDuration || 7}
                      onChange={e => setFormData(prev => ({ ...prev, sleepDuration: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Biomarkers & algorithm */}
          {wizardStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200/60 pb-4">
                <h3 className="font-extrabold text-xl text-slate-900">Clinical & Medical Biomarkers</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Specify clinical vital ranges to feed the ML predictive classification runs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'bpSystolic', label: 'Systolic Blood Pressure (mmHg)', min: 80, max: 220 },
                  { key: 'bpDiastolic', label: 'Diastolic Blood Pressure (mmHg)', min: 50, max: 130 },
                  { key: 'cholesterol', label: 'Total Cholesterol (mg/dL)', min: 100, max: 400 },
                  { key: 'glucose', label: 'Fasting Blood Glucose (mg/dL)', min: 50, max: 300 },
                  { key: 'insulin', label: 'Fasting Insulin (µIU/mL)', min: 2, max: 60 },
                  { key: 'heartRate', label: 'Resting Heart Rate (BPM)', min: 40, max: 150 }
                ].map(item => {
                  const statusInfo = getBiomarkerStatus(item.key, formData[item.key] || item.min);
                  return (
                    <div key={item.key} className="flex flex-col gap-3 bg-white border border-slate-200/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 shadow-sm">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <span className="truncate max-w-[200px] sm:max-w-none">{item.label}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors shrink-0 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <input 
                          type="number" 
                          min={item.min} 
                          max={item.max}
                          value={formData[item.key]}
                          onChange={e => {
                            const val = e.target.value === '' ? '' : parseInt(e.target.value);
                            setFormData(prev => ({ ...prev, [item.key]: val }));
                          }}
                          onBlur={e => {
                            const val = parseInt(e.target.value);
                            if (isNaN(val) || val < 0) setFormData(prev => ({ ...prev, [item.key]: item.min }));
                          }}
                          className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm font-extrabold text-amber-600 outline-none shadow-xs text-center shrink-0"
                          placeholder={item.min.toString()}
                        />
                        <input 
                          type="range" 
                          min={item.min} 
                          max={item.max}
                          value={formData[item.key] || item.min}
                          onChange={e => setFormData(prev => ({ ...prev, [item.key]: parseInt(e.target.value) || item.min }))}
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wizards controls */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200/60">
            <button 
              type="button"
              onClick={() => setWizardStep(prev => prev - 1)}
              disabled={wizardStep === 1 || predicting}
              className={`py-2.5 px-5 rounded-xl border font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition ${
                wizardStep === 1 
                  ? 'opacity-0 pointer-events-none' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Previous Step
            </button>
            
            <button 
              type="button"
              onClick={handleNextStep}
              disabled={predicting}
              className="btn-magnetic bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white py-2.5 px-6 rounded-xl font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/35"
            >
              {predicting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>Calculating Risks...</span>
                </>
              ) : wizardStep === 3 ? (
                <>
                  <span>Compute Clinical Forecast</span>
                  <Activity className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
