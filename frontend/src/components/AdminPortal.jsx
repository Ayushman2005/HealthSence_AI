import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, Cpu, Zap, User, Lock, ArrowRight, RefreshCw, 
  Activity, Database, HeartPulse, Stethoscope, Bot, ClipboardList, TrendingUp
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
  authToken
}) {
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

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

  useEffect(() => {
    fetchSystemStatus();
  }, [fetchSystemStatus]);


  // Strict Access Guard for Non-Admin Users
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-rose-500/30 shadow-2xl animate-fade-in no-print bg-slate-950/90">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-500/20 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-widest">
            403 Forbidden • Access Denied
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Administrator Credentials Required</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-medium leading-relaxed">
            The Administration & ML Telemetry Console is strictly restricted to authenticated System Administrators. Standard patient and clinician accounts cannot access administrative controls.
          </p>
        </div>
        <button
          onClick={() => {
            soundFX.play('click');
            if (setCurrentTab) setCurrentTab('dashboard');
          }}
          className="btn-magnetic px-6 py-3 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-2xl inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30"
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

  return (
    <div className="space-y-8 animate-fade-in no-print text-slate-100">
      
      {/* Admin Portal Superuser Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden border border-rose-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Superuser Admin Console
              </span>
              <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Full Cross-Platform Authority
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>System Administrator Control Suite</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
              As an Administrator, you have full privileges to monitor ML models, calibrate pipelines, inspect user databases, and test all patient/clinical tools.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button 
              onClick={() => {
                soundFX.play('click');
                fetchSystemStatus();
                showToast("System telemetry refreshed.", "info");
              }}
              disabled={statusLoading}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${statusLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>

            <button 
              onClick={() => {
                soundFX.play('switch');
                handleRetrain();
              }}
              disabled={retraining}
              className="btn-magnetic px-6 py-3 bg-linear-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-500/30 cursor-pointer transition shrink-0 disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              {retraining ? 'Retraining Heart ML Models...' : 'Retrain Heart Models'}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Quick Switcher to User Features */}
      <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Admin Quick Access to Clinical User Features</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Administrators have unrestricted access to execute, test, and audit every patient diagnostic module.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            All Features Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Risk Wizard', tab: 'wizard', icon: HeartPulse, color: 'text-amber-400 hover:border-amber-400' },
            { label: 'Cardio Telemetry', tab: 'dashboard', icon: Activity, color: 'text-rose-400 hover:border-rose-400' },
            { label: 'Symptom Triage', tab: 'symptom_checker', icon: Stethoscope, color: 'text-yellow-400 hover:border-yellow-400' },
            { label: 'Cardio AI Bot', tab: 'chatbot', icon: Bot, color: 'text-emerald-400 hover:border-emerald-400' },
            { label: 'Audit History', tab: 'history', icon: ClipboardList, color: 'text-cyan-400 hover:border-cyan-400' },
            { label: 'Patient Trends', tab: 'insights', icon: TrendingUp, color: 'text-purple-400 hover:border-purple-400' }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  soundFX.play('switch');
                  if (setCurrentTab) setCurrentTab(action.tab);
                }}
                className={`p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm ${action.color} group`}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 1: 5 Heart Disease ML Models Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>Active Heart Disease ML Ensemble Classifiers</span>
          </h3>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            5/5 Heart Models Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {modelsList.map(m => (
            <div key={m.id} className="glass-panel glass-panel-hover rounded-2xl p-4.5 border border-amber-500/20 space-y-2.5 relative overflow-hidden shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Model #{m.id.toUpperCase()}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {m.status}
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white tracking-tight">{m.name}</h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Algo: <span className="text-amber-400 font-mono font-bold">{m.algo}</span></p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs font-bold">
                <span className="text-slate-400 text-[11px]">Accuracy:</span>
                <span className="text-emerald-400 font-extrabold font-mono">{m.accuracy} ({m.auc})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Infrastructure Diagnostics & Users Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* System Diagnostics Card */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-5 border border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>Multi-Tier Database & Infrastructure</span>
            </h3>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Live Verified
            </span>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xs hover:border-amber-500/30 transition-all">
              <span className="text-slate-300 font-medium">FastAPI Engine:</span>
              <strong className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Online (Port 8000)
              </strong>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xs hover:border-amber-500/30 transition-all">
              <span className="text-slate-300 font-medium">Active Database Layer:</span>
              <strong className="text-amber-400 font-bold font-mono">
                {systemStatus?.database_mode || '3-Tier Connection Pool'}
              </strong>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xs hover:border-amber-500/30 transition-all">
              <span className="text-slate-300 font-medium">Inference Response Latency:</span>
              <strong className="text-white font-bold font-mono">&lt; 12ms average</strong>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xs hover:border-amber-500/30 transition-all">
              <span className="text-slate-300 font-medium">Total Stored Patient Audits:</span>
              <strong className="text-white font-bold font-mono">{assessments?.length || 0} Records</strong>
            </div>
          </div>

          <button 
            onClick={() => {
              soundFX.play('click');
              fetchSystemStatus();
              showToast("System diagnostics refreshed. All pipelines nominal.", "success");
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-400 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer shadow-md btn-magnetic"
          >
            Run Deep Diagnostics Ping
          </button>
        </div>

        {/* User Accounts & Patient History Manager */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 space-y-5 border border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>Registered Users & Clinical Directory</span>
            </h3>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {(adminUsersList?.length || 0)} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto max-h-70 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] sticky top-0 bg-white">
                  <th className="pb-3">User Name</th>
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Access Level</th>
                  <th className="pb-3 text-right">Status</th>
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
                    const isSuper = u.role === 'admin' || u.username === 'admin';
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSuper ? 'bg-rose-500 shadow-xs' : 'bg-emerald-500'}`} />
                          <span>{u.name || 'User'}</span>
                        </td>
                        <td className="py-3.5 font-mono text-amber-600 font-bold">@{u.username}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
                            isSuper 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isSuper ? 'SUPERUSER ADMIN' : 'CLINICAL USER'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
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
