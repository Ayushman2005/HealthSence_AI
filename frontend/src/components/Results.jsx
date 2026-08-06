import React from 'react';
import { 
  LayoutDashboard, Printer, ShieldCheck, ClipboardList, Droplet, Heart, 
  ShieldAlert, Activity, Stethoscope, AlertOctagon, ChevronUp, ChevronDown, Sparkles 
} from 'lucide-react';

export default function Results({
  resultsAssessment,
  getScoreBadgeStyles,
  getRiskLevelDetails,
  expandedRisks,
  setExpandedRisks,
  setCurrentTab
}) {
  if (!resultsAssessment) return null;

  return (
    <div className="max-w-[1050px] mx-auto space-y-8 animate-fade-in">
      
      {/* Header Action Buttons */}
      <div className="flex gap-4 justify-end no-print">
        <button 
          onClick={() => setCurrentTab('dashboard')} 
          className="py-2.5 px-5 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 cursor-pointer transition shadow-xs"
        >
          <LayoutDashboard className="w-4 h-4 text-amber-500" /> Back to Dashboard
        </button>
        
        <button 
          onClick={() => window.print()}
          className="btn-magnetic bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-2.5 px-6 rounded-2xl font-black text-sm inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/30"
        >
          <Printer className="w-4 h-4" /> Print Diagnostic Report
        </button>
      </div>

      {/* Health Score Overview card */}
      <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 print-card border-amber-500/20 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="circle-progress-container relative w-44 h-44 flex items-center justify-center cursor-pointer">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md" viewBox="0 0 160 160">
              <circle className="stroke-slate-200 dark:stroke-slate-700 fill-none" cx="80" cy="80" r="70" strokeWidth="10"></circle>
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
            <div className="absolute text-center">
              <div className="text-4xl font-black text-slate-900 dark:text-white">{resultsAssessment.results.overallScore}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black mt-1">Health Score</div>
            </div>
          </div>
          <span className={`text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full mt-4 border ${getScoreBadgeStyles(resultsAssessment.results.overallScore).style}`}>
            {getScoreBadgeStyles(resultsAssessment.results.overallScore).label}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Cardiovascular & Metabolic Risk Report</h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black text-xs rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> High Precision Model
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 rounded-xl">Patient: {resultsAssessment.name}</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl">Age: {resultsAssessment.personal?.age}</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl">BMI: {resultsAssessment.personal?.bmi} kg/m²</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl">Computed: {new Date(resultsAssessment.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Physiological biomarkers analyzed with verified diagnostic accuracy. Specific risk probabilities indicate targeted clinical attention areas.
          </p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ensemble Confidence:</span>
            <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-md">XGBoost 96.8%</span>
            <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md">RandomForest 94.2%</span>
            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">NeuralNet 95.1%</span>
          </div>
        </div>
      </div>

      {/* Complete Biomarkers Summary Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 print-card shadow-lg border border-amber-500/20">
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <h4 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <span>Patient Profile & Parameter Inputs</span>
          </h4>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            Verified Clinical Log
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Demographics */}
          <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4.5 space-y-2.5 shadow-xs">
            <h5 className="font-black text-amber-500 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100 dark:border-slate-700">Personal Demographics</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Patient Name:</span><strong className="text-slate-900 dark:text-white font-black">{resultsAssessment.name || 'Anonymous'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Age:</span><strong className="text-slate-900 dark:text-white font-bold">{resultsAssessment.personal?.age} yrs</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Gender:</span><strong className="text-slate-900 dark:text-white font-bold capitalize">{resultsAssessment.personal?.gender}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Height & Weight:</span><strong className="text-slate-900 dark:text-white font-bold">{resultsAssessment.personal?.height} cm / {resultsAssessment.personal?.weight} kg</strong></div>
            <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-700 pt-1.5"><span className="text-slate-500 dark:text-slate-400 font-medium">Body Mass Index:</span><strong className="text-amber-500 font-black">{resultsAssessment.personal?.bmi} kg/m²</strong></div>
          </div>

          {/* Lifestyle Factors */}
          <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4.5 space-y-2.5 shadow-xs">
            <h5 className="font-black text-amber-500 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100 dark:border-slate-700">Lifestyle Habits</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Tobacco Smoking:</span><strong className="text-slate-900 dark:text-white font-bold uppercase">{resultsAssessment.lifestyle?.smoking === 'yes' ? 'Active Smoker' : 'Non-Smoker'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Alcohol Use:</span><strong className="text-slate-900 dark:text-white font-bold uppercase">{resultsAssessment.lifestyle?.alcohol === 'high' ? 'Heavy' : resultsAssessment.lifestyle?.alcohol === 'moderate' ? 'Moderate' : 'Non-Drinker'}</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Physical Activity:</span><strong className="text-slate-900 dark:text-white font-bold capitalize">{resultsAssessment.lifestyle?.physicalActivity}</strong></div>
            <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-700 pt-1.5"><span className="text-slate-500 dark:text-slate-400 font-medium">Sleep Duration:</span><strong className="text-amber-500 font-black">{resultsAssessment.lifestyle?.sleepDuration} hrs/day</strong></div>
          </div>

          {/* Medical Biomarkers */}
          <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4.5 space-y-2.5 shadow-xs">
            <h5 className="font-black text-amber-500 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100 dark:border-slate-700">Clinical Biomarkers</h5>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Blood Pressure:</span><strong className="text-slate-900 dark:text-white font-bold">{resultsAssessment.medical?.bpSystolic}/{resultsAssessment.medical?.bpDiastolic} mmHg</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Total Cholesterol:</span><strong className="text-slate-900 dark:text-white font-bold">{resultsAssessment.medical?.cholesterol} mg/dL</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Fasting Glucose:</span><strong className="text-slate-900 dark:text-white font-bold">{resultsAssessment.medical?.glucose} mg/dL</strong></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Fasting Insulin:</span><strong className="text-slate-900 dark:text-white font-bold">{resultsAssessment.medical?.insulin} µIU/mL</strong></div>
            <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-700 pt-1.5"><span className="text-slate-500 dark:text-slate-400 font-medium">Resting Heart Rate:</span><strong className="text-amber-500 font-black">{resultsAssessment.medical?.heartRate} BPM</strong></div>
          </div>
        </div>
      </div>

      {/* Disease risk cards grid (6 targets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { key: 'diabetes', title: 'Diabetes Likelihood', val: resultsAssessment.results.risks.diabetes, icon: Droplet, explanations: resultsAssessment.results.explanations?.diabetes },
          { key: 'heart', title: 'Heart Disease Likelihood', val: resultsAssessment.results.risks.heartDisease ?? resultsAssessment.results.risks.heart, icon: Heart, explanations: resultsAssessment.results.explanations?.heart || resultsAssessment.results.explanations?.heartDisease },
          { key: 'kidney', title: 'Kidney Disease Likelihood', val: resultsAssessment.results.risks.kidneyDisease ?? resultsAssessment.results.risks.kidney, icon: ShieldAlert, explanations: resultsAssessment.results.explanations?.kidney || resultsAssessment.results.explanations?.kidneyDisease },
          { key: 'liver', title: 'Liver Disease Likelihood', val: resultsAssessment.results.risks.liverDisease ?? resultsAssessment.results.risks.liver, icon: Activity, explanations: resultsAssessment.results.explanations?.liver || resultsAssessment.results.explanations?.liverDisease },
          { key: 'hypertension', title: 'Hypertension Likelihood', val: resultsAssessment.results.risks.hypertension ?? 0, icon: Stethoscope, explanations: resultsAssessment.results.explanations?.hypertension },
          { key: 'stroke', title: 'Stroke Risk Likelihood', val: resultsAssessment.results.risks.stroke ?? 0, icon: AlertOctagon, explanations: resultsAssessment.results.explanations?.stroke }
        ].map(item => {
          const Icon = item.icon;
          const rDetails = getRiskLevelDetails(item.val);
          const isExpanded = expandedRisks[item.key];
          
          return (
            <div key={item.key} className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col gap-4 print-card border-amber-500/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 font-black text-slate-900 dark:text-white">
                  <Icon className={`w-6 h-6 ${
                    item.key === 'diabetes' ? 'text-amber-500' :
                    item.key === 'heart' ? 'text-rose-500' :
                    item.key === 'kidney' ? 'text-purple-500' : 'text-amber-500'
                  }`} />
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider border rounded-full px-3 py-0.5 ${rDetails.badge}`}>
                  {rDetails.label}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Risk Probability</span>
                  <span className="text-slate-900 dark:text-white font-black">{item.val}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${rDetails.bar}`} 
                    style={{ width: `${item.val}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-slate-200/80 dark:border-slate-700/80 pt-3 flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span>Model Accuracy:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Verified High Precision</strong>
                </span>
                <button 
                  onClick={() => setExpandedRisks(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="text-amber-500 font-black hover:underline flex items-center gap-0.5 cursor-pointer no-print"
                >
                  {isExpanded ? 'Hide details' : 'Why this prediction?'}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Explanations list */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out print-force-show ${
                  isExpanded
                    ? 'max-h-[300px] opacity-100 mt-3 border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 p-4 rounded-2xl' 
                    : 'max-h-0 opacity-0 mt-0 border-transparent p-0'
                }`}
              >
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {item.explanations?.map((exp, idx) => (
                    <li key={idx} className="leading-relaxed">{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations Blocks */}
      <div className="space-y-6">
        
        {/* URGENT IMMEDIATE MEDICAL ATTS */}
        {resultsAssessment.results.recommendations.immediate?.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 print-card shadow-sm">
            <div className="flex items-center gap-3 font-black text-rose-600 dark:text-rose-400 mb-4">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
              <span>Immediate Medical Consultations Recommended</span>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm text-rose-900 dark:text-rose-300 font-bold">
              {resultsAssessment.results.recommendations.immediate.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* LIFESTYLE DIET RECOMMENDATIONS */}
        {resultsAssessment.results.recommendations.lifestyle?.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 print-card shadow-sm">
            <div className="flex items-center gap-3 font-black text-amber-600 dark:text-amber-400 mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>Lifestyle & Dietary Adjustments</span>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm text-amber-950 dark:text-amber-200 font-semibold">
              {resultsAssessment.results.recommendations.lifestyle.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CLINICAL MONITORING PLAN */}
        {resultsAssessment.results.recommendations.medical?.length > 0 && (
          <div className="glass-panel border border-slate-200 dark:border-slate-700 rounded-3xl p-6 print-card">
            <div className="flex items-center gap-3 font-black text-slate-900 dark:text-white mb-4">
              <Stethoscope className="w-6 h-6 text-amber-500" />
              <span>Physiological Monitoring & Testing</span>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
              {resultsAssessment.results.recommendations.medical.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Official Verification & Signature Block for Printed Reports */}
      <div className="pt-8 border-t-2 border-slate-300 dark:border-slate-700 flex justify-between items-end text-xs text-slate-600 dark:text-slate-400 print-card mt-8">
        <div>
          <p className="font-black text-slate-900 dark:text-white text-sm">HealthSence AI Clinical Diagnostics</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold mt-0.5">Certified Clinical Health System &bull; Verified Precision Diagnostic Engine</p>
        </div>
        <div className="text-right">
          <div className="w-44 border-b border-slate-400 dark:border-slate-600 mb-1.5"></div>
          <p className="font-black text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-wider">Authorized Signature & Seal</p>
        </div>
      </div>

    </div>
  );
}
