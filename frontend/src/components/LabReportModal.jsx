import React, { useState, useRef } from 'react';
import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, X, Sparkles, 
  ArrowRight, RefreshCw, FileCheck, HeartPulse
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { soundFX } from '../utils/audioFX';

export default function LabReportModal({
  isOpen,
  onClose,
  onApplyBiomarkers,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractResult, setExtractResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg('');
      setExtractResult(null);
      soundFX.play('click');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg('');
      setExtractResult(null);
      soundFX.play('click');
    }
  };

  const handleAnalyze = async () => {
    setErrorMsg('');
    setExtractResult(null);

    if (activeTab === 'upload' && !selectedFile) {
      setErrorMsg('Please select a PDF or diagnostic document to analyze.');
      return;
    }
    if (activeTab === 'text' && !pastedText.trim()) {
      setErrorMsg('Please paste clinical notes or laboratory text to analyze.');
      return;
    }

    setAnalyzing(true);
    soundFX.play('switch');

    try {
      let res;
      if (activeTab === 'upload') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await fetch(`${API_BASE_URL}/api/parse-lab-report`, {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/parse-lab-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_text: pastedText })
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.error || data.message || 'Failed to extract clinical biomarkers from document.');
      }

      setExtractResult(data);
      soundFX.play('success');
      if (showToast) {
        showToast(`Extracted ${data.totalBiomarkers || Object.keys(data.extracted || {}).length} clinical biomarkers!`, 'success');
      }
    } catch (err) {
      console.error('Lab Report extraction error:', err);
      setErrorMsg(err.message || 'An error occurred while analyzing the document.');
      soundFX.play('alert');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!extractResult?.extracted) return;
    soundFX.play('click');
    onApplyBiomarkers(extractResult.extracted);
    onClose();
  };

  const fieldLabels = {
    name: 'Patient Name',
    age: 'Age',
    gender: 'Biological Sex',
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    bpSystolic: 'Systolic BP (mmHg)',
    bpDiastolic: 'Diastolic BP (mmHg)',
    cholesterol: 'Total Cholesterol (mg/dL)',
    glucose: 'Fasting Glucose (mg/dL)',
    insulin: 'Fasting Insulin (µIU/mL)',
    heartRate: 'Resting Heart Rate (BPM)',
    hdl: 'HDL Cholesterol (mg/dL)',
    ldl: 'LDL Cholesterol (mg/dL)',
    hba1c: 'HbA1c (%)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 to-yellow-400 p-[1.5px] shadow-lg shadow-amber-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Lab Report & PDF Auto-Fill</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI OCR
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Extract blood pressure, glucose, lipids, and vitals directly into the assessment.</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.play('click');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-5 space-y-5 pr-1">
          {/* Tab Selection */}
          <div className="flex gap-2 p-1 bg-slate-900/90 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                soundFX.play('click');
                setActiveTab('upload');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document (PDF / Image)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.play('click');
                setActiveTab('text');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'text'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Paste Clinical Text</span>
            </button>
          </div>

          {/* Mode 1: File Upload */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragOver
                  ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                  : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/15 hover:border-amber-500/40 bg-slate-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                {selectedFile ? <FileCheck className="w-7 h-7 text-emerald-400" /> : <UploadCloud className="w-7 h-7" />}
              </div>
              <div>
                <p className="text-sm font-black text-white">
                  {selectedFile ? selectedFile.name : 'Drag & drop your diagnostic report or click to browse'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports Quest, LabCorp, Hospital EHR, Dr. Lal PathLabs PDF reports or text exports (.pdf, .txt, .png)
                </p>
                {selectedFile && (
                  <p className="text-[11px] font-mono text-emerald-400 mt-1 font-bold">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB · Ready to scan
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Paste Clinical Text */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Laboratory Text Snippet / Electronic Health Notes</span>
                <span className="text-[10px] text-slate-400 font-normal">e.g., BP 138/86, Total Chol 224, Fasting Glucose 114</span>
              </label>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste laboratory results here, for example:&#10;Patient: John Doe, Age: 52, Male&#10;Blood Pressure: 138/88 mmHg, Heart Rate: 74 bpm&#10;Total Cholesterol: 224 mg/dL, HDL: 44, LDL: 148&#10;Fasting Glucose: 112 mg/dL, Insulin: 14.2 uIU/mL"
                className="w-full p-4 glass-input rounded-2xl text-xs font-mono leading-relaxed outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2.5 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          {!extractResult && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || (activeTab === 'upload' && !selectedFile) || (activeTab === 'text' && !pastedText.trim())}
              className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 transition"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Scanning & Extracting Clinical Biomarkers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze & Extract Biomarkers</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Results Preview */}
          {extractResult && (
            <div className="space-y-4 animate-tab-fade border border-emerald-500/30 bg-emerald-950/20 rounded-3xl p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-black text-white">Extracted Clinical Biomarkers</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {extractResult.totalBiomarkers || Object.keys(extractResult.extracted || {}).length} Values Found · {extractResult.confidence || 95}% Confidence
                </span>
              </div>

              {/* Grid of parsed metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {Object.entries(extractResult.extracted || {}).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col gap-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                      {fieldLabels[key] || key}
                    </span>
                    <strong className="text-sm font-black text-amber-300 font-mono">
                      {typeof val === 'number' ? val : String(val)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setExtractResult(null);
                    setErrorMsg('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Scan Another
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/30 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Apply All {extractResult.totalBiomarkers || Object.keys(extractResult.extracted || {}).length} Values to Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-3 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
            <span>HealthSence AI Clinical Extraction Engine</span>
          </span>
          <span className="font-mono text-slate-500">HIPAA Compliant In-Memory Parsing</span>
        </div>
      </div>
    </div>
  );
}
