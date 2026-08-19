import React, { useState } from 'react';
import { 
  Stethoscope, Search, Activity, Pill, ShieldAlert, AlertOctagon, 
  AlertTriangle, CheckCircle2, CheckCircle, ArrowRight, Zap, Sparkles, User,
  Brain, Heart, Droplets, Wind, ShieldCheck, Bot
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

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
  const [activeRegion, setActiveRegion] = useState('all');

  const bodyRegions = [
    { id: 'all', label: 'All Symptoms', icon: '🌐', count: 14 },
    { id: 'head', label: 'Head & Neuro', icon: '🧠', count: 4, symptoms: ['Headache', 'Dizziness', 'Sore Throat', 'Vision Blur'] },
    { id: 'chest', label: 'Chest & Cardio', icon: '🫀', count: 4, symptoms: ['Chest Pain', 'Shortness of Breath', 'Palpitations', 'Cough'] },
    { id: 'abdomen', label: 'Abdomen & GI', icon: '🤢', count: 4, symptoms: ['Stomach ache', 'Nausea', 'Acid Reflux', 'Fever / Chills'] },
    { id: 'spine', label: 'Spine & Renal', icon: '🪵', count: 2, symptoms: ['Lower Back Pain', 'Flank Pain'] },
    { id: 'limbs', label: 'Joints & Limbs', icon: '🦴', count: 2, symptoms: ['Joint Pain', 'Leg Swelling (Edema)'] }
  ];

  const presetSymptoms = [
    { label: 'Stomach ache', icon: '🤢', region: 'abdomen' },
    { label: 'Headache', icon: '🤯', region: 'head' },
    { label: 'Fever / Chills', icon: '🤒', region: 'abdomen' },
    { label: 'Chest Pain', icon: '🫀', region: 'chest' },
    { label: 'Shortness of Breath', icon: '🫁', region: 'chest' },
    { label: 'Cough', icon: '🗣️', region: 'chest' },
    { label: 'Sore Throat', icon: '🍵', region: 'head' },
    { label: 'Nausea', icon: '🤢', region: 'abdomen' },
    { label: 'Fatigue', icon: '🥱', region: 'all' },
    { label: 'Joint Pain', icon: '🦴', region: 'limbs' },
    { label: 'Lower Back Pain', icon: '🪵', region: 'spine' },
    { label: 'Dizziness', icon: '💫', region: 'head' },
    { label: 'Palpitations', icon: '💓', region: 'chest' },
    { label: 'Acid Reflux', icon: '🔥', region: 'abdomen' },
    { label: 'Leg Swelling (Edema)', icon: '🦶', region: 'limbs' },
    { label: 'Flank Pain', icon: '🩻', region: 'spine' }
  ];

  const displayedSymptoms = activeRegion === 'all' 
    ? presetSymptoms 
    : presetSymptoms.filter(s => s.region === activeRegion || s.region === 'all');

  const toggleSymptom = (label) => {
    soundFX.play('slider');
    if (symptomTags.includes(label)) {
      setSymptomTags(symptomTags.filter(t => t !== label));
    } else {
      setSymptomTags([...symptomTags, label]);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in no-print text-slate-100">
      
      {/* Header Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/25 shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">AI Clinical Triage</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Multi-Symptom Differential Engine
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Symptom Checker & Clinical Triage Engine</h2>
              <p className="text-xs text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
                Select by anatomical body zone or search physical symptoms to evaluate clinical urgency, differential condition likelihood, specialist recommendations, and red-flag warning signs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Grid Form & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Symptom Input Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>Anatomical Selector & Symptoms</span>
              </h3>
              <span className="text-xs text-amber-400 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {symptomTags.length} Selected
              </span>
            </div>

            {/* Anatomical Region Pills */}
            <div>
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2.5">
                1. Select Anatomical Focus Area
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {bodyRegions.map(reg => {
                  const isRegActive = activeRegion === reg.id;
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => {
                        soundFX.play('click');
                        setActiveRegion(reg.id);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isRegActive 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/30 scale-105 border border-amber-300'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span>{reg.icon}</span>
                      <span className="truncate">{reg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Select Preset Symptom Chips */}
            <div>
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2.5">
                2. Tap Symptoms to Include
              </label>
              <div className="flex flex-wrap gap-2">
                {displayedSymptoms.map(item => {
                  const isSelected = symptomTags.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => toggleSymptom(item.label)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105 border border-amber-400'
                          : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:border-amber-400/50'
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
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
                Add Custom Clinical Symptom
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={e => setSymptomInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && symptomInput.trim()) {
                      e.preventDefault();
                      soundFX.play('slider');
                      if (!symptomTags.includes(symptomInput.trim())) {
                        setSymptomTags([...symptomTags, symptomInput.trim()]);
                      }
                      setSymptomInput('');
                    }
                  }}
                  placeholder="e.g. Acid reflux, stiff neck, ear pain, burning sensation..."
                  className="flex-1 px-4 py-3 glass-input rounded-2xl outline-none text-xs font-bold text-white placeholder:text-slate-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (symptomInput.trim() && !symptomTags.includes(symptomInput.trim())) {
                      soundFX.play('slider');
                      setSymptomTags([...symptomTags, symptomInput.trim()]);
                      setSymptomInput('');
                    }
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-white border border-slate-700 font-bold text-xs rounded-2xl cursor-pointer transition shadow-xs"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Selected Tags Display */}
            {symptomTags.length > 0 && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-amber-300 block">Selected Active Symptoms ({symptomTags.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {symptomTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-amber-500/40 font-bold text-xs text-white rounded-xl shadow-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.play('click');
                          setSymptomTags(symptomTags.filter(t => t !== tag));
                        }}
                        className="text-amber-400 hover:text-rose-400 font-black ml-1 cursor-pointer"
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
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
                Clinical Context & Patient Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={symptomDesc}
                onChange={e => setSymptomDesc(e.target.value)}
                placeholder="Describe when symptoms started, aggravating/relieving factors, or associated feelings..."
                className="w-full px-4 py-3 glass-input rounded-2xl outline-none text-xs font-semibold text-white placeholder:text-slate-500 shadow-inner"
              />
            </div>

            {/* Duration & Severity Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
                  Symptom Duration
                </label>
                <select
                  value={symptomDuration}
                  onChange={e => {
                    soundFX.play('click');
                    setSymptomDuration(e.target.value);
                  }}
                  className="w-full px-3 py-3 glass-input rounded-2xl text-xs font-extrabold text-white outline-none cursor-pointer"
                >
                  <option value="Today" className="bg-slate-900 text-white">Today (Acute)</option>
                  <option value="1-3 days" className="bg-slate-900 text-white">1 to 3 Days</option>
                  <option value="1 week" className="bg-slate-900 text-white">1 Week</option>
                  <option value="> 2 weeks" className="bg-slate-900 text-white">&gt; 2 Weeks (Persistent)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
                  Symptom Severity
                </label>
                <select
                  value={symptomSeverity}
                  onChange={e => {
                    soundFX.play('click');
                    setSymptomSeverity(e.target.value);
                  }}
                  className="w-full px-3 py-3 glass-input rounded-2xl text-xs font-extrabold text-white outline-none cursor-pointer"
                >
                  <option value="Mild" className="bg-slate-900 text-white">Mild (Noticeable)</option>
                  <option value="Moderate" className="bg-slate-900 text-white">Moderate (Distracting)</option>
                  <option value="Severe" className="bg-slate-900 text-white">Severe (Intense / Disruptive)</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => {
                soundFX.play('scan');
                handleCheckSymptom();
              }}
              disabled={analyzingSymptom}
              className="w-full btn-magnetic bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer"
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
            <div className="glass-panel rounded-3xl p-6 border border-amber-500/25 shadow-2xl space-y-6 animate-fade-in">
              
              {/* Triage Urgency Header Badge */}
              <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                symptomResult.badge_color === 'red'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : symptomResult.badge_color === 'amber'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  symptomResult.badge_color === 'red'
                    ? 'bg-rose-600 text-white animate-pulse'
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
                  <h4 className="font-black text-base mt-0.5 text-white">{symptomResult.urgency_title}</h4>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold flex-wrap">
                    <span className="px-2.5 py-1 bg-slate-900/90 rounded-xl border border-slate-700 text-slate-200">
                      Recommended Specialist: <strong className="text-amber-400">{symptomResult.specialist}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched Differential Diagnoses */}
              <div>
                <h4 className="font-black text-white text-sm flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Possible Differential Diagnoses</span>
                </h4>

                <div className="space-y-3">
                  {symptomResult.matched_conditions.map((cond, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl space-y-2 shadow-xs transition-colors">
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-white text-sm">{cond.name}</h5>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black border border-amber-500/30 font-mono">
                          {cond.match_score}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{cond.description}</p>
                      <div className="pt-1 text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong className="text-white">Action:</strong> {cond.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Home Remedies */}
              {symptomResult.home_remedies && symptomResult.home_remedies.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                  <h4 className="font-black text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    <span>Recommended Home Care & Relief Steps</span>
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {symptomResult.home_remedies.map((rem, i) => (
                      <li key={i} className="text-xs font-semibold text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    soundFX.play('click');
                    resetWizard();
                    setCurrentTab('wizard');
                  }}
                  className="w-full btn-magnetic py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Run Full Disease Risk Assessor</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => {
                    soundFX.play('click');
                    setCurrentTab('chatbot');
                  }}
                  className="w-full sm:w-auto py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI HealthBot</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-10 border border-amber-500/20 text-center flex flex-col items-center justify-center h-full space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center animate-pulse">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-white text-lg">Instant Symptom Diagnostic Triage</h4>
                <p className="text-xs text-slate-400 font-medium max-w-sm mt-1 leading-relaxed">
                  Select an anatomical region or choose symptoms on the left and click <strong>"Run AI Symptom Triage"</strong> to evaluate clinical conditions.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
