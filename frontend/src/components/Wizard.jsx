import React from 'react';
import { ArrowLeft, ArrowRight, Activity, Check, HeartPulse, ShieldAlert, Sparkles } from 'lucide-react';

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

  // Real-time calculated live risk preview values
  const livePreview = React.useMemo(() => {
    const age = parseInt(formData.age) || 35;
    const bmiVal = parseFloat(calculatedBMI) || 22;
    const sys = parseInt(formData.bpSystolic) || 120;
    const glu = parseInt(formData.glucose) || 90;

    let sysStatus = 'Normal BP';
    let sysColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (sys >= 140) {
      sysStatus = 'Hypertension Stage 2';
      sysColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    } else if (sys >= 130) {
      sysStatus = 'Hypertension Stage 1';
      sysColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    }

    let gluStatus = 'Normal Fasting Glucose';
    let gluColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (glu >= 126) {
      gluStatus = 'Diabetic Range';
      gluColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    } else if (glu >= 100) {
      gluStatus = 'Pre-Diabetic Range';
      gluColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    }

    return { sysStatus, sysColor, gluStatus, gluColor, age, bmiVal };
  }, [formData, calculatedBMI]);

  return (
    <div className="max-w-[1250px] mx-auto animate-fade-in no-print space-y-8">
      
      {/* Step navigation nodes */}
      <div className="flex justify-between items-center relative mb-8 px-6 max-w-[850px] mx-auto">
        <div className="absolute top-[24px] left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 z-0 rounded-full"></div>
        <div 
          className="absolute top-[24px] left-8 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 z-10 transition-all duration-500 rounded-full shadow-xs shadow-amber-500/50"
          style={{ width: `${((wizardStep - 1) / 2) * 85}%` }}
        ></div>

        {[
          { step: 1, label: '1. Personal Profile' },
          { step: 2, label: '2. Lifestyle Habits' },
          { step: 3, label: '3. Clinical Biomarkers' }
        ].map(item => (
          <div key={item.step} className="flex flex-col items-center gap-2 relative z-20">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 transition-all duration-300 ${
              wizardStep === item.step
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-white border-amber-400 shadow-lg shadow-amber-500/35 ring-4 ring-amber-500/20 scale-110'
                : wizardStep > item.step
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
            }`}>
              {wizardStep > item.step ? <Check className="w-6 h-6 stroke-[3]" /> : item.step}
            </div>
            <span className={`text-xs font-black transition-all ${
              wizardStep === item.step ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
            }`}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Left Form (8 cols) + Right Live Assessor Preview (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border-amber-500/20">
          <form onSubmit={e => e.preventDefault()} className="space-y-6">
            
            {/* STEP 1: Personal profile information */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-amber-500/10 pb-4">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">Personal Patient Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Record baseline identity metrics for reference in clinical risk records.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Patient Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sarah Connor"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold ${
                        errors.name ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                      }`}
                    />
                    {errors.name && <span className="text-[10px] font-bold text-rose-500">{errors.name}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Patient Age</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 40"
                      value={formData.age}
                      onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className={`w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold ${
                        errors.age ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                      }`}
                    />
                    {errors.age && <span className="text-[10px] font-bold text-rose-500">{errors.age}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Gender</label>
                    <div className="flex gap-3">
                      {['male', 'female', 'other'].map(g => (
                        <label key={g} className="flex-1 relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="gender" 
                            checked={formData.gender === g}
                            onChange={() => setFormData(prev => ({ ...prev, gender: g }))}
                            className="sr-only peer"
                          />
                          <div className="w-full text-center py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-500 text-xs font-black rounded-2xl transition shadow-xs">
                            {g.toUpperCase()}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Height (cm)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 170"
                        value={formData.height}
                        onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
                        className={`w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold ${
                          errors.height ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                        }`}
                      />
                      {errors.height && <span className="text-[10px] font-bold text-rose-500">{errors.height}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Weight (kg)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 68"
                        value={formData.weight}
                        onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className={`w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold ${
                          errors.weight ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                        }`}
                      />
                      {errors.weight && <span className="text-[10px] font-bold text-rose-500">{errors.weight}</span>}
                    </div>
                  </div>

                  {/* Dynamic BMI Card */}
                  <div className="md:col-span-2 glass-panel rounded-2xl p-5 flex justify-between items-center border-amber-500/20">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Calculated BMI Index (WHO)</h4>
                      <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                        {calculatedBMI || '--'} <span className="text-xs font-bold text-slate-500">kg/m²</span>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${bmiDetails.color}`}>
                      {bmiDetails.text}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Lifestyle Habits */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-amber-500/10 pb-4">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">Lifestyle & Social Habits</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Record behavioral indicators that affect baseline physiological strain values.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tobacco Smoking</label>
                    <div className="flex gap-3">
                      {['no', 'yes'].map(opt => (
                        <label key={opt} className="flex-1 relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="smoking" 
                            checked={formData.smoking === opt}
                            onChange={() => setFormData(prev => ({ ...prev, smoking: opt }))}
                            className="sr-only peer"
                          />
                          <div className="w-full text-center py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-500 text-xs font-black rounded-2xl transition shadow-xs">
                            {opt === 'no' ? 'NON-SMOKER' : 'ACTIVE SMOKER'}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Alcohol Consumption</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'low', label: 'LIGHT' },
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
                          <div className="w-full text-center py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-500 text-xs font-black rounded-2xl transition shadow-xs">
                            {item.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Physical Activity</label>
                    <div className="flex gap-2">
                      {['sedentary', 'moderate', 'active'].map(opt => (
                        <label key={opt} className="flex-1 relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="activity" 
                            checked={formData.physicalActivity === opt}
                            onChange={() => setFormData(prev => ({ ...prev, physicalActivity: opt }))}
                            className="sr-only peer"
                          />
                          <div className="w-full text-center py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-500 text-xs font-black rounded-2xl transition shadow-xs">
                            {opt.toUpperCase()}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <label htmlFor="sleepDurationInput">Sleep Duration</label>
                      <span className="text-amber-500 font-black text-sm">{formData.sleepDuration || 7} hrs/day</span>
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
                        className="w-24 px-3.5 py-2.5 glass-input rounded-2xl text-sm font-extrabold text-center outline-none shadow-xs"
                        placeholder="Hours"
                      />
                      <input 
                        type="range" 
                        min="1" 
                        max="16" 
                        step="0.5"
                        value={formData.sleepDuration || 7}
                        onChange={e => setFormData(prev => ({ ...prev, sleepDuration: parseFloat(e.target.value) }))}
                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 3: Biomarkers & algorithm */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-amber-500/10 pb-4">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">Clinical Vital Signs & Lab Biomarkers</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Specify laboratory vital values for precision clinical risk evaluation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <div key={item.key} className="flex flex-col gap-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 hover:border-amber-500/40 rounded-2xl p-4.5 transition-all duration-300 shadow-xs">
                        <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          <span className="truncate max-w-[200px] sm:max-w-none">{item.label}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shrink-0 ${statusInfo.color}`}>
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
                            className="w-24 px-3 py-2 glass-input rounded-xl text-sm font-black text-amber-500 text-center outline-none shadow-xs shrink-0"
                            placeholder={item.min.toString()}
                          />
                          <input 
                            type="range" 
                            min={item.min} 
                            max={item.max}
                            value={formData[item.key] || item.min}
                            onChange={e => setFormData(prev => ({ ...prev, [item.key]: parseInt(e.target.value) || item.min }))}
                            className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Controls Row */}
            <div className="flex justify-between items-center pt-6 border-t border-amber-500/10">
              <button 
                type="button"
                onClick={() => setWizardStep(prev => prev - 1)}
                disabled={wizardStep === 1 || predicting}
                className={`py-3 px-5 rounded-2xl border font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition ${
                  wizardStep === 1 
                    ? 'opacity-0 pointer-events-none' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
              
              <button 
                type="button"
                onClick={handleNextStep}
                disabled={predicting}
                className="btn-magnetic bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white py-3 px-7 rounded-2xl font-black text-sm inline-flex items-center gap-2.5 cursor-pointer shadow-lg shadow-amber-500/30"
              >
                {predicting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    <span>Computing AI Risk Models...</span>
                  </>
                ) : wizardStep === 3 ? (
                  <>
                    <span>Generate Clinical Forecast</span>
                    <Activity className="w-4 h-4 animate-pulse" />
                  </>
                ) : (
                  <>
                    <span>Continue to Step {wizardStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Live Real-time Assessor Indicator Card */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border-amber-500/20 sticky top-24 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Live Diagnostic Assessor</span>
            </h3>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Real-Time
            </span>
          </div>

          <div className="space-y-4">
            {/* Live BMI gauge */}
            <div className="glass-pill rounded-2xl p-4 space-y-2 border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient BMI</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${bmiDetails.color}`}>
                  {bmiDetails.text}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                {calculatedBMI || '22.0'} <span className="text-xs font-normal text-slate-500">kg/m²</span>
              </div>
            </div>

            {/* Live BP Category */}
            <div className="glass-pill rounded-2xl p-4 space-y-2 border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Blood Pressure</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${livePreview.sysColor}`}>
                  {livePreview.sysStatus}
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formData.bpSystolic || 120} / {formData.bpDiastolic || 80} <span className="text-xs font-normal text-slate-500">mmHg</span>
              </div>
            </div>

            {/* Live Fasting Glucose */}
            <div className="glass-pill rounded-2xl p-4 space-y-2 border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fasting Glucose</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${livePreview.gluColor}`}>
                  {livePreview.gluStatus}
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formData.glucose || 90} <span className="text-xs font-normal text-slate-500">mg/dL</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start">
            <HeartPulse className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Biomarkers are securely analyzed using precision clinical health algorithms for multi-organ risk prediction.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
