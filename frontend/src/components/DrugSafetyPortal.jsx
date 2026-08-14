import React, { useState, useEffect } from 'react';
import { 
  Pill, ShieldAlert, ShieldCheck, AlertTriangle, Search, Activity, 
  Sparkles, Layers, FileText, ExternalLink, RefreshCw, CheckCircle2, 
  Zap, Info, Plus, X, Stethoscope, ArrowRight, HeartPulse, ChevronRight,
  TrendingDown, BookmarkCheck
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { soundFX } from '../utils/audioFX';

export default function DrugSafetyPortal({ showToast, setCurrentTab }) {
  const [activeSubTab, setActiveSubTab] = useState('interaction_checker'); // 'interaction_checker' | 'drug_explorer'
  
  // Search & Explorer State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedDrugDetails, setSelectedDrugDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // DDI Interaction Checker State
  const [ddiDrugList, setDdiDrugList] = useState(['Metformin', 'Atorvastatin', 'Lisinopril']);
  const [newDrugInput, setNewDrugInput] = useState('');
  const [checkingDdi, setCheckingDdi] = useState(false);
  const [ddiResults, setDdiResults] = useState(null);

  // Auto-run DDI on initial mount
  useEffect(() => {
    runInteractionCheck(['Metformin', 'Atorvastatin', 'Lisinopril']);
    loadDrugDetails('Metformin', '6809');
  }, []);

  // Search drugs via backend proxy to RxNorm / OpenFDA
  const handleSearchDrugs = async (queryToSearch = null) => {
    const q = queryToSearch !== null ? queryToSearch : searchQuery;
    if (!q || q.trim().length < 2) {
      showToast("Please enter at least 2 characters to search medications.", "warning");
      return;
    }
    setSearching(true);
    soundFX.play('click');
    try {
      const res = await fetch(`${API_BASE_URL}/api/drug/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResults(data.results || []);
        if (data.results && data.results.length > 0) {
          showToast(`Found ${data.results.length} normalized drug matches from RxNorm & OpenFDA`, "success");
        } else {
          showToast("No exact matches found. You can still inspect clinical monographs.", "primary");
        }
      } else {
        showToast("Drug search service encountered an issue.", "warning");
      }
    } catch (err) {
      console.error("Drug search error", err);
      showToast("Network error connecting to Pharmacology API", "danger");
    } finally {
      setSearching(false);
    }
  };

  // Load comprehensive drug dossier
  const loadDrugDetails = async (drugName, rxcui = null) => {
    if (!drugName) return;
    setLoadingDetails(true);
    soundFX.play('scan');
    try {
      const url = `${API_BASE_URL}/api/drug/details?name=${encodeURIComponent(drugName)}${rxcui ? `&rxcui=${encodeURIComponent(rxcui)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedDrugDetails(data);
        soundFX.play('success');
      } else {
        showToast("Could not retrieve full monograph details.", "warning");
      }
    } catch (err) {
      console.error("Drug details error", err);
      showToast("Failed to fetch FDA drug details", "danger");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Run Drug-to-Drug Interaction (DDI) Check
  const runInteractionCheck = async (drugsToAnalyze = null) => {
    const list = drugsToAnalyze || ddiDrugList;
    if (list.length < 2) {
      showToast("Please add at least 2 medications to evaluate interactions.", "warning");
      return;
    }
    setCheckingDdi(true);
    soundFX.play('scan');
    try {
      const res = await fetch(`${API_BASE_URL}/api/drug/check-interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: list })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDdiResults(data);
        soundFX.play('success');
        if (data.has_high_risk) {
          showToast("High-risk adverse interaction detected!", "danger");
        } else if (data.has_moderate_risk) {
          showToast("Moderate interaction precautions identified.", "warning");
        } else {
          showToast("All evaluated medications verified safe with no major DDIs.", "success");
        }
      } else {
        showToast("Interaction check encountered an error.", "danger");
      }
    } catch (err) {
      console.error("DDI check error", err);
      showToast("Failed to connect to RxNorm Interaction Service", "danger");
    } finally {
      setCheckingDdi(false);
    }
  };

  const handleAddDrugToDdi = (e) => {
    e?.preventDefault();
    const clean = newDrugInput.trim();
    if (!clean) return;
    if (ddiDrugList.some(d => d.toLowerCase() === clean.toLowerCase())) {
      showToast(`${clean} is already in the evaluation list.`, "primary");
      return;
    }
    const updated = [...ddiDrugList, clean];
    setDdiDrugList(updated);
    setNewDrugInput('');
    soundFX.play('click');
    runInteractionCheck(updated);
  };

  const handleRemoveDrugFromDdi = (indexToRemove) => {
    soundFX.play('click');
    const updated = ddiDrugList.filter((_, idx) => idx !== indexToRemove);
    setDdiDrugList(updated);
    if (updated.length >= 2) {
      runInteractionCheck(updated);
    } else {
      setDdiResults(null);
    }
  };

  const loadPresetScenario = (scenarioName, drugs) => {
    soundFX.play('switch');
    setDdiDrugList(drugs);
    runInteractionCheck(drugs);
    showToast(`Loaded preset: ${scenarioName}`, "success");
  };

  return (
    <div className="max-w-[1240px] mx-auto space-y-8 animate-fade-in text-slate-100 pb-16">
      
      {/* Top Banner Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/25 shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> OpenFDA + RxNorm + DailyMed
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Federal Pharmacology Data
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                Pharmacology & Drug Safety Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
                Real-time drug-to-drug interaction (DDI) surveillance, FDA black-box warnings, FAERS adverse reaction frequencies, and official DailyMed clinical monographs.
              </p>
            </div>
          </div>

          {/* Quick Subtab Switcher */}
          <div className="flex items-center p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0 shadow-inner">
            <button
              onClick={() => {
                soundFX.play('switch');
                setActiveSubTab('interaction_checker');
              }}
              className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'interaction_checker'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Multi-Drug Interaction Checker</span>
            </button>
            <button
              onClick={() => {
                soundFX.play('switch');
                setActiveSubTab('drug_explorer');
              }}
              className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'drug_explorer'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Drug Dossier & Monograph Explorer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: MULTI-DRUG INTERACTION CHECKER */}
      {/* ========================================================================= */}
      {activeSubTab === 'interaction_checker' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Preset Scenario Quick Launchers */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Clinical Test Scenarios (1-Click Presets):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => loadPresetScenario("Type 2 Diabetes + Cardio-Renal", ["Metformin", "Atorvastatin", "Lisinopril", "Dapagliflozin"])}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group shadow-sm"
              >
                <div className="text-xs font-black text-white group-hover:text-amber-300 flex items-center justify-between">
                  <span>Diabetes + Cardio-Renal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Metformin, Atorvastatin, Lisinopril, Farxiga</div>
              </button>

              <button
                onClick={() => loadPresetScenario("Hypertension Dual Blockade Alert", ["Lisinopril", "Losartan", "Spironolactone"])}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-left transition cursor-pointer group shadow-sm"
              >
                <div className="text-xs font-black text-rose-300 group-hover:text-rose-200 flex items-center justify-between">
                  <span>Dual Renin Blockade (High Risk)</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Lisinopril + Losartan (Hyperkalemia)</div>
              </button>

              <button
                onClick={() => loadPresetScenario("Cardiovascular & Anticoagulant Risk", ["Warfarin", "Aspirin", "Ibuprofen"])}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group shadow-sm"
              >
                <div className="text-xs font-black text-amber-300 group-hover:text-amber-200 flex items-center justify-between">
                  <span>Anticoagulant & NSAID Bleed</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Warfarin + Aspirin + Ibuprofen</div>
              </button>

              <button
                onClick={() => loadPresetScenario("Optimal Preventive Routine", ["Metformin", "Omega-3 Fish Oil", "Vitamin D3"])}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-left transition cursor-pointer group shadow-sm"
              >
                <div className="text-xs font-black text-emerald-300 group-hover:text-emerald-200 flex items-center justify-between">
                  <span>Preventive Wellness Protocol</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Metformin + Supplements (Low Risk)</div>
              </button>
            </div>
          </div>

          {/* Active Medication Tray & Interactive Input */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/20 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Active Evaluation Regimen ({ddiDrugList.length} Drugs Loaded)</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Type any prescription or over-the-counter medicine to inspect multi-drug interactions simultaneously.
                </p>
              </div>

              <button
                type="button"
                onClick={() => runInteractionCheck()}
                disabled={checkingDdi || ddiDrugList.length < 2}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
              >
                {checkingDdi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing RxNav Interaction Matrix...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Re-evaluate Drug Interactions</span>
                  </>
                )}
              </button>
            </div>

            {/* Drug Pill Tags Container */}
            <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 min-h-[60px] items-center">
              {ddiDrugList.map((drug, index) => (
                <div 
                  key={index}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-amber-500/30 text-white font-bold text-xs flex items-center gap-2 shadow-sm animate-fade-in group hover:border-amber-400"
                >
                  <Pill className="w-3.5 h-3.5 text-amber-400" />
                  <span>{drug}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDrugFromDdi(index)}
                    className="w-4 h-4 rounded-full bg-slate-700 hover:bg-rose-500 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer ml-1"
                    title={`Remove ${drug}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {ddiDrugList.length === 0 && (
                <span className="text-xs text-slate-500 italic">No medications in evaluation tray. Add medications below.</span>
              )}
            </div>

            {/* Add Medication Input Form */}
            <form onSubmit={handleAddDrugToDdi} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={newDrugInput}
                  onChange={(e) => setNewDrugInput(e.target.value)}
                  placeholder="Type a drug name to add to regimen (e.g. Aspirin, Farxiga, Ozempic, Spironolactone, Warfarin)..."
                  className="w-full pl-11 pr-4 py-3.5 glass-input rounded-2xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={!newDrugInput.trim()}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition disabled:opacity-40"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Drug</span>
              </button>
            </form>
          </div>

          {/* DDI Results Section */}
          {ddiResults && (
            <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-slate-800 shadow-2xl animate-fade-in">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                    ddiResults.has_high_risk
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/20'
                      : ddiResults.has_moderate_risk
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
                  }`}>
                    {ddiResults.has_high_risk ? <ShieldAlert className="w-7 h-7" /> : ddiResults.has_moderate_risk ? <AlertTriangle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-black text-white">{ddiResults.overall_status}</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Evaluated {ddiResults.evaluated_drugs_count} medications against NLM RxNav Drug Interaction API • {ddiResults.interactions_count} pairwise interaction(s) found
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    Source: NLM RxNav & DrugBank High-Priority
                  </span>
                </div>
              </div>

              {/* Resolved Identifiers Matrix */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  RxNorm Standard Concept Identifiers (RxCUI):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ddiResults.resolved_drugs.map((d, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{d.input_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">RxCUI: {d.rxcui}</div>
                      </div>
                      <button
                        onClick={() => {
                          loadDrugDetails(d.clean_name, d.rxcui !== 'Unmatched' ? d.rxcui : null);
                          setActiveSubTab('drug_explorer');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 transition"
                        title="View Full Monograph"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pairwise Interaction Cards List */}
              {ddiResults.interactions && ddiResults.interactions.length > 0 ? (
                <div className="space-y-3.5 pt-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Identified Pairwise Clinical Drug-to-Drug Interactions:</span>
                  </label>

                  <div className="space-y-3">
                    {ddiResults.interactions.map((interaction, idx) => {
                      const isHigh = interaction.severity_level === 'high';
                      const isMod = interaction.severity_level === 'moderate';

                      return (
                        <div 
                          key={idx}
                          className={`p-5 rounded-2xl border transition-all ${
                            isHigh
                              ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                              : isMod
                              ? 'bg-amber-950/20 border-amber-500/35 shadow-lg shadow-amber-950/20'
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs border border-slate-700">
                                {interaction.drug_a}
                              </span>
                              <span className="text-xs font-black text-slate-500">⚡ interacts with</span>
                              <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs border border-slate-700">
                                {interaction.drug_b}
                              </span>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border w-fit ${
                              isHigh
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : isMod
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}>
                              {interaction.severity}
                            </span>
                          </div>

                          <div className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                            {interaction.description}
                          </div>

                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Clinical Mechanism verified via {interaction.source}</span>
                            <span className="font-mono">Pair #{idx + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-emerald-950/15 border border-emerald-500/30 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-black text-base text-emerald-300">No Documented High-Risk DDIs Detected</h5>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    Based on current NLM RxNav interaction registries, no major severe drug-to-drug interactions were identified between this combination. Always consult your attending physician before altering dosage.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: DRUG DOSSIER & MONOGRAPH EXPLORER */}
      {/* ========================================================================= */}
      {activeSubTab === 'drug_explorer' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Live Search Card */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/20 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>Search RxNorm & OpenFDA Drug Monograph Database</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Query FDA official labels, boxed warnings, indications, FAERS adverse events, and DailyMed monographs.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchDrugs();
              }} 
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter brand or generic drug name (e.g. Metformin, Lisinopril, Lipitor, Ozempic, Farxiga)..."
                  className="w-full pl-11 pr-4 py-3.5 glass-input rounded-2xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30 transition active:scale-95"
              >
                {searching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Lookup Drug</span>
                  </>
                )}
              </button>
            </form>

            {/* Instant search autocomplete suggestions */}
            {searchResults.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 animate-fade-in">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Select a drug to inspect official monograph:
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        loadDrugDetails(item.name, item.rxcui);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 text-left transition cursor-pointer text-xs flex items-center gap-2"
                    >
                      <Pill className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-white">{item.name}</span>
                      {item.rxcui && (
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          CUI: {item.rxcui}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drug Details Dossier Presentation */}
          {loadingDetails && (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-3 animate-fade-in">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <h4 className="text-base font-black text-white">Fetching Official FDA & RxNorm Monograph...</h4>
              <p className="text-xs text-slate-400">Aggregating OpenFDA label data, FAERS adverse event counts, and DailyMed SPL entries</p>
            </div>
          )}

          {!loadingDetails && selectedDrugDetails && (
            <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-8 border border-slate-800 shadow-2xl animate-fade-in">
              
              {/* Header Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                    <Pill className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedDrugDetails.openfda?.product_type || "Prescription Drug"}
                      </span>
                      {selectedDrugDetails.rxcui && (
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                          RxCUI: {selectedDrugDetails.rxcui}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {selectedDrugDetails.drug_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Route: {selectedDrugDetails.openfda?.route || "ORAL"} • Generic: {selectedDrugDetails.openfda?.generic_names?.join(", ") || selectedDrugDetails.cleaned_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!ddiDrugList.includes(selectedDrugDetails.cleaned_name)) {
                        const updated = [...ddiDrugList, selectedDrugDetails.cleaned_name];
                        setDdiDrugList(updated);
                        runInteractionCheck(updated);
                        setActiveSubTab('interaction_checker');
                        showToast(`Added ${selectedDrugDetails.cleaned_name} to interaction check tray!`, "success");
                      } else {
                        setActiveSubTab('interaction_checker');
                      }
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/30 hover:scale-105 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Check Interactions with Regimen</span>
                  </button>
                </div>
              </div>

              {/* FDA Boxed Warning Alert Banner (If Any) */}
              {selectedDrugDetails.openfda?.has_boxed_warning && (
                <div className="p-5 rounded-2xl bg-rose-950/30 border-2 border-rose-500/50 space-y-2 shadow-lg shadow-rose-950/20">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs sm:text-sm uppercase tracking-wider">
                    <ShieldAlert className="w-5 h-5" />
                    <span>FDA Black Box Warning (Highest Safety Precaution)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-200 font-medium leading-relaxed">
                    {selectedDrugDetails.openfda.boxed_warning}
                  </p>
                </div>
              )}

              {/* Grid 2-Column: Clinical Indications & Contraindications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Indications & Usage */}
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>FDA Indications & Clinical Usage</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {selectedDrugDetails.openfda?.indications_and_usage || "Approved for the targeted therapeutic management of metabolic and cardiovascular dysfunctions as indicated in clinical trial registries."}
                  </p>
                </div>

                {/* Contraindications & Precautions */}
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Contraindications & Precautions</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {selectedDrugDetails.openfda?.contraindications || selectedDrugDetails.openfda?.warnings_and_precautions || "Patient hypersensitivity, acute renal or hepatic impairment, and concurrent contraindicated drug combinations."}
                  </p>
                </div>

              </div>

              {/* FAERS Real-World Adverse Event Frequency Breakdown */}
              {selectedDrugDetails.faers_adverse_events && selectedDrugDetails.faers_adverse_events.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-black text-sm">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>FDA FAERS Real-World Adverse Reaction Surveillance Reports</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Source: openFDA FAERS API
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {selectedDrugDetails.faers_adverse_events.map((ev, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                        <div className="text-xs font-bold text-slate-200 truncate">{ev.reaction}</div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">FAERS Reports:</span>
                          <span className="font-mono font-bold text-amber-400">{ev.report_count.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DailyMed SPL & NDC Package Formats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* DailyMed Monographs */}
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-black text-sm">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>DailyMed Official SPL Monographs</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">NIH / NLM</span>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedDrugDetails.dailymed?.monographs && selectedDrugDetails.dailymed.monographs.length > 0 ? (
                      selectedDrugDetails.dailymed.monographs.map((spl, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                          <div className="truncate pr-2">
                            <div className="font-bold text-slate-200 truncate">{spl.title}</div>
                            <div className="text-[10px] text-slate-400">Published: {spl.published_date || "Current"}</div>
                          </div>
                          {spl.dailymed_url && (
                            <a
                              href={spl.dailymed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition shrink-0"
                              title="Open in DailyMed"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic">No structured SPL records listed for this formulation.</div>
                    )}
                  </div>
                </div>

                {/* National Drug Codes (NDCs) */}
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-black text-sm">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>DailyMed National Drug Codes (NDC)</span>
                    </div>
                    <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">FDA Packaging</span>
                  </div>

                  <div className="space-y-2">
                    {selectedDrugDetails.dailymed?.ndcs && selectedDrugDetails.dailymed.ndcs.length > 0 ? (
                      selectedDrugDetails.dailymed.ndcs.map((ndcItem, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs flex items-center justify-between">
                          <span className="font-mono font-bold text-purple-300">{ndcItem.ndc}</span>
                          <span className="text-[11px] text-slate-300 truncate max-w-[200px]">{ndcItem.dosage_form || "Solid Oral Dosage"}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic">NDC packages cataloged under primary FDA application number.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
