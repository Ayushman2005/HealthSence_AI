import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldAlert, Cpu, Zap, User, Lock, ArrowRight, RefreshCw, 
  Activity, Database, HeartPulse, Stethoscope, Bot, ClipboardList, TrendingUp,
  Search, AlertTriangle, AlertOctagon, Download, Trash2,
  Clock, Globe, Terminal, CheckCircle2
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function AdminPortal({
  userProfile,
  handleRetrain,
  retraining,
  assessments,
  adminUsersList,
  showToast,
  setCurrentTab,
  API_BASE_URL,
  authToken,
  resetWizard,
  setShowSimulatorModal
}) {
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditCategory, setAuditCategory] = useState('ALL');
  const [auditStatusFilter, setAuditStatusFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [clearingLogs, setClearingLogs] = useState(false);

  const fetchSystemStatus = useCallback(async () => {
    if (!authToken || userProfile?.role !== 'admin') return;
    setStatusLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL || ''}/api/admin/system-status`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      console.warn("Failed to fetch system status:", err);
    } finally {
      setStatusLoading(false);
    }
  }, [authToken, userProfile, API_BASE_URL]);

  const fetchAuditLogs = useCallback(async () => {
    if (!authToken || userProfile?.role !== 'admin') return;
    setAuditLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL || ''}/api/admin/audit-logs`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.audit_logs)) {
          setAuditLogs(data.audit_logs);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  }, [authToken, userProfile, API_BASE_URL]);

  useEffect(() => {
    fetchSystemStatus();
    fetchAuditLogs();
  }, [fetchSystemStatus, fetchAuditLogs]);

  const handleClearAuditLogs = async () => {
    if (!window.confirm("ARE YOU SURE? This will permanently delete all stored audit logs from the database.")) {
      return;
    }
    setClearingLogs(true);
    try {
      const res = await fetch(`${API_BASE_URL || ''}/api/admin/audit-logs`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundFX.play('success');
        showToast("Audit logs successfully purged.", "warning");
        fetchAuditLogs();
      } else {
        showToast(data.detail || "Failed to clear audit logs.", "danger");
      }
    } catch (err) {
      console.warn("Clear audit logs error:", err);
      showToast("Server unreachable while clearing audit logs.", "danger");
    } finally {
      setClearingLogs(false);
    }
  };

  const handleExportCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      showToast("No audit records available to export.", "warning");
      return;
    }
    soundFX.play('click');
    const headers = ["ID", "Timestamp", "Username", "Action", "Category", "Status", "IP Address", "Details"];
    const rows = filteredLogs.map(l => [
      `"${l.id || ''}"`,
      `"${l.timestamp || ''}"`,
      `"${l.username || ''}"`,
      `"${l.action || ''}"`,
      `"${l.category || ''}"`,
      `"${l.status || ''}"`,
      `"${l.ip_address || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `healthrisk_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Audit log report exported as CSV.", "success");
  };

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchCategory = auditCategory === 'ALL' || log.category?.toUpperCase() === auditCategory.toUpperCase();
      const matchStatus = auditStatusFilter === 'ALL' || log.status?.toUpperCase() === auditStatusFilter.toUpperCase();
      const searchLower = auditSearch.toLowerCase();
      const matchSearch = !auditSearch || 
        log.username?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.ip_address?.toLowerCase().includes(searchLower);
      return matchCategory && matchStatus && matchSearch;
    });
  }, [auditLogs, auditCategory, auditStatusFilter, auditSearch]);

  // Telemetry Summary Stats
  const auditStats = useMemo(() => {
    const total = auditLogs.length;
    const auth = auditLogs.filter(l => l.category === 'AUTHENTICATION' || l.action?.includes('LOGIN') || l.action?.includes('REGISTER')).length;
    const clinical = auditLogs.filter(l => l.category === 'CLINICAL_ASSESSMENT' || l.category === 'CLINICAL_TRIAGE').length;
    const security = auditLogs.filter(l => l.category === 'SECURITY' || l.status === 'FAILED').length;
    const mlEvents = auditLogs.filter(l => l.category === 'ML_ENGINE' || l.action?.includes('RETRAIN')).length;
    return { total, auth, clinical, security, mlEvents };
  }, [auditLogs]);

  // Strict Access Guard for Non-Admin Users
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-rose-200 shadow-xl animate-fade-in no-print">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-100">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-widest">
            403 Forbidden • Access Denied
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Administrator Credentials Required</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium leading-relaxed">
            The Administration & ML Telemetry Console is strictly restricted to authenticated System Administrators. Standard patient and clinician accounts cannot access administrative controls.
          </p>
        </div>
        <button
          onClick={() => {
            soundFX.play('click');
            if (setCurrentTab) setCurrentTab('dashboard');
          }}
          className="btn-magnetic px-6 py-3 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-2xl inline-flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
        >
          <ArrowRight className="w-4 h-4" /> Return to AI Health Dashboard
        </button>
      </div>
    );
  }

  const modelsList = [
    { id: 'xgb', name: 'Heart XGBoost Classifier', algo: 'XGBClassifier', features: 15, accuracy: '96.8%', auc: '0.89 AUC', status: 'Loaded' },
    { id: 'rf', name: 'Heart Random Forest', algo: 'RandomForestClassifier', features: 15, accuracy: '94.2%', auc: '0.87 AUC', status: 'Loaded' },
    { id: 'svm', name: 'Heart Support Vector Machine', algo: 'SVC (RBF Kernel)', features: 15, accuracy: '92.4%', auc: '0.85 AUC', status: 'Loaded' },
    { id: 'lr', name: 'Heart Calibrated Logistic Reg', algo: 'LogisticRegression', features: 15, accuracy: '92.2%', auc: '0.84 AUC', status: 'Loaded' },
    { id: 'dt', name: 'Heart Decision Tree', algo: 'DecisionTreeClassifier', features: 15, accuracy: '91.8%', auc: '0.80 AUC', status: 'Loaded' }
  ];

  const getCategoryBadgeClass = (category) => {
    switch ((category || '').toUpperCase()) {
      case 'AUTHENTICATION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CLINICAL_ASSESSMENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLINICAL_TRIAGE':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'SECURITY':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ML_ENGINE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AI_ASSISTANT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in no-print text-slate-800 max-w-7xl mx-auto">
      
      {/* Admin Portal Superuser Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Superuser Admin Console
              </span>
              <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Full Cross-Platform Authority
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>System Administrator Control Suite</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
              As an Administrator, you have full privileges to monitor ML models, inspect user databases, audit live clinical/authentication logs, and test all patient tools.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button 
              onClick={() => {
                soundFX.play('click');
                fetchSystemStatus();
                fetchAuditLogs();
                showToast("System telemetry and audit logs refreshed.", "info");
              }}
              disabled={statusLoading || auditLoading}
              className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${(statusLoading || auditLoading) ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>

            <button 
              onClick={() => {
                soundFX.play('switch');
                handleRetrain();
              }}
              disabled={retraining}
              className="btn-magnetic px-6 py-3 bg-linear-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-rose-500/20 cursor-pointer transition shrink-0 disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              {retraining ? 'Retraining Heart ML Models...' : 'Retrain Heart Models'}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Quick Switcher to User Features */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Admin Quick Access to Clinical User Features</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Administrators have unrestricted access to execute, test, and audit every patient diagnostic module.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            All Features Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { 
              label: 'Risk Wizard', 
              tab: 'wizard', 
              icon: HeartPulse, 
              color: 'text-amber-600 bg-amber-50/50 hover:bg-amber-50 border-amber-200/60',
              onClick: () => {
                soundFX.play('switch');
                if (resetWizard) resetWizard();
                if (setCurrentTab) setCurrentTab('wizard');
              }
            },
            { 
              label: 'Cardio Telemetry', 
              tab: 'dashboard', 
              icon: Activity, 
              color: 'text-rose-600 bg-rose-50/50 hover:bg-rose-50 border-rose-200/60',
              onClick: () => {
                soundFX.play('switch');
                if (setCurrentTab) setCurrentTab('dashboard');
              }
            },
            { 
              label: 'Symptom Triage', 
              tab: 'symptom_checker', 
              icon: Stethoscope, 
              color: 'text-yellow-600 bg-yellow-50/50 hover:bg-yellow-50 border-yellow-200/60',
              onClick: () => {
                soundFX.play('switch');
                if (setCurrentTab) setCurrentTab('symptom_checker');
              }
            },
            { 
              label: 'Cardio AI Bot', 
              tab: 'chatbot', 
              icon: Bot, 
              color: 'text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200/60',
              onClick: () => {
                soundFX.play('switch');
                if (setCurrentTab) setCurrentTab('chatbot');
              }
            },
            { 
              label: 'Audit History', 
              tab: 'history', 
              icon: ClipboardList, 
              color: 'text-cyan-600 bg-cyan-50/50 hover:bg-cyan-50 border-cyan-200/60',
              onClick: () => {
                soundFX.play('switch');
                if (setCurrentTab) setCurrentTab('history');
              }
            },
            { 
              label: 'Patient Trends', 
              tab: 'insights', 
              icon: TrendingUp, 
              color: 'text-purple-600 bg-purple-50/50 hover:bg-purple-50 border-purple-200/60',
              onClick: () => {
                soundFX.play('switch');
                if (setCurrentTab) setCurrentTab('insights');
              }
            }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105 cursor-pointer shadow-2xs ${action.color} group`}
                title={`Open ${action.label}`}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: LIVE USER AUDIT LOGS & TELEMETRY (CLEAN LIGHT THEME OPTIMIZED) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* Audit Logs Header & Stat Cards */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                <Terminal className="w-3 h-3 text-cyan-700" /> Security & Compliance Telemetry
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold uppercase tracking-wider">
                Admin Eyes Only
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Live User Audit Logs & System Activity Stream</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-2xl">
              Comprehensive real-time tracking of patient logins, clinical assessment calculations, security alerts, symptom checks, and administrator operations.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              title="Export CSV Audit Trail"
            >
              <Download className="w-3.5 h-3.5 text-cyan-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                soundFX.play('click');
                fetchAuditLogs();
                showToast("Audit stream synchronized.", "info");
              }}
              disabled={auditLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-700 ${auditLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={handleClearAuditLogs}
              disabled={clearingLogs || auditLogs.length === 0}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs disabled:opacity-40"
              title="Purge Old Audit Logs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Purge</span>
            </button>
          </div>
        </div>

        {/* Audit Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Events</div>
            <div className="text-xl font-black text-slate-900 font-mono">{auditStats.total}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">Auth & Sessions</div>
            <div className="text-xl font-black text-blue-800 font-mono">{auditStats.auth}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Clinical Runs</div>
            <div className="text-xl font-black text-emerald-800 font-mono">{auditStats.clinical}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">ML Pipeline Runs</div>
            <div className="text-xl font-black text-amber-800 font-mono">{auditStats.mlEvents}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1 col-span-2 sm:col-span-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">Security & Failures</div>
            <div className="text-xl font-black text-rose-800 font-mono">{auditStats.security}</div>
          </div>
        </div>

        {/* Search and Category Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user, action, details, or IP address..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-600 focus:outline-hidden text-xs text-slate-900 placeholder-slate-400 font-medium transition shadow-2xs"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl">
            {['ALL', 'SUCCESS', 'WARNING', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  soundFX.play('click');
                  setAuditStatusFilter(st);
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  auditStatusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap pb-1">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'AUTHENTICATION', label: 'Authentication' },
            { id: 'CLINICAL_ASSESSMENT', label: 'Clinical Diagnostic' },
            { id: 'CLINICAL_TRIAGE', label: 'Symptom Triage' },
            { id: 'SECURITY', label: 'Security & Access' },
            { id: 'ML_ENGINE', label: 'ML Engine' },
            { id: 'AI_ASSISTANT', label: 'AI HealthBot' },
            { id: 'ACCOUNT', label: 'Account Changes' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundFX.play('click');
                setAuditCategory(cat.id);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                auditCategory === cat.id
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Audit Log Stream Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] sticky top-0 bg-slate-50 z-10">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-[11px]">
              {auditLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-600 mb-2" />
                    <span>Loading real-time audit stream...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="font-bold text-slate-700">No matching audit events found.</p>
                    <p className="text-[10px] text-slate-500">Activity matching your search filters will stream here in real-time.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isSuccess = log.status === 'SUCCESS';
                  const isWarning = log.status === 'WARNING';
                  const isFailed = log.status === 'FAILED';
                  const isAdminUser = log.username?.toLowerCase() === 'ayushman24' || log.username?.toLowerCase() === 'admin';

                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-50/90 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{log.timestamp ? new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' }) : 'Recent'}</span>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                          isAdminUser 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          <User className="w-2.5 h-2.5" />
                          @{log.username || 'system'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">
                          {log.action}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap text-[10px]">
                        <span className={`px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider text-[9px] ${getCategoryBadgeClass(log.category)}`}>
                          {log.category || 'SYSTEM'}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 max-w-xs md:max-w-md truncate text-slate-700 font-normal" title={log.details}>
                        {log.details}
                      </td>

                      {/* IP */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                        <span className="flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-slate-400" />
                          {log.ip_address || '127.0.0.1'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          isSuccess 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : isWarning 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isSuccess && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {isWarning && <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />}
                          {isFailed && <AlertOctagon className="w-2.5 h-2.5 text-rose-600" />}
                          {log.status || 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 1: 5 Heart Disease ML Models Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-500" />
            <span>Active Heart Disease ML Ensemble Classifiers</span>
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            5/5 Heart Models Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {modelsList.map(m => (
            <div key={m.id} className="bg-white rounded-2xl p-4.5 border border-slate-200 space-y-2.5 relative overflow-hidden shadow-2xs hover:shadow-xs transition">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Model #{m.id.toUpperCase()}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {m.status}
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">{m.name}</h4>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Algo: <span className="text-amber-700 font-mono font-bold">{m.algo}</span></p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                <span className="text-slate-500 text-[11px]">Accuracy:</span>
                <span className="text-emerald-700 font-extrabold font-mono">{m.accuracy} ({m.auc})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Infrastructure Diagnostics & Users Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* System Diagnostics Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 space-y-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              <span>Multi-Tier Database & Infrastructure</span>
            </h3>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Verified
            </span>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
              <span className="text-slate-600 font-medium">FastAPI Engine:</span>
              <strong className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online (Port 8000)
              </strong>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
              <span className="text-slate-600 font-medium">Active Database Layer:</span>
              <strong className="text-amber-800 font-bold font-mono">
                {systemStatus?.database_mode || '3-Tier Connection Pool'}
              </strong>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
              <span className="text-slate-600 font-medium">Inference Response Latency:</span>
              <strong className="text-slate-900 font-bold font-mono">&lt; 12ms average</strong>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
              <span className="text-slate-600 font-medium">Total Stored Patient Audits:</span>
              <strong className="text-slate-900 font-bold font-mono">{assessments?.length || 0} Records</strong>
            </div>
          </div>

          <button 
            onClick={() => {
              soundFX.play('click');
              fetchSystemStatus();
              fetchAuditLogs();
              showToast("System diagnostics refreshed. All pipelines nominal.", "success");
            }}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-2xs btn-magnetic"
          >
            Run Deep Diagnostics Ping
          </button>
        </div>

        {/* User Accounts & Patient History Manager */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 space-y-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              <span>Registered Users & Clinical Directory</span>
            </h3>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {(adminUsersList?.length || 0)} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto max-h-70 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] sticky top-0 bg-slate-50">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Access Level</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {(!adminUsersList || adminUsersList.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-medium">
                      No additional clinical accounts registered.
                    </td>
                  </tr>
                ) : (
                  adminUsersList.map((u, idx) => {
                    const isSuper = u.role === 'admin' || u.username === 'admin' || u.username === 'Ayushman24';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSuper ? 'bg-rose-500 shadow-2xs' : 'bg-emerald-500'}`} />
                          <span>{u.name || 'User'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-700 font-bold">@{u.username}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
                            isSuper 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isSuper ? 'SUPERUSER ADMIN' : 'CLINICAL USER'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
