import React from 'react';
import { 
  Stethoscope, Search, Activity, Pill, ShieldAlert, AlertOctagon, 
  AlertTriangle, CheckCircle2, CheckCircle, ArrowRight 
} from 'lucide-react';

export default function SymptomChecker({
  symptomTags,
  setSymptomTags,
  symptomInput,
  setSymptomInput,
  symptomDesc,
  setSymptomDesc,
  symptomDuration,
  setSymptomDuration,
  symptomSeverity,
  setSymptomSeverity,
  analyzingSymptom,
  symptomResult,
  handleCheckSymptom,
  resetWizard,
  setCurrentTab
}) {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in no-print">
      
      {/* Header Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-200/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30">AI Clinical Triage</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">Multi-Symptom Analysis</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Symptom Checker & Clinical Triage Engine</h2>
              <p className="text-xs text-slate-600 font-medium mt-1 max-w-2xl">
                Select or describe physical symptoms (e.g. Stomach ache, Headache, Fever, Chest pain, Cough, Nausea) to evaluate clinical urgency, differential condition likelihood, specialist recommendations, and red-flag warning signs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Grid Form & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Symptom Input Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-amber-200/80 shadow-lg space-y-6">
            
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-600" />
                <span>Select or Add Symptoms</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">{symptomTags.length} Selected</span>
            </div>

            {/* Quick Select Preset Symptom Chips */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                Common Quick-Select Symptoms
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Stomach ache', icon: '🤢' },
                  { label: 'Headache', icon: '🤯' },
                  { label: 'Fever / Chills', icon: '🤒' },
                  { label: 'Chest Pain', icon: '🫀' },
                  { label: 'Shortness of Breath', icon: '🫁' },
                  { label: 'Cough', icon: '🗣️' },
                  { label: 'Sore Throat', icon: '🍵' },
                  { label: 'Nausea', icon: '🤢' },
                  { label: 'Fatigue', icon: '🥱' },
                  { label: 'Joint Pain', icon: '🦴' },
                  { label: 'Lower Back Pain', icon: '🪵' },
                  { label: 'Dizziness', icon: '💫' }
                ].map(item => {
                  const isSelected = symptomTags.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSymptomTags(symptomTags.filter(t => t !== item.label));
                        } else {
                          setSymptomTags([...symptomTags, item.label]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Symptom Search Input */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Add Custom Symptom
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={e => setSymptomInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && symptomInput.trim()) {
                      e.preventDefault();
                      if (!symptomTags.includes(symptomInput.trim())) {
                        setSymptomTags([...symptomTags, symptomInput.trim()]);
                      }
                      setSymptomInput('');
                    }
                  }}
                  placeholder="e.g. Acid reflux, stiff neck, ear pain..."
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (symptomInput.trim() && !symptomTags.includes(symptomInput.trim())) {
                      setSymptomTags([...symptomTags, symptomInput.trim()]);
                      setSymptomInput('');
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Selected Tags Display */}
            {symptomTags.length > 0 && (
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold text-amber-900 block">Selected Symptoms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {symptomTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 text-amber-950 font-bold text-xs rounded-lg shadow-2xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setSymptomTags(symptomTags.filter(t => t !== tag))}
                        className="text-amber-700 hover:text-rose-600 font-extrabold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Freeform Detailed Notes */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Describe Symptoms & Context (Optional)
              </label>
              <textarea
                rows={3}
                value={symptomDesc}
                onChange={e => setSymptomDesc(e.target.value)}
                placeholder="Describe when the pain started, what makes it better/worse, or any associated feelings..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-semibold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Duration & Severity Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Symptom Duration
                </label>
                <select
                  value={symptomDuration}
                  onChange={e => setSymptomDuration(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Today">Today (Acute)</option>
                  <option value="1-3 days">1 to 3 Days</option>
                  <option value="1 week">1 Week</option>
                  <option value="> 2 weeks">&gt; 2 Weeks (Persistent)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Symptom Severity
                </label>
                <select
                  value={symptomSeverity}
                  onChange={e => setSymptomSeverity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Mild">Mild (Noticeable)</option>
                  <option value="Moderate">Moderate (Distracting)</option>
                  <option value="Severe">Severe (Intense / Disruptive)</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => handleCheckSymptom()}
              disabled={analyzingSymptom}
              className="w-full btn-magnetic bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              {analyzingSymptom ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>Evaluating Clinical Symptoms...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  <span>Run AI Symptom Triage</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Clinical Triage & Differential Diagnosis Results */}
        <div className="lg:col-span-6">
          {symptomResult ? (
            <div className="glass-panel rounded-3xl p-6 border border-amber-200/80 shadow-xl space-y-6 animate-fade-in">
              
              {/* Triage Urgency Header Badge */}
              <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                symptomResult.badge_color === 'red'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-950'
                  : symptomResult.badge_color === 'amber'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-950'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  symptomResult.badge_color === 'red'
                    ? 'bg-rose-600 text-white'
                    : symptomResult.badge_color === 'amber'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {symptomResult.badge_color === 'red' ? (
                    <AlertOctagon className="w-6 h-6 animate-pulse" />
                  ) : symptomResult.badge_color === 'amber' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">Clinical Triage Assessment</span>
                  <h4 className="font-extrabold text-base mt-0.5">{symptomResult.urgency_title}</h4>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                    <span className="px-2.5 py-0.5 bg-white/80 rounded-md border border-black/10">
                      Recommended Specialist: <strong className="text-amber-900">{symptomResult.specialist}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched Differential Diagnoses */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>Possible Differential Diagnoses</span>
                </h4>

                <div className="space-y-3">
                  {symptomResult.matched_conditions.map((cond, idx) => (
                    <div key={idx} className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-slate-900 text-sm">{cond.name}</h5>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 text-[11px] font-black">
                          {cond.match_score}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{cond.description}</p>
                      <div className="pt-1 text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Action:</strong> {cond.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Home Remedies */}
              {symptomResult.home_remedies && symptomResult.home_remedies.length > 0 && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Pill className="w-4 h-4 text-amber-700" />
                    <span>Recommended Home Care & Relief Steps</span>
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {symptomResult.home_remedies.map((rem, i) => (
                      <li key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Critical Red-Flag Warnings */}
              {symptomResult.red_flags && symptomResult.red_flags.length > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-rose-950 text-xs uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Critical Red-Flag Warning Signs</span>
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {symptomResult.red_flags.map((flag, i) => (
                      <li key={i} className="text-xs font-semibold text-rose-900 flex items-start gap-2">
                        <span className="text-rose-600 font-bold">⚠️</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    resetWizard();
                    setCurrentTab('wizard');
                  }}
                  className="w-full btn-magnetic py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Run Full Disease Risk Wizard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clinical Disclaimer */}
              <p className="text-[10px] text-slate-400 font-medium italic text-center pt-2 border-t border-slate-200/60">
                {symptomResult.disclaimer}
              </p>

            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-10 border border-amber-200/80 text-center flex flex-col items-center justify-center h-full space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg">Instant Symptom Diagnostic Triage</h4>
                <p className="text-xs text-slate-500 font-medium max-w-sm mt-1">
                  Select one or more symptoms on the left (e.g. Stomach ache, Headache, Fever, Chest pain) and click <strong>"Run AI Symptom Triage"</strong> to view clinical analysis.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
