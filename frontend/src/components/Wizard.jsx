import React, { useMemo } from 'react';
import { 
  ArrowLeft, ArrowRight, Activity, Check, HeartPulse, Sparkles, 
  Flame, ShieldCheck, Heart, Moon, Zap, User, Droplet, Dumbbell, Wine, Ban
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

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

  // Preset Patient Profiles for 1-click clinical testing
  const presets = [
    {
      name: '🏃 25yo Athletic Runner',
      data: {
        name: 'Alex Rivera', age: 25, gender: 'male', height: 178, weight: 70,
        smoking: 'no', alcohol: 'low', physicalActivity: 'active', sleepDuration: 8,
        bpSystolic: 112, bpDiastolic: 74, cholesterol: 165, glucose: 84, insulin: 5, heartRate: 54
      }
    },
    {
      name: '💼 45yo Sedentary (Cardio-Metabolic Risk)',
      data: {
        name: 'David Miller', age: 45, gender: 'male', height: 175, weight: 88,
        smoking: 'no', alcohol: 'moderate', physicalActivity: 'sedentary', sleepDuration: 6,
        bpSystolic: 136, bpDiastolic: 88, cholesterol: 228, glucose: 118, insulin: 16, heartRate: 78
      }
    },
    {
      name: '🚨 60yo Hypertensive Alert',
      data: {
        name: 'Elena Rostova', age: 60, gender: 'female', height: 162, weight: 82,
        smoking: 'yes', alcohol: 'moderate', physicalActivity: 'sedentary', sleepDuration: 5.5,
        bpSystolic: 164, bpDiastolic: 102, cholesterol: 265, glucose: 155, insulin: 28, heartRate: 92
      }
    }
  ];

  const applyPreset = (p) => {
    soundFX.play('switch');
    setFormData(prev => ({ ...prev, ...p.data }));
  };

  // Real-time calculated live risk preview values
  const livePreview = useMemo(() => {
    const age = parseInt(formData.age) || 35;
    const bmiVal = parseFloat(calculatedBMI) || 22.0;
    const sys = parseInt(formData.bpSystolic) || 120;
    const dia = parseInt(formData.bpDiastolic) || 80;
    const glu = parseInt(formData.glucose) || 90;

    // Mean Arterial Pressure (MAP) & Pulse Pressure
    const mapVal = Math.round((2 * dia + sys) / 3);
    const pulsePressure = sys - dia;

    let sysStatus = 'Normal Blood Pressure';
    let sysColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (sys >= 180 || dia >= 120) {
      sysStatus = 'Hypertensive Crisis';
      sysColor = 'text-rose-400 bg-rose-500/15 border-rose-500/40 animate-pulse';
    } else if (sys >= 140 || dia >= 90) {
      sysStatus = 'Hypertension Stage 2';
      sysColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    } else if (sys >= 130 || dia >= 80) {
      sysStatus = 'Hypertension Stage 1';
      sysColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    } else if (sys >= 120 && dia < 80) {
      sysStatus = 'Elevated Blood Pressure';
      sysColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }

    let gluStatus = 'Normal Fasting Glucose';
    let gluColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (glu >= 126) {
      gluStatus = 'Elevated Fasting Glucose (ADA)';
      gluColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    } else if (glu >= 100) {
      gluStatus = 'Impaired Fasting Glucose';
      gluColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }

    return { sysStatus, sysColor, gluStatus, gluColor, age, bmiVal, mapVal, pulsePressure };
  }, [formData, calculatedBMI]);

  return (
    <div className="max-w-7xl mx-auto animate-tab-fade no-print space-y-8 text-slate-100">
      
      {/* Quick Test Presets Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Quick Patient Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer shadow-xs hover:scale-105"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step navigation nodes */}
      <div className="flex justify-between items-center relative mb-8 px-4 sm:px-10 max-w-3xl mx-auto">
        <div className="absolute top-5 sm:top-6 left-8 sm:left-12 right-8 sm:right-12 h-1 bg-slate-800 z-0 rounded-full"></div>
        <div 
          className="absolute top-5 sm:top-6 left-8 sm:left-12 h-1 bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 z-10 transition-all duration-500 rounded-full shadow-md shadow-amber-500/50"
          style={{ width: `${((wizardStep - 1) / 2) * 82}%` }}
        ></div>

        {[
          { step: 1, label: '1. Personal Profile', shortLabel: '1. Profile' },
          { step: 2, label: '2. Lifestyle Habits', shortLabel: '2. Lifestyle' },
          { step: 3, label: '3. Clinical Biomarkers', shortLabel: '3. Biomarkers' }
        ].map(item => (
          <div key={item.step} className="flex flex-col items-center gap-2 relative z-20">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm border-2 transition-all duration-300 ${
              wizardStep === item.step
                ? 'bg-linear-to-tr from-amber-500 to-yellow-500 text-white border-amber-400 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20 scale-105'
                : wizardStep > item.step
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-900/90 text-slate-500 border-white/10'
            }`}>
              {wizardStep > item.step ? <Check className="w-5 h-5 stroke-3" /> : item.step}
            </div>
            <span className={`text-[11px] sm:text-xs font-black transition-all text-center ${
              wizardStep === item.step ? 'text-amber-400' : 'text-slate-400'
            }`}>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Main Grid: Left Form (8 cols) + Right Live Assessor Preview (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border-white/10">
          <form onSubmit={e => e.preventDefault()} className="space-y-6">
            
            {/* STEP 1: Personal profile information */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-tab-fade">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-black text-xl text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <span>Personal Patient Details</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Record baseline demographic metrics for clinical cardiac risk calibration.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Patient Full Name</label>
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
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Patient Age</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 45"
                      value={formData.age}
                      onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className={`w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold ${
                        errors.age ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                      }`}
                    />
                    {errors.age && <span className="text-[10px] font-bold text-rose-500">{errors.age}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Biological Sex</label>
                    <div className="flex gap-3">
                      {['male', 'female', 'other'].map(g => (
                        <label key={g} className="flex-1 relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="gender" 
                            checked={formData.gender === g}
                            onChange={() => {
                              soundFX.play('click');
                              setFormData(prev => ({ ...prev, gender: g }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-full text-center py-3 bg-slate-900/80 border border-white/10 peer-checked:border-amber-500 peer-checked:bg-amber-500/15 peer-checked:text-amber-400 text-xs font-black rounded-2xl transition shadow-xs">
                            {g.toUpperCase()}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Height (cm)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 175"
                        value={formData.height}
                        onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
                        className={`w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold ${
                          errors.height ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''
                        }`}
                      />
                      {errors.height && <span className="text-[10px] font-bold text-rose-500">{errors.height}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Weight (kg)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 74"
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
                  <div className="md:col-span-2 glass-card-interactive rounded-2xl p-5 flex justify-between items-center border-amber-500/20">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Calculated BMI Index (WHO)</h4>
                      <div className="text-3xl font-black text-white flex items-baseline gap-1 font-mono">
                        {calculatedBMI || '--'} <span className="text-xs font-bold text-slate-400">kg/m²</span>
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
              <div className="space-y-6 animate-tab-fade">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-black text-xl text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <span>Lifestyle & Behavioral Habits</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Record daily behavioral patterns directly affecting arterial and myocardial health.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tobacco Smoking Tile */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tobacco Smoking Status</span>
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'no', label: 'Non-Smoker' },
                        { id: 'yes', label: 'Active Smoker' }
                      ].map(opt => (
                        <label key={opt.id} className="flex-1 relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="smoking" 
                            checked={formData.smoking === opt.id}
                            onChange={() => {
                              soundFX.play('click');
                              setFormData(prev => ({ ...prev, smoking: opt.id }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-full text-center py-3.5 bg-slate-900/80 border border-white/10 peer-checked:border-amber-500 peer-checked:bg-amber-500/15 peer-checked:text-amber-400 text-xs font-black rounded-2xl transition shadow-xs">
                            {opt.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Alcohol Consumption */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Wine className="w-3.5 h-3.5 text-amber-400" />
                      <span>Alcohol Consumption</span>
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'low', label: 'Light' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'high', label: 'Heavy' }
                      ].map(item => (
                        <label key={item.value} className="flex-1 relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="alcohol" 
                            checked={formData.alcohol === item.value}
                            onChange={() => {
                              soundFX.play('click');
                              setFormData(prev => ({ ...prev, alcohol: item.value }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-full text-center py-3.5 bg-slate-900/80 border border-white/10 peer-checked:border-amber-500 peer-checked:bg-amber-500/15 peer-checked:text-amber-400 text-xs font-black rounded-2xl transition shadow-xs">
                            {item.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Physical Activity */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Physical Activity Level</span>
                    </label>
                    <div className="flex gap-2">
                      {['sedentary', 'moderate', 'active'].map(opt => (
                        <label key={opt} className="flex-1 relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="activity" 
                            checked={formData.physicalActivity === opt}
                            onChange={() => {
                              soundFX.play('click');
                              setFormData(prev => ({ ...prev, physicalActivity: opt }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-full text-center py-3.5 bg-slate-900/80 border border-white/10 peer-checked:border-amber-500 peer-checked:bg-amber-500/15 peer-checked:text-amber-400 text-xs font-black rounded-2xl transition shadow-xs">
                            {opt.toUpperCase()}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sleep Duration */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      <label htmlFor="sleepDurationInput" className="flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Daily Sleep Duration</span>
                      </label>
                      <span className="text-amber-400 font-mono font-bold text-sm">{formData.sleepDuration || 7} hrs/night</span>
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
                        className="w-24 px-3.5 py-2.5 glass-input rounded-2xl text-sm font-extrabold text-center outline-none shadow-xs font-mono"
                        placeholder="7.5"
                      />
                      <input 
                        type="range" 
                        min="3" 
                        max="14" 
                        step="0.5"
                        value={formData.sleepDuration || 7}
                        onChange={e => {
                          soundFX.play('slider');
                          setFormData(prev => ({ ...prev, sleepDuration: parseFloat(e.target.value) }));
                        }}
                        className="flex-1 accent-amber-500"
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 3: Biomarkers & algorithm */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-tab-fade">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-black text-xl text-white flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-amber-400" />
                    <span>Clinical Vital Signs & Lab Biomarkers</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Input laboratory biomarker values for multi-vector cardiac risk prediction.</p>
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
                      <div key={item.key} className="flex flex-col gap-3 glass-card-interactive rounded-2xl p-4.5 transition-all duration-300">
                        <div className="flex justify-between items-center text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                          <span className="truncate max-w-48 sm:max-w-none">{item.label}</span>
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
                            className="w-24 px-3 py-2 glass-input rounded-xl text-sm font-black text-amber-400 text-center outline-none shrink-0 font-mono"
                            placeholder={item.min.toString()}
                          />
                          <input 
                            type="range" 
                            min={item.min} 
                            max={item.max}
                            value={formData[item.key] || item.min}
                            onChange={e => {
                              soundFX.play('slider');
                              setFormData(prev => ({ ...prev, [item.key]: parseInt(e.target.value) || item.min }));
                            }}
                            className="flex-1 accent-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* Controls Row */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-white/10">
              <button 
                type="button"
                onClick={() => {
                  soundFX.play('click');
                  setWizardStep(prev => prev - 1);
                }}
                disabled={wizardStep === 1 || predicting}
                className={`w-full sm:w-auto py-3 px-5 rounded-2xl border font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition ${
                  wizardStep === 1 
                    ? 'hidden sm:inline-flex opacity-0 pointer-events-none' 
                    : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  soundFX.play('click');
                  handleNextStep();
                }}
                disabled={predicting}
                className="w-full sm:w-auto btn-magnetic bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white py-3.5 sm:py-3 px-7 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-amber-500/30"
              >
                {predicting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    <span>Computing AI Risk Models...</span>
                  </>
                ) : wizardStep === 3 ? (
                  <>
                    <span>Generate Precision Heart Forecast</span>
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

        {/* Right Column: Live Real-time Assessor HUD Card */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border-amber-500/20 sticky top-24 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>Live Biomarker HUD</span>
            </h3>
            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Live Monitor
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Live BMI gauge */}
            <div className="glass-card-interactive rounded-2xl p-4 space-y-1.5 border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Patient BMI</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${bmiDetails.color}`}>
                  {bmiDetails.text}
                </span>
              </div>
              <div className="text-2xl font-black text-white flex items-baseline gap-1 font-mono">
                {calculatedBMI || '22.0'} <span className="text-xs font-normal text-slate-400">kg/m²</span>
              </div>
            </div>

            {/* Live BP Category & Mean Arterial Pressure */}
            <div className="glass-card-interactive rounded-2xl p-4 space-y-2 border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Blood Pressure</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${livePreview.sysColor}`}>
                  {livePreview.sysStatus}
                </span>
              </div>
              <div className="text-xl font-black text-white font-mono">
                {formData.bpSystolic || 120} / {formData.bpDiastolic || 80} <span className="text-xs font-normal text-slate-400">mmHg</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <span>Mean Arterial Pressure:</span>
                <strong className="text-amber-400 font-mono">{livePreview.mapVal} mmHg</strong>
              </div>
            </div>

            {/* Live Fasting Glucose */}
            <div className="glass-card-interactive rounded-2xl p-4 space-y-1.5 border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Fasting Glucose</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${livePreview.gluColor}`}>
                  {livePreview.gluStatus}
                </span>
              </div>
              <div className="text-xl font-black text-white font-mono">
                {formData.glucose || 90} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex gap-3 items-start">
            <HeartPulse className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Real-time multi-dimensional algorithms calculate arterial plaque risk, CAD likelihood, and left ventricular load instantly upon submission.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
