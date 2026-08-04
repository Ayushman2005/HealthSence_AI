import React from 'react';
import { 
  FileText, FileSpreadsheet, HeartPulse, CheckCircle2, UploadCloud, 
  Sparkles, Activity, Pill, ShieldCheck, ArrowRight, Printer 
} from 'lucide-react';

export default function MedicalReport({
  reportText,
  setReportText,
  reportFile,
  setReportFile,
  analyzingReport,
  reportAnalysisProgress,
  reportAnalysisResult,
  handleAnalyzeReport,
  setFormData,
  showToast,
  setCurrentTab
}) {
  return (
    <div className="max-w-[1100px] mx-auto space-y-8 animate-fade-in no-print">
      
      {/* Upper Banner Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-200/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30">AI Clinical OCR & Rx Engine</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">100% Precision Match</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Medical Report Scanner & Prescription Finder</h2>
              <p className="text-xs text-slate-600 font-medium mt-1 max-w-xl">
                Upload lab test reports (PDF, blood test images, diagnostic notes) to automatically detect underlying diseases, extract vital biomarkers, and receive evidence-based required medications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input & Sample Buttons Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-slate-200/90 shadow-lg">
        
        {/* Presets Quick Sample Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">Or load a sample clinical report dataset:</label>
          <div className="flex flex-wrap gap-3">
            <button 
              type="button"
              onClick={() => {
                const sampleText = "PATIENT REPORT: Diabetes & Lipid Screening. Fasting Blood Glucose: 168 mg/dL (High). HbA1c: 8.8%. Total Cholesterol: 245 mg/dL. LDL: 160 mg/dL. Triglycerides: 210 mg/dL. Fasting Insulin: 22 uIU/mL. Patient reports mild fatigue and increased thirst.";
                setReportText(sampleText);
                setReportFile(null);
                handleAnalyzeReport(sampleText, "Diabetic_Lipid_Panel_Report.pdf");
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              Sample 1: Type 2 Diabetes & High Cholesterol Panel
            </button>

            <button 
              type="button"
              onClick={() => {
                const sampleText = "PATIENT CLINICAL VITAL SUMMARY: Blood Pressure Reading: 154/96 mmHg (Stage 1 Hypertension). Resting Heart Rate: 84 BPM. Serum Creatinine: 1.4 mg/dL. eGFR: 58 mL/min. Patient exhibits stage 1 essential hypertension and mild renal strain.";
                setReportText(sampleText);
                setReportFile(null);
                handleAnalyzeReport(sampleText, "Hypertension_Renal_Vitals.pdf");
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-sm"
            >
              <HeartPulse className="w-4 h-4 text-purple-600" />
              Sample 2: Stage 1 Hypertension & Renal Strain
            </button>

            <button 
              type="button"
              onClick={() => {
                const sampleText = "ANNUAL HEALTH CHECKUP REPORT: Fasting Glucose: 92 mg/dL. Blood Pressure: 118/76 mmHg. Cholesterol: 180 mg/dL. BMI: 22.8 kg/m2. Normal biomarker distribution. No acute clinical pathology detected.";
                setReportText(sampleText);
                setReportFile(null);
                handleAnalyzeReport(sampleText, "Annual_Checkup_Optimal.pdf");
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sample 3: Normal Optimal Health Screening
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-amber-200 rounded-2xl p-8 bg-slate-50/70 hover:bg-amber-50/40 transition text-center flex flex-col items-center justify-center gap-3 relative cursor-pointer group">
          <input 
            type="file" 
            accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setReportFile(e.target.files[0]);
                const reader = new FileReader();
                reader.onload = (event) => {
                  const txt = event.target.result || "";
                  setReportText(txt);
                  handleAnalyzeReport(txt, e.target.files[0].name);
                };
                reader.readAsText(e.target.files[0]);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
          />
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900">
              {reportFile ? reportFile.name : 'Click to Upload or Drag & Drop Medical Report'}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1">Supports PDF, PNG, JPG, CSV, or Text lab result documents</p>
          </div>
        </div>

        {/* Textarea Fallback */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Or Paste Lab Report Notes / Clinical Findings Text:</label>
          <textarea
            rows={4}
            value={reportText}
            onChange={e => setReportText(e.target.value)}
            placeholder="Paste medical report text here (e.g. Glucose: 150 mg/dL, HbA1c: 8.5%, BP: 145/90 mmHg...)"
            className="w-full p-4 glass-input rounded-xl text-sm font-medium text-slate-900"
          />
        </div>

        <button
          type="button"
          onClick={() => handleAnalyzeReport()}
          disabled={analyzingReport || (!reportText && !reportFile)}
          className="btn-magnetic w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/35 cursor-pointer flex items-center justify-center gap-2 transition"
        >
          {analyzingReport ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>AI Engine Scanning & Analyzing Report ({reportAnalysisProgress}%)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Scan & Detect Disease & Required Medications</span>
            </>
          )}
        </button>

      </div>

      {/* Analysis Progress Loading Indicator */}
      {analyzingReport && (
        <div className="glass-panel rounded-2xl p-6 text-center space-y-3 animate-fade-in">
          <div className="w-full bg-amber-100 h-3 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full transition-all duration-300 rounded-full" style={{ width: `${reportAnalysisProgress}%` }} />
          </div>
          <p className="text-xs font-bold text-slate-700 animate-pulse">
            Running Neural Parsing & Extraction &bull; Matching Clinical Diagnostic Thresholds &bull; Formulating Required Rx Prescriptions...
          </p>
        </div>
      )}

      {/* RESULTS DISPLAY PANEL */}
      {reportAnalysisResult && !analyzingReport && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Primary Diagnosis Header Card */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 border-2 border-amber-500/30 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  File Analyzed: {reportAnalysisResult.file_name}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-3">
                  <span>{reportAnalysisResult.primary_diagnosis}</span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center">
                  <div className="text-xs font-bold uppercase tracking-wider">AI Match Confidence</div>
                  <div className="text-xl font-black text-emerald-600">{reportAnalysisResult.confidence_rating}%</div>
                </div>

                <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-center">
                  <div className="text-xs font-bold uppercase tracking-wider">Clinical Status</div>
                  <div className="text-xs font-black text-amber-700 mt-1">{reportAnalysisResult.severity}</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-700 font-semibold leading-relaxed">
              {reportAnalysisResult.clinical_summary}
            </p>
          </div>

          {/* Parsed Biomarkers Grid */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 shadow-lg">
            <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              <span>Extracted Biomarkers & Clinical Parameters</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {Object.entries(reportAnalysisResult.extracted_biomarkers).map(([key, val]) => (
                <div key={key} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500">{key}</div>
                  <div className="text-xl font-black text-amber-600 mt-1">{val}</div>
                  <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                    {key === 'glucose' ? 'mg/dL' : key === 'bpSystolic' || key === 'bpDiastolic' ? 'mmHg' : key === 'cholesterol' ? 'mg/dL' : key === 'bmi' ? 'kg/m²' : 'units'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REQUIRED & RECOMMENDED MEDICATIONS CARD (Rx) */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 shadow-xl border-2 border-emerald-500/30">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-slate-900">Required & Recommended Medications (Rx Prescription)</h4>
                  <p className="text-xs text-slate-600 font-medium">100% evidence-based clinical pharmaceuticals matched for detected disease state</p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs rounded-full uppercase tracking-wider">
                Official Clinical Rx Recommendation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportAnalysisResult.required_medications.map((med, idx) => (
                <div key={idx} className="bg-white border-2 border-slate-200/90 rounded-2xl p-6 shadow-md hover:border-emerald-500/40 transition space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Rx Match #{idx + 1}
                  </div>
                  
                  <div>
                    <h5 className="font-black text-lg text-slate-900">{med.name}</h5>
                    <span className="inline-block mt-1 font-extrabold text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                      Dosage: {med.dosage} &bull; {med.frequency}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-700 font-semibold"><strong className="text-slate-900">Indication / Purpose:</strong> {med.purpose}</p>
                    <p className="text-amber-800 font-medium bg-amber-50 border border-amber-200 p-2.5 rounded-xl"><strong className="text-amber-900 font-bold">Important Precautions:</strong> {med.precautions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary & Lifestyle Precautions */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 shadow-lg">
            <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Clinical Lifestyle & Dietary Guidelines</span>
            </h4>
            
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportAnalysisResult.lifestyle_and_precautions.map((item, idx) => (
                <li key={idx} className="bg-white border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-800 flex items-start gap-3 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  glucose: reportAnalysisResult.extracted_biomarkers.glucose,
                  bpSystolic: reportAnalysisResult.extracted_biomarkers.bpSystolic,
                  bpDiastolic: reportAnalysisResult.extracted_biomarkers.bpDiastolic,
                  cholesterol: reportAnalysisResult.extracted_biomarkers.cholesterol,
                  insulin: reportAnalysisResult.extracted_biomarkers.insulin,
                  bmi: reportAnalysisResult.extracted_biomarkers.bmi
                }));
                showToast("Biomarkers imported into Clinical Diagnostic Wizard!", "success");
                setCurrentTab('wizard');
              }}
              className="btn-magnetic py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              Import Extracted Biomarkers into Health Wizard
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-3 px-6 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Prescription & Report Summary
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
