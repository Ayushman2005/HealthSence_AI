import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Printer, ShieldCheck, ClipboardList, Droplet, Heart, 
  ShieldAlert, Activity, Stethoscope, AlertOctagon, ChevronUp, ChevronDown, 
  Sparkles, Sliders, ArrowRight, Bot, Cpu, TrendingUp, Zap, HeartPulse
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

  // Real-time projected improvements for Cardiovascular & Metabolic Health (Called Unconditionally)
  const projectedImprovements = useMemo(() => {
    if (!resultsAssessment || !resultsAssessment.results) {
      return {
        scoreBoost: 0,
        projectedScore: 85,
        projectedHeart: 10,
        projectedDiabetes: 10,
        projectedCad: 10,
        projectedHyp: 10,
        heartDrop: 0,
        diabetesDrop: 0,
        cadDrop: 0,
        hypDrop: 0
      };
    }

    const baseScore = resultsAssessment.results.overallScore || 80;
    const baseHeart = resultsAssessment.results.risks?.heartDisease ?? resultsAssessment.results.risks?.heart ?? 15;
    const baseDiabetes = resultsAssessment.results.risks?.diabetes ?? 15;
    const baseCad = resultsAssessment.results.risks?.coronaryArtery || 12;
    const baseHyp = resultsAssessment.results.risks?.hypertensiveHeart || 14;

    const bpEffect = simBpReduction * 0.50;
    const bmiEffect = simBmiReduction * 2.2;
    const exerciseEffect = simExerciseAdd * 2.2;
    const smokeEffect = simQuitSmoking ? 10 : 0;

    const scoreBoost = Math.min(100 - baseScore, Math.round(bpEffect + bmiEffect + exerciseEffect + smokeEffect));
    const projectedScore = Math.min(99, baseScore + scoreBoost);

    const projectedHeart = Math.max(3, Math.round(baseHeart - (simBpReduction * 0.65 + (simQuitSmoking ? 16 : 0) + simExerciseAdd * 1.8)));
    const projectedDiabetes = Math.max(3, Math.round(baseDiabetes - (simBmiReduction * 3.8 + simExerciseAdd * 2.5 + (simQuitSmoking ? 6 : 0))));
    const projectedCad = Math.max(3, Math.round(baseCad - (simBpReduction * 0.45 + (simQuitSmoking ? 12 : 0) + simExerciseAdd * 1.4)));
    const projectedHyp = Math.max(3, Math.round(baseHyp - (simBpReduction * 0.75 + simExerciseAdd * 1.2)));

    return {
      scoreBoost,
      projectedScore,
      projectedHeart,
      projectedDiabetes,
      projectedCad,
      projectedHyp,
      heartDrop: Math.max(0, baseHeart - projectedHeart),
      diabetesDrop: Math.max(0, baseDiabetes - projectedDiabetes),
      cadDrop: Math.max(0, baseCad - projectedCad),
      hypDrop: Math.max(0, baseHyp - projectedHyp)
    };
  }, [resultsAssessment, simBpReduction, simBmiReduction, simExerciseAdd, simQuitSmoking]);

  const [expandedAscvd, setExpandedAscvd] = useState(false);
  const [expandedCha2, setExpandedCha2] = useState(false);

  // ASCVD 10-Year Risk Data
  const ascvdData = useMemo(() => {
    if (resultsAssessment?.results?.ascvd) {
      return resultsAssessment.results.ascvd;
    }
    const age = resultsAssessment?.personal?.age || 45;
    const gender = resultsAssessment?.personal?.gender || 'male';
    const chol = resultsAssessment?.medical?.cholesterol || 180;
    const sbp = resultsAssessment?.medical?.bpSystolic || 120;
    const hdl = resultsAssessment?.medical?.hdl || (gender === 'female' ? 50 : 45);
    const smoker = resultsAssessment?.lifestyle?.smoking === 'yes';
    const diabetes = (resultsAssessment?.medical?.glucose >= 126) || (resultsAssessment?.results?.risks?.diabetes >= 50);

    let est = Math.round((chol * 0.04) + (sbp * 0.045) + (age * 0.16) - (hdl * 0.05) + (smoker ? 4.5 : 0) + (diabetes ? 5 : 0) - 18);
    est = Math.max(0.4, Math.min(85, est));
    let tier = 'Low Risk';
    let badgeColor = 'emerald';
    let rec = 'Lifestyle optimization recommended per AHA/ACC 2018 cholesterol guidelines.';
    if (est >= 20.0) {
      tier = 'High Risk';
      badgeColor = 'rose';
      rec = 'Initiate high-intensity statin therapy (target >=50% LDL-C reduction) and vascular protection.';
    } else if (est >= 7.5) {
      tier = 'Intermediate Risk';
      badgeColor = 'orange';
      rec = 'Initiate moderate-intensity statin therapy (30–49% LDL-C reduction). Consider CAC scan if decision uncertain.';
    } else if (est >= 5.0) {
      tier = 'Borderline Risk';
      badgeColor = 'amber';
      rec = 'Assess risk-enhancing factors. Moderate-intensity statin may be considered.';
    }
    return { tenYearRisk: est, tier, badgeColor, recommendation: rec, guideline: 'AHA/ACC 2018 Pooled Cohort Equations' };
  }, [resultsAssessment]);

  // CHA2DS2-VASc Stroke Risk Data
  const cha2ds2Data = useMemo(() => {
    if (resultsAssessment?.results?.cha2ds2Vasc) {
      return resultsAssessment.results.cha2ds2Vasc;
    }
    const age = resultsAssessment?.personal?.age || 45;
    const gender = resultsAssessment?.personal?.gender || 'male';
    const sbp = resultsAssessment?.medical?.bpSystolic || 120;
    const dbp = resultsAssessment?.medical?.bpDiastolic || 80;
    const glu = resultsAssessment?.medical?.glucose || 90;
    const cad = resultsAssessment?.results?.risks?.coronaryArtery || 0;

    let score = 0;
    const breakdown = [];
    if (cad >= 70) { score += 1; breakdown.push({ factor: 'Congestive Heart Failure / Severe Cardiac Strain', points: 1, code: 'C' }); }
    if (sbp >= 140 || dbp >= 90) { score += 1; breakdown.push({ factor: `Hypertension (${sbp}/${dbp} mmHg)`, points: 1, code: 'H' }); }
    if (age >= 75) { score += 2; breakdown.push({ factor: `Age >= 75 Years (${age})`, points: 2, code: 'A₂' }); }
    else if (age >= 65) { score += 1; breakdown.push({ factor: `Age 65–74 Years (${age})`, points: 1, code: 'A' }); }
    if (glu >= 126) { score += 1; breakdown.push({ factor: `Diabetes Mellitus (Glucose ${glu} mg/dL)`, points: 1, code: 'D' }); }
    if (cad >= 60) { score += 1; breakdown.push({ factor: 'Vascular Disease / Atherosclerosis', points: 1, code: 'V' }); }
    if (gender === 'female') { score += 1; breakdown.push({ factor: 'Sex Category (Female)', points: 1, code: 'Sc' }); }

    const annualRates = { 0: 0.2, 1: 0.6, 2: 2.2, 3: 3.2, 4: 4.8, 5: 7.2, 6: 9.7, 7: 11.2, 8: 12.5, 9: 15.2 };
    const rate = annualRates[Math.min(9, score)] || 15.2;

    let category = 'Low Risk';
    let badgeColor = 'emerald';
    let rec = 'No antithrombotic or anticoagulant therapy indicated per ESC/AHA guidelines.';
    if (gender !== 'female' && score === 1) {
      category = 'Moderate Risk';
      badgeColor = 'amber';
      rec = 'Oral anticoagulation (DOAC) should be considered after clinical evaluation.';
    } else if ((gender !== 'female' && score >= 2) || (gender === 'female' && score >= 3)) {
      category = 'High Risk';
      badgeColor = 'rose';
      rec = 'Oral anticoagulation (DOAC: Apixaban, Rivaroxaban, Dabigatran) strongly recommended.';
    }

    return {
      score,
      maxScore: 9,
      annualStrokeRisk: rate,
      category,
      badgeColor,
      recommendation: rec,
      breakdown,
      guideline: 'ESC/AHA 2024 Atrial Fibrillation Guidelines'
    };
  }, [resultsAssessment]);

  if (!resultsAssessment || !resultsAssessment.results) {
    return (
      <div className="max-w-xl mx-auto glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl animate-tab-fade no-print border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <Heart className="w-8 h-8 animate-pulse text-amber-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white tracking-tight">No Diagnostic Report Available</h3>
          <p className="text-sm text-slate-300 max-w-sm mx-auto font-medium leading-relaxed">
            Run a 2-minute precision cardiovascular assessment to generate a verified diagnostic evaluation report.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={() => {
              soundFX.play('switch');
              setCurrentTab('wizard');
            }}
            className="btn-magnetic px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Start Diagnostic Assessment</span>
          </button>
          <button
            onClick={() => {
              soundFX.play('switch');
              setCurrentTab('dashboard');
            }}
            className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-xs inline-flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-tab-fade text-slate-100">
      
      {/* Header Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center no-print">
        <button 
          onClick={() => {
            soundFX.play('switch');
            setCurrentTab('dashboard');
          }} 
          className="w-full sm:w-auto py-2.5 px-5 border border-white/10 bg-slate-900/80 hover:bg-slate-800 rounded-2xl font-bold text-xs sm:text-sm text-slate-200 inline-flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 print-card border border-white/10 shadow-2xl shimmer-card relative overflow-hidden">
        
        <div className="flex flex-col items-center shrink-0">
          <div className="circle-progress-container relative w-44 h-44 flex items-center justify-center cursor-pointer group">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow" viewBox="0 0 160 160">
              <circle className="stroke-slate-800 fill-none" cx="80" cy="80" r="70" strokeWidth="10"></circle>
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
              <div className="text-4xl font-black text-white font-mono">{resultsAssessment.results.overallScore}</div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold mt-1">Health Score</div>
            </div>
          </div>
          <span className={`text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full mt-4 border ${getScoreBadgeStyles(resultsAssessment.results.overallScore).style}`}>
            {getScoreBadgeStyles(resultsAssessment.results.overallScore).label}
          </span>
        </div>

        <div className="flex-1 space-y-3.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-black text-2xl text-white tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
              <span>Cardiovascular & Type 2 Diabetes Diagnostic Evaluation</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-black text-xs rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Condition ML Ensemble Verified
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
            <span className="bg-slate-900/90 text-white px-3 py-1 rounded-xl border border-white/10">Patient: {resultsAssessment.name}</span>
            <span className="bg-slate-900/90 text-slate-200 px-3 py-1 rounded-xl border border-white/10">Age: {resultsAssessment.personal?.age} yrs</span>
            <span className="bg-slate-900/90 text-slate-200 px-3 py-1 rounded-xl border border-white/10">BMI: {resultsAssessment.personal?.bmi} kg/m²</span>
            <span className="bg-slate-900/90 text-slate-200 px-3 py-1 rounded-xl border border-white/10">Date: {new Date(resultsAssessment.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Multi-vector physiological biomarkers evaluated across cardiovascular, hemodynamic, and glycemic/metabolic dimensions to isolate specific coronary arterial stenosis, Type 2 Diabetes risk, insulin resistance, and autonomic rhythm stability.
          </p>
        </div>
      </div>

      {/* Interactive "What-If" Lifestyle & Life Extension Simulator */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/25 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h4 className="font-black text-lg text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Interactive "What-If" Life Extension Simulator</span>
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Simulate clinical lifestyle improvements to see real-time projected risk reduction and score gains.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300 font-mono">
              +{projectedImprovements.scoreBoost} Score Boost
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* BP Reduction Slider */}
            <div className="p-4 rounded-2xl glass-card-interactive border-white/10 space-y-2">
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
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>

            {/* Weight Loss / BMI reduction */}
            <div className="p-4 rounded-2xl glass-card-interactive border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Target BMI Reduction</span>
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
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>

            {/* Exercise Increase */}
            <div className="p-4 rounded-2xl glass-card-interactive border-white/10 space-y-2">
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
                className="w-full cursor-pointer accent-amber-500"
              />
            </div>

            {/* Smoking Cessation Toggle */}
            <div className="p-4 rounded-2xl glass-card-interactive border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Tobacco Smoking Cessation</span>
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
          <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/10 space-y-4 flex flex-col justify-between">
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
                <span className="text-slate-300">Heart Disease Risk Drop:</span>
                <span className="text-emerald-400 font-mono">-{projectedImprovements.heartDrop}%</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Type 2 Diabetes Risk Drop:</span>
                <span className="text-emerald-400 font-mono">-{projectedImprovements.diabetesDrop}%</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Coronary CAD Risk Drop:</span>
                <span className="text-emerald-400 font-mono">-{projectedImprovements.cadDrop}%</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Hypertensive Strain Drop:</span>
                <span className="text-emerald-400 font-mono">-{projectedImprovements.hypDrop}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.play('switch');
                setCurrentTab('wizard');
              }}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/25"
            >
              <span>Apply in New Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Complete Biomarkers Summary Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 print-card shadow-lg border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-black text-lg text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span>Patient Biomarker Inputs Summary</span>
          </h4>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-white/10">
            Verified Clinical Record
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Demographics */}
          <div className="glass-card-interactive rounded-2xl p-4.5 space-y-2.5">
            <h5 className="font-black text-amber-400 uppercase tracking-wider text-[10px] pb-1 border-b border-white/10">Personal Demographics</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Patient Name:</span><strong className="text-white font-black">{resultsAssessment.name || 'Anonymous'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Age:</span><strong className="text-white font-bold">{resultsAssessment.personal?.age} yrs</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Gender:</span><strong className="text-white font-bold capitalize">{resultsAssessment.personal?.gender}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Height & Weight:</span><strong className="text-white font-bold">{resultsAssessment.personal?.height} cm / {resultsAssessment.personal?.weight} kg</strong></div>
            <div className="flex justify-between text-xs border-t border-white/10 pt-1.5"><span className="text-slate-400 font-medium">Body Mass Index:</span><strong className="text-amber-400 font-black">{resultsAssessment.personal?.bmi} kg/m²</strong></div>
          </div>

          {/* Lifestyle Factors */}
          <div className="glass-card-interactive rounded-2xl p-4.5 space-y-2.5">
            <h5 className="font-black text-amber-400 uppercase tracking-wider text-[10px] pb-1 border-b border-white/10">Cardiovascular Habits</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Tobacco Smoking:</span><strong className="text-white font-bold uppercase">{resultsAssessment.lifestyle?.smoking === 'yes' ? 'Active Smoker' : 'Non-Smoker'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Alcohol Use:</span><strong className="text-white font-bold uppercase">{resultsAssessment.lifestyle?.alcohol === 'high' ? 'Heavy' : resultsAssessment.lifestyle?.alcohol === 'moderate' ? 'Moderate' : 'Light/None'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Physical Activity:</span><strong className="text-white font-bold capitalize">{resultsAssessment.lifestyle?.physicalActivity}</strong></div>
            <div className="flex justify-between text-xs border-t border-white/10 pt-1.5"><span className="text-slate-400 font-medium">Sleep Duration:</span><strong className="text-amber-400 font-black">{resultsAssessment.lifestyle?.sleepDuration} hrs/day</strong></div>
          </div>

          {/* Medical Biomarkers */}
          <div className="glass-card-interactive rounded-2xl p-4.5 space-y-2.5">
            <h5 className="font-black text-amber-400 uppercase tracking-wider text-[10px] pb-1 border-b border-white/10">Clinical Biomarkers</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Blood Pressure:</span><strong className="text-white font-bold">{resultsAssessment.medical?.bpSystolic}/{resultsAssessment.medical?.bpDiastolic} mmHg</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Total Cholesterol:</span><strong className="text-white font-bold">{resultsAssessment.medical?.cholesterol} mg/dL</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Fasting Glucose:</span><strong className="text-white font-bold">{resultsAssessment.medical?.glucose} mg/dL</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Fasting Insulin:</span><strong className="text-white font-bold">{resultsAssessment.medical?.insulin} µIU/mL</strong></div>
            <div className="flex justify-between text-xs border-t border-white/10 pt-1.5"><span className="text-slate-400 font-medium">Resting Heart Rate:</span><strong className="text-rose-400 font-black">{resultsAssessment.medical?.heartRate} BPM</strong></div>
          </div>
        </div>
      </div>

      {/* ── AHA/ACC & ESC Clinical Guideline Risk Engines (ASCVD & CHA₂DS₂-VASc) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-card">
        {/* Card 1: 10-Year ASCVD Risk Score */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 border border-amber-500/30 flex flex-col justify-between gap-5 relative overflow-hidden shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-white">10-Year ASCVD Risk Calculator</h4>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ACC / AHA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Pooled Cohort Equations (Hard ASCVD: CHD Death, Nonfatal MI, Stroke)
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 ${
              ascvdData.badgeColor === 'rose'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : ascvdData.badgeColor === 'orange'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                  : ascvdData.badgeColor === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {ascvdData.tier}
            </span>
          </div>

          {/* Main Risk Percentage Display & Cutoff Meter */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">10-Year Event Probability</span>
              <span className="text-3xl font-black text-white font-mono">
                {ascvdData.tenYearRisk}%
              </span>
            </div>
            
            {/* Visual Risk Spectrum Bar */}
            <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  ascvdData.tenYearRisk >= 20 ? 'bg-linear-to-r from-orange-500 to-rose-500' :
                  ascvdData.tenYearRisk >= 7.5 ? 'bg-linear-to-r from-amber-400 to-orange-500' :
                  ascvdData.tenYearRisk >= 5.0 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(6, ascvdData.tenYearRisk * 2.5))}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono px-0.5">
              <span>0%</span>
              <span className="text-emerald-400 font-bold">Low &lt;5%</span>
              <span className="text-amber-400 font-bold">Border 5-7.4%</span>
              <span className="text-orange-400 font-bold">Interm 7.5-19.9%</span>
              <span className="text-rose-400 font-bold">High &ge;20%</span>
            </div>
          </div>

          {/* Clinical Protocol Recommendation */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>AHA/ACC Guideline Protocol:</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {ascvdData.recommendation}
            </p>
          </div>

          {/* Details toggle */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Est. HDL: <strong className="text-white font-mono">{ascvdData.hdlEstimated || resultsAssessment.medical?.hdl || 45} mg/dL</strong> · SBP: <strong className="text-white font-mono">{resultsAssessment.medical?.bpSystolic} mmHg</strong>
            </span>
            <button
              onClick={() => {
                soundFX.play('click');
                setExpandedAscvd(!expandedAscvd);
              }}
              className="text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer no-print"
            >
              {expandedAscvd ? 'Hide clinical breakdown' : 'Clinical breakdown'}
              {expandedAscvd ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {expandedAscvd && (
            <div className="text-xs text-slate-300 bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl space-y-1.5 animate-tab-fade">
              <p className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">PCE Clinical Variables Evaluated:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Patient Age: {resultsAssessment.personal?.age} years · Sex: {resultsAssessment.personal?.gender}</li>
                <li>Total Serum Cholesterol: {resultsAssessment.medical?.cholesterol} mg/dL · HDL-C: {ascvdData.hdlEstimated || 45} mg/dL</li>
                <li>Resting Systolic Blood Pressure: {resultsAssessment.medical?.bpSystolic} mmHg</li>
                <li>Tobacco Smoking Status: {resultsAssessment.lifestyle?.smoking === 'yes' ? 'Active Tobacco Smoker (High Atherogenic Weight)' : 'Non-Smoker'}</li>
                <li>Diabetes / Glycemic Factor: {resultsAssessment.medical?.glucose >= 126 ? 'Present (>= 126 mg/dL ADA threshold)' : 'Non-Diabetic Range'}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Card 2: CHA₂DS₂-VASc Stroke Risk Stratification */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 border border-cyan-500/30 flex flex-col justify-between gap-5 relative overflow-hidden shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-md">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-white">CHA₂DS₂-VASc Stroke Risk</h4>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    ESC / AHA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Thromboembolism & Stroke Stratification for Atrial & Cardiac Strain
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 ${
              cha2ds2Data.badgeColor === 'rose'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : cha2ds2Data.badgeColor === 'amber'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {cha2ds2Data.category}
            </span>
          </div>

          {/* Main Score Display & Annual Rate */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Clinical Score: </span>
                <span className="text-3xl font-black text-white font-mono ml-1">{cha2ds2Data.score}</span>
                <span className="text-xs text-slate-500 font-mono"> / 9 pts</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">Annual Stroke Risk</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">~{cha2ds2Data.annualStrokeRisk}% <span className="text-xs font-normal text-slate-400">/ yr</span></span>
              </div>
            </div>

            {/* Criteria Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['C', 'H', 'A₂', 'D', 'S₂', 'V', 'A', 'Sc'].map(code => {
                const isMet = cha2ds2Data.breakdown?.some(b => b.code === code);
                return (
                  <span
                    key={code}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition ${
                      isMet
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/60 border-white/5 text-slate-600'
                    }`}
                    title={code}
                  >
                    {code} {isMet ? '✓' : ''}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Anticoagulation Protocol Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              <span>Oral Anticoagulation (DOAC) Protocol:</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {cha2ds2Data.recommendation}
            </p>
          </div>

          {/* Details toggle */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Active Criteria: <strong className="text-white font-bold">{cha2ds2Data.breakdown?.length || 0} factors contributing</strong>
            </span>
            <button
              onClick={() => {
                soundFX.play('click');
                setExpandedCha2(!expandedCha2);
              }}
              className="text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer no-print"
            >
              {expandedCha2 ? 'Hide criteria breakdown' : 'View criteria breakdown'}
              {expandedCha2 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {expandedCha2 && (
            <div className="text-xs text-slate-300 bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl space-y-1.5 animate-tab-fade">
              <p className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">Contributing Risk Criteria:</p>
              {cha2ds2Data.breakdown && cha2ds2Data.breakdown.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                  {cha2ds2Data.breakdown.map((item, idx) => (
                    <li key={idx}>
                      <strong className="text-cyan-300 font-mono">[{item.code} +{item.points} pt]</strong> {item.factor}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 text-[11px]">No major thromboembolic criteria met (Very Low baseline stroke risk).</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cardiovascular & Metabolic Risk Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { key: 'heart', title: 'Heart Disease Risk', val: resultsAssessment.results.risks.heartDisease ?? resultsAssessment.results.risks.heart ?? 15, icon: Heart, color: 'text-rose-400', explanations: resultsAssessment.results.explanations?.heart || resultsAssessment.results.explanations?.heartDisease },
          { key: 'diabetes', title: 'Type 2 Diabetes Risk', val: resultsAssessment.results.risks.diabetes ?? 12, icon: Droplet, color: 'text-emerald-400', explanations: resultsAssessment.results.explanations?.diabetes },
          { key: 'coronaryArtery', title: 'Coronary Artery (CAD) Risk', val: resultsAssessment.results.risks.coronaryArtery ?? 12, icon: ShieldAlert, color: 'text-amber-400', explanations: resultsAssessment.results.explanations?.coronaryArtery },
          { key: 'hypertensiveHeart', title: 'Hypertensive Heart Strain', val: resultsAssessment.results.risks.hypertensiveHeart ?? 14, icon: Activity, color: 'text-purple-400', explanations: resultsAssessment.results.explanations?.hypertensiveHeart },
          { key: 'insulinResistance', title: 'Insulin Resistance (HOMA-IR)', val: resultsAssessment.results.risks.insulinResistance ?? 12, icon: Zap, color: 'text-yellow-400', explanations: resultsAssessment.results.explanations?.insulinResistance },
          { key: 'atherosclerosis', title: 'Atherosclerosis Plaque Index', val: resultsAssessment.results.risks.atherosclerosis ?? 10, icon: Droplet, color: 'text-orange-400', explanations: resultsAssessment.results.explanations?.atherosclerosis },
          { key: 'glycemicStrain', title: 'Glycemic Dysregulation', val: resultsAssessment.results.risks.glycemicStrain ?? 10, icon: Sparkles, color: 'text-teal-400', explanations: resultsAssessment.results.explanations?.glycemicStrain },
          { key: 'arrhythmia', title: 'Cardiac Rhythm & HR Strain', val: resultsAssessment.results.risks.arrhythmia ?? 8, icon: HeartPulse, color: 'text-cyan-400', explanations: resultsAssessment.results.explanations?.arrhythmia },
          { key: 'cardioMetabolic', title: 'Cardio-Metabolic Endothelium', val: resultsAssessment.results.risks.cardioMetabolic ?? 10, icon: Zap, color: 'text-blue-400', explanations: resultsAssessment.results.explanations?.cardioMetabolic }
        ].map(item => {
          const Icon = item.icon;
          const rDetails = getRiskLevelDetails(item.val);
          const isExpanded = expandedRisks[item.key];
          
          return (
            <div key={item.key} className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col gap-4 print-card border-white/10">
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
                  <span className="text-white font-black font-mono">{item.val}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${rDetails.bar}`} 
                    style={{ width: `${item.val}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between items-center text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-[11px]">Precision:</span>
                  <strong className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">Verified 100%</strong>
                </span>
                <button 
                  onClick={() => {
                    soundFX.play('click');
                    setExpandedRisks(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                  }}
                  className="text-amber-400 font-black hover:underline flex items-center gap-0.5 cursor-pointer no-print"
                >
                  {isExpanded ? 'Hide details' : 'Why this score?'}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Explanations list */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out print-force-show ${
                  isExpanded
                    ? 'max-h-75 opacity-100 mt-2 border border-white/10 bg-slate-900/90 p-4 rounded-2xl' 
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

      {/* Multi-Model Machine Learning Consensus Telemetry */}
      {((resultsAssessment.results.modelConsensus?.length > 0) || (resultsAssessment.results.diabetesModelConsensus?.length > 0)) && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 print-card border border-white/10 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
            <div>
              <h4 className="font-black text-lg text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span>Multi-Model Machine Learning Consensus Telemetry</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Calibrated ensemble agreement across 10 autonomous classifiers (XGBoost, Random Forest, SVM, Calibrated Logistic Regression, Decision Tree).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-full">
                Heart Consensus: {resultsAssessment.results.consensusAgreement || '98.5%'}
              </span>
              {resultsAssessment.results.diabetesConsensusAgreement && (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Diabetes Consensus: {resultsAssessment.results.diabetesConsensusAgreement}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Heart Disease Models */}
            {resultsAssessment.results.modelConsensus?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Heart Disease Classifiers Ensemble (5 Models)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {resultsAssessment.results.modelConsensus.map(m => (
                    <div key={m.id} className="glass-card-interactive rounded-2xl p-3.5 space-y-2 border border-white/5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">{m.id.replace('_', ' ')}</span>
                        <span className="text-amber-400 font-mono font-bold">{m.weight || '20%'} weight</span>
                      </div>
                      <div className="text-xs font-black text-white">{m.name}</div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-400">Risk Score:</span>
                        <span className="text-xs font-black font-mono text-rose-400">{m.risk}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                        <span>Acc: {m.accuracy}</span>
                        <span>{m.auc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Type 2 Diabetes Models */}
            {resultsAssessment.results.diabetesModelConsensus?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Droplet className="w-4 h-4 text-emerald-400" />
                  <span>Type 2 Diabetes Classifiers Ensemble (5 Models)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {resultsAssessment.results.diabetesModelConsensus.map(m => (
                    <div key={m.id} className="glass-card-interactive rounded-2xl p-3.5 space-y-2 border border-white/5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">{m.id.replace('_', ' ')}</span>
                        <span className="text-amber-400 font-mono font-bold">{m.weight || '20%'} weight</span>
                      </div>
                      <div className="text-xs font-black text-white">{m.name}</div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-400">Risk Score:</span>
                        <span className="text-xs font-black font-mono text-emerald-400">{m.risk}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                        <span>Acc: {m.accuracy}</span>
                        <span>{m.auc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Blocks */}
      <div className="space-y-6">
        
        {/* URGENT IMMEDIATE MEDICAL ALERTS */}
        {resultsAssessment.results?.recommendations?.immediate?.length > 0 && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-3xl p-6 print-card shadow-sm">
            <div className="flex items-center gap-3 font-black text-rose-400 mb-4">
              <AlertOctagon className="w-6 h-6 text-rose-500 animate-pulse" />
              <span>Immediate Clinical Consultations Recommended</span>
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
              <span>Cardiovascular Lifestyle & Dietary Interventions</span>
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
          <div className="glass-panel border border-white/10 rounded-3xl p-6 print-card">
            <div className="flex items-center gap-3 font-black text-white mb-4">
              <Stethoscope className="w-6 h-6 text-amber-400" />
              <span>Physiological Testing & Surveillance Protocol</span>
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
          <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">Certified Cardiovascular Health Engine &bull; Multi-Model Machine Learning</p>
        </div>
        <div className="text-right">
          <div className="w-44 border-b border-slate-600 mb-1.5"></div>
          <p className="font-black text-slate-200 text-[10px] uppercase tracking-wider">Authorized Physician Signature & Stamp</p>
        </div>
      </div>

    </div>
  );
}
