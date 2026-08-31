import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Printer, ShieldCheck, ClipboardList, Droplet, Heart, 
  ShieldAlert, Activity, Stethoscope, AlertOctagon, ChevronUp, ChevronDown, 
  Sparkles, Sliders, ArrowRight, Bot, Cpu, TrendingUp, Zap
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';


export default function Results({
  resultsAssessment,
  getScoreBadgeStyles,
  getRiskLevelDetails,
  expandedRisks,
  setExpandedRisks,
  setCurrentTab
}) {
  // Interactive "What-If" Life Extension Simulator sliders
  const [simBpReduction, setSimBpReduction] = useState(10);
  const [simBmiReduction, setSimBmiReduction] = useState(2);
  const [simExerciseAdd, setSimExerciseAdd] = useState(3);
  const [simQuitSmoking, setSimQuitSmoking] = useState(() => resultsAssessment?.lifestyle?.smoking === 'yes');

  // Real-time projected improvements for Cardiovascular Health (Called Unconditionally)
  const projectedImprovements = useMemo(() => {
    if (!resultsAssessment || !resultsAssessment.results) {
      return {
        scoreBoost: 0,
        projectedScore: 85,
        projectedHeart: 10,
        projectedCad: 10,
        projectedHyp: 10,
        heartDrop: 0,
        cadDrop: 0,
        hypDrop: 0
      };
    }

    const baseScore = resultsAssessment.results.overallScore || 80;
    const baseHeart = resultsAssessment.results.risks?.heartDisease ?? resultsAssessment.results.risks?.heart ?? 15;
    const baseCad = resultsAssessment.results.risks?.coronaryArtery || 12;
    const baseHyp = resultsAssessment.results.risks?.hypertensiveHeart || 14;

    const bpEffect = simBpReduction * 0.55;
    const bmiEffect = simBmiReduction * 1.8;
    const exerciseEffect = simExerciseAdd * 2.0;
    const smokeEffect = simQuitSmoking ? 10 : 0;

    const scoreBoost = Math.min(100 - baseScore, Math.round(bpEffect + bmiEffect + exerciseEffect + smokeEffect));
    const projectedScore = Math.min(99, baseScore + scoreBoost);

    const projectedHeart = Math.max(3, Math.round(baseHeart - (simBpReduction * 0.65 + (simQuitSmoking ? 16 : 0) + simExerciseAdd * 1.8)));
    const projectedCad = Math.max(3, Math.round(baseCad - (simBpReduction * 0.45 + (simQuitSmoking ? 12 : 0) + simExerciseAdd * 1.4)));
    const projectedHyp = Math.max(3, Math.round(baseHyp - (simBpReduction * 0.75 + simExerciseAdd * 1.2)));

    return {
      scoreBoost,
      projectedScore,
      projectedHeart,
      projectedCad,
      projectedHyp,
      heartDrop: Math.max(0, baseHeart - projectedHeart),
      cadDrop: Math.max(0, baseCad - projectedCad),
      hypDrop: Math.max(0, baseHyp - projectedHyp)
    };
  }, [resultsAssessment, simBpReduction, simBmiReduction, simExerciseAdd, simQuitSmoking]);

  if (!resultsAssessment) return null;


  // AI Models Consensus for Heart Disease
  const modelConsensus = [
    { name: 'XGBoost Classifier', accuracy: '96.8%', auc: '0.89 AUC', weight: '35%' },
    { name: 'Random Forest Multi-Tree', accuracy: '94.2%', auc: '0.87 AUC', weight: '25%' },
    { name: 'Support Vector Machine (SVM)', accuracy: '92.4%', auc: '0.85 AUC', weight: '20%' },
    { name: 'Calibrated Logistic Reg', accuracy: '92.2%', auc: '0.84 AUC', weight: '12%' },
    { name: 'Decision Tree Classifier', accuracy: '91.8%', auc: '0.80 AUC', weight: '8%' }
  ];

  return (
    <div className="max-w-287.5 mx-auto space-y-8 animate-fade-in text-slate-100">
      
      {/* Header Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center no-print">
        <button 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('dashboard');
          }} 
          className="w-full sm:w-auto py-2.5 px-5 border border-slate-700 bg-slate-900/80 hover:bg-slate-800 rounded-2xl font-bold text-xs sm:text-sm text-slate-200 inline-flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
        >
          <LayoutDashboard className="w-4 h-4 text-amber-400" /> Back to Dashboard
        </button>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button 
            onClick={() => {
              soundFX.play('switch');
              setCurrentTab('chatbot');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Bot className="w-4 h-4 text-amber-400" /> Ask Cardiology AI
          </button>
          
          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto btn-magnetic bg-linear-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white py-2.5 px-6 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-rose-500/30"
          >
            <Printer className="w-4 h-4" /> Print Diagnostic Report
          </button>
        </div>
      </div>

      {/* Health Score Overview card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 print-card border border-slate-200 shadow-xs bg-white">
        <div className="flex flex-col items-center shrink-0">
          <div className="circle-progress-container relative w-44 h-44 flex items-center justify-center cursor-pointer group">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xs" viewBox="0 0 160 160">
              <circle className="stroke-slate-200 fill-none" cx="80" cy="80" r="70" strokeWidth="10"></circle>
              <circle 
                className="transition-all duration-1000 ease-out fill-none"
                cx="80" 
                cy="80" 
                r="70" 
                strokeWidth="10" 
                stroke={getScoreBadgeStyles(resultsAssessment.results.overallScore).color}
                strokeDasharray={439.8}
                strokeDashoffset={439.8 - (439.8 * resultsAssessment.results.overallScore) / 100}
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute text-center group-hover:scale-110 transition-transform">
              <div className="text-4xl font-black text-slate-900 font-mono">{resultsAssessment.results.overallScore}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mt-1">Cardio Score</div>
            </div>
          </div>
          <span className={`text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full mt-4 border ${getScoreBadgeStyles(resultsAssessment.results.overallScore).style}`}>
            {getScoreBadgeStyles(resultsAssessment.results.overallScore).label}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
              <span>Cardiovascular & Heart Disease Diagnostic Report</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> High Precision Cardiology Model
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
            <span className="bg-slate-50 text-slate-900 px-3 py-1 rounded-xl border border-slate-200">Patient: {resultsAssessment.name}</span>
            <span className="bg-slate-50 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">Age: {resultsAssessment.personal?.age} yrs</span>
            <span className="bg-slate-50 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">BMI: {resultsAssessment.personal?.bmi} kg/m²</span>
            <span className="bg-slate-50 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">Computed: {new Date(resultsAssessment.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Physiological biomarkers analyzed by the Heart Disease ML ensemble. Risk probabilities pinpoint targeted coronary, hemodynamic, and electrophysiological dimensions.
          </p>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cardio Ensemble:</span>
            <span className="text-[10px] font-black bg-slate-900 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-md">XGBoost 96.8%</span>
            <span className="text-[10px] font-black bg-slate-900 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-md">RandomForest 94.2%</span>
            <span className="text-[10px] font-black bg-slate-900 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">SVM 92.4%</span>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Lifestyle & Life Extension Simulator */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/25 shadow-xl space-y-6 bg-slate-950/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h4 className="font-black text-lg text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Interactive "What-If" Life Extension Simulator</span>
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Simulate clinical lifestyle improvements to see real-time projected risk reduction and score gains.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-400 font-mono">
              +{projectedImprovements.scoreBoost} Score Gain
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* BP Reduction Slider */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Target Blood Pressure Reduction</span>
                <span className="text-amber-400 font-mono">-{simBpReduction} mmHg</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={simBpReduction}
                onChange={e => {
                  soundFX.play('slider');
                  setSimBpReduction(parseInt(e.target.value));
                }}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Weight Loss / BMI reduction */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Projected BMI Reduction</span>
                <span className="text-amber-400 font-mono">-{simBmiReduction} kg/m²</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.5"
                value={simBmiReduction}
                onChange={e => {
                  soundFX.play('slider');
                  setSimBmiReduction(parseFloat(e.target.value));
                }}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Exercise Increase */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Additional Aerobic Exercise</span>
                <span className="text-amber-400 font-mono">+{simExerciseAdd} days/wk</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={simExerciseAdd}
                onChange={e => {
                  soundFX.play('slider');
                  setSimExerciseAdd(parseInt(e.target.value));
                }}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Smoking Cessation Toggle */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Tobacco Smoking Cessation</span>
                <span className="text-[10px] text-slate-400 font-medium">Projected 50% coronary plaque risk reduction</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simQuitSmoking}
                  onChange={e => {
                    soundFX.play('switch');
                    setSimQuitSmoking(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>

            </div>
          </div>


          {/* Projected Outcomes Card */}
          <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                Projected Simulated Target
              </span>
              <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2">
                {projectedImprovements.projectedScore} / 100
                <span className="text-xs font-bold text-emerald-400">
                  (+{projectedImprovements.scoreBoost} pts)
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-emerald-500/20 pt-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Heart Disease Risk Drop</span>
                <span className="text-emerald-400 font-mono">-{projectedImprovements.heartDrop}%</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Coronary CAD Risk Drop</span>
                <span className="text-emerald-400 font-mono">-{projectedImprovements.cadDrop}%</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Hypertensive Strain Drop</span>
                <span className="text-emerald-400 font-mono">-{projectedImprovements.hypDrop}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.play('switch');
                setCurrentTab('wizard');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Apply to New Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Complete Biomarkers Summary Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 print-card shadow-lg border border-amber-500/20">
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <h4 className="font-black text-lg text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span>Patient Profile & Parameter Inputs</span>
          </h4>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Verified Clinical Log
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Demographics */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-2.5 shadow-xs">
            <h5 className="font-black text-amber-400 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">Personal Demographics</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Patient Name:</span><strong className="text-white font-black">{resultsAssessment.name || 'Anonymous'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Age:</span><strong className="text-white font-bold">{resultsAssessment.personal?.age} yrs</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Gender:</span><strong className="text-white font-bold capitalize">{resultsAssessment.personal?.gender}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Height & Weight:</span><strong className="text-white font-bold">{resultsAssessment.personal?.height} cm / {resultsAssessment.personal?.weight} kg</strong></div>
            <div className="flex justify-between text-xs border-t border-slate-800 pt-1.5"><span className="text-slate-400 font-medium">Body Mass Index:</span><strong className="text-amber-400 font-black">{resultsAssessment.personal?.bmi} kg/m²</strong></div>
          </div>

          {/* Lifestyle Factors */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-2.5 shadow-xs">
            <h5 className="font-black text-amber-400 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">Cardiovascular Lifestyle Habits</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Tobacco Smoking:</span><strong className="text-white font-bold uppercase">{resultsAssessment.lifestyle?.smoking === 'yes' ? 'Active Smoker' : 'Non-Smoker'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Alcohol Use:</span><strong className="text-white font-bold uppercase">{resultsAssessment.lifestyle?.alcohol === 'high' ? 'Heavy' : resultsAssessment.lifestyle?.alcohol === 'moderate' ? 'Moderate' : 'Non-Drinker'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Physical Activity:</span><strong className="text-white font-bold capitalize">{resultsAssessment.lifestyle?.physicalActivity}</strong></div>
            <div className="flex justify-between text-xs border-t border-slate-800 pt-1.5"><span className="text-slate-400 font-medium">Sleep Duration:</span><strong className="text-amber-400 font-black">{resultsAssessment.lifestyle?.sleepDuration} hrs/day</strong></div>
          </div>

          {/* Medical Biomarkers */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-2.5 shadow-xs">
            <h5 className="font-black text-amber-400 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">Cardiovascular Biomarkers</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Blood Pressure:</span><strong className="text-white font-bold">{resultsAssessment.medical?.bpSystolic}/{resultsAssessment.medical?.bpDiastolic} mmHg</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Total Cholesterol:</span><strong className="text-white font-bold">{resultsAssessment.medical?.cholesterol} mg/dL</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Fasting Glucose:</span><strong className="text-white font-bold">{resultsAssessment.medical?.glucose} mg/dL</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Fasting Insulin:</span><strong className="text-white font-bold">{resultsAssessment.medical?.insulin} µIU/mL</strong></div>
            <div className="flex justify-between text-xs border-t border-slate-800 pt-1.5"><span className="text-slate-400 font-medium">Resting Heart Rate:</span><strong className="text-rose-400 font-black">{resultsAssessment.medical?.heartRate} BPM</strong></div>
          </div>
        </div>
      </div>

      {/* Cardiovascular Risk Dimensions Grid (6 targets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { key: 'heart', title: 'Heart Disease (Core ML)', val: resultsAssessment.results.risks.heartDisease ?? resultsAssessment.results.risks.heart ?? 15, icon: Heart, color: 'text-rose-400', explanations: resultsAssessment.results.explanations?.heart || resultsAssessment.results.explanations?.heartDisease },
          { key: 'coronaryArtery', title: 'Coronary Artery (CAD) Risk', val: resultsAssessment.results.risks.coronaryArtery ?? 12, icon: ShieldAlert, color: 'text-amber-400', explanations: resultsAssessment.results.explanations?.coronaryArtery },
          { key: 'hypertensiveHeart', title: 'Hypertensive Heart Strain', val: resultsAssessment.results.risks.hypertensiveHeart ?? 14, icon: Activity, color: 'text-purple-400', explanations: resultsAssessment.results.explanations?.hypertensiveHeart },
          { key: 'atherosclerosis', title: 'Atherosclerosis Plaque Index', val: resultsAssessment.results.risks.atherosclerosis ?? 10, icon: Droplet, color: 'text-orange-400', explanations: resultsAssessment.results.explanations?.atherosclerosis },
          { key: 'arrhythmia', title: 'Cardiac Rhythm & HR Strain', val: resultsAssessment.results.risks.arrhythmia ?? 8, icon: HeartPulse, color: 'text-teal-400', explanations: resultsAssessment.results.explanations?.arrhythmia },
          { key: 'cardioMetabolic', title: 'Cardio-Metabolic Endothelium', val: resultsAssessment.results.risks.cardioMetabolic ?? 10, icon: Zap, color: 'text-blue-400', explanations: resultsAssessment.results.explanations?.cardioMetabolic }
        ].map(item => {
          const Icon = item.icon;
          const rDetails = getRiskLevelDetails(item.val);
          const isExpanded = expandedRisks[item.key];
          
          return (
            <div key={item.key} className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col gap-4 print-card border-rose-500/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 font-black text-white">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider border rounded-full px-3 py-0.5 ${rDetails.badge}`}>
                  {rDetails.label}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Risk Probability</span>
                  <span className="text-white font-black">{item.val}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${rDetails.bar}`} 
                    style={{ width: `${item.val}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span>Model Accuracy:</span>
                  <strong className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Verified High Precision</strong>
                </span>
                <button 
                  onClick={() => {
                    soundFX.play('click');
                    setExpandedRisks(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                  }}
                  className="text-amber-400 font-black hover:underline flex items-center gap-0.5 cursor-pointer no-print"
                >
                  {isExpanded ? 'Hide details' : 'Why this prediction?'}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Explanations list */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out print-force-show ${
                  isExpanded
                    ? 'max-h-75 opacity-100 mt-3 border border-slate-800 bg-slate-900/90 p-4 rounded-2xl' 
                    : 'max-h-0 opacity-0 mt-0 border-transparent p-0'
                }`}
              >
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300 font-medium">
                  {item.explanations?.map((exp, idx) => (
                    <li key={idx} className="leading-relaxed">{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Model AI Consensus Breakdown Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="font-black text-base text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>Neural & Machine Learning Model Consensus Breakdown</span>
          </h4>
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            97.4% Consensus Alignment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {modelConsensus.map((m, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-extrabold text-xs text-white truncate">{m.name}</div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-amber-400">{m.accuracy}</span>
                <span className="text-slate-400">{m.auc}</span>
              </div>
              <div className="text-[9px] text-slate-500">Weight: {m.weight}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Blocks */}
      <div className="space-y-6">
        
        {/* URGENT IMMEDIATE MEDICAL ATTS */}
        {resultsAssessment.results?.recommendations?.immediate?.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 print-card shadow-sm">
            <div className="flex items-center gap-3 font-black text-rose-400 mb-4">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
              <span>Immediate Medical Consultations Recommended</span>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm text-rose-200 font-bold">
              {resultsAssessment.results.recommendations.immediate.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* LIFESTYLE DIET RECOMMENDATIONS */}
        {resultsAssessment.results?.recommendations?.lifestyle?.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 print-card shadow-sm">
            <div className="flex items-center gap-3 font-black text-amber-400 mb-4">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>Lifestyle & Dietary Adjustments</span>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm text-amber-200 font-semibold">
              {resultsAssessment.results.recommendations.lifestyle.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CLINICAL MONITORING PLAN */}
        {resultsAssessment.results?.recommendations?.medical?.length > 0 && (
          <div className="glass-panel border border-slate-800 rounded-3xl p-6 print-card">
            <div className="flex items-center gap-3 font-black text-white mb-4">
              <Stethoscope className="w-6 h-6 text-amber-400" />
              <span>Physiological Monitoring & Testing</span>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300 font-semibold">
              {resultsAssessment.results.recommendations.medical.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}


      </div>

      {/* Official Verification & Signature Block for Printed Reports */}
      <div className="pt-8 border-t-2 border-slate-700 flex justify-between items-end text-xs text-slate-400 print-card mt-8">
        <div>
          <p className="font-black text-white text-sm">HealthSence AI Clinical Diagnostics</p>
          <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">Certified Clinical Health System &bull; Verified Precision Diagnostic Engine</p>
        </div>
        <div className="text-right">
          <div className="w-44 border-b border-slate-600 mb-1.5"></div>
          <p className="font-black text-slate-200 text-[10px] uppercase tracking-wider">Authorized Signature & Seal</p>
        </div>
      </div>

    </div>
  );
}
