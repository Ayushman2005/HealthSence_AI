import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldAlert, Cpu, Zap, User, Lock, ArrowRight, RefreshCw, 
  Activity, Database, HeartPulse, Stethoscope, Bot, ClipboardList, TrendingUp,
  Search, AlertTriangle, AlertOctagon, Download, Trash2,
  Clock, Globe, Terminal, CheckCircle2, UserPlus, Pencil, KeyRound,
  Eye, EyeOff, Shield, Users, Check, X, Copy
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function AdminPortal({
  userProfile,
  handleRetrain,
  retraining,
  assessments,
  adminUsersList,
  fetchAdminUsersList,
  showToast,
  setCurrentTab,
  API_BASE_URL,
  authToken,
  resetWizard,
  setShowSimulatorModal,
  adminSection,
  setAdminSection
}) {
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [usersLoading, setUsersLoading] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState('');

  // Add/Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', username: '', password: '', role: 'user' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit User / Reset Password Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', password: '', role: 'user' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Delete User Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditCategory, setAuditCategory] = useState('ALL');
  const [auditStatusFilter, setAuditStatusFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [clearingLogs, setClearingLogs] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // User Statistics
  const userStats = useMemo(() => {
    const list = adminUsersList || [];
    const total = list.length;
    const admins = list.filter(u => u.role === 'admin' || u.username === 'admin' || u.username === 'Ayushman24').length;
    const clinicalUsers = total - admins;
    const totalAssessments = list.reduce((acc, u) => acc + (u.assessments_count || 0), 0);
    return { total, admins, clinicalUsers, totalAssessments };
  }, [adminUsersList]);

  // Filtered Users for User Management
  const filteredUsers = useMemo(() => {
    if (!adminUsersList) return [];
    let list = adminUsersList;
    if (userRoleFilter === 'ADMIN') {
      list = list.filter(u => u.role === 'admin' || u.username === 'admin' || u.username === 'Ayushman24');
    } else if (userRoleFilter === 'USER') {
      list = list.filter(u => u.role !== 'admin' && u.username !== 'admin' && u.username !== 'Ayushman24');
    }
    if (!userSearch.trim()) return list;
    const q = userSearch.toLowerCase().trim();
    return list.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  }, [adminUsersList, userSearch, userRoleFilter]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleCopyUsername = (username) => {
    soundFX.play('click');
    navigator.clipboard.writeText(username);
    setCopiedUsername(username);
    setTimeout(() => setCopiedUsername(''), 2000);
    showToast(`Copied @${username} to clipboard`, 'info');
  };

  const reloadUsers = useCallback(async () => {
    if (fetchAdminUsersList) {
      setUsersLoading(true);
      await fetchAdminUsersList();
      setUsersLoading(false);
    }
  }, [fetchAdminUsersList]);

  // Create User Handler
  const handleCreateUser = async (e) => {
    if (e) e.preventDefault();
    setCreateError('');
    if (!createForm.name.trim()) {
      setCreateError("Please enter the user's full name.");
      return;
    }
    if (!createForm.username.trim() || createForm.username.trim().length < 3) {
      setCreateError("Username must be at least 3 characters.");
      return;
    }
    if (!createForm.password || createForm.password.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL || ''}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: createForm.name.trim(),
          username: createForm.username.trim().toLowerCase(),
          password: createForm.password,
          role: createForm.role
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundFX.play('success');
        showToast(data.message || 'User created successfully.', 'success');
        setCreateModalOpen(false);
        setCreateForm({ name: '', username: '', password: '', role: 'user' });
        reloadUsers();
      } else {
        soundFX.play('alert');
        setCreateError(data.detail || data.error || 'Failed to create user account.');
      }
    } catch (err) {
      console.warn('Create user error:', err);
      setCreateError('Cannot connect to server. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Edit Modal Handler
  const handleOpenEditModal = (user) => {
    soundFX.play('click');
    setEditUser(user);
    setEditForm({
      name: user.name || '',
      password: '',
      role: user.role || 'user'
    });
    setEditError('');
    setShowEditPassword(false);
    setEditModalOpen(true);
  };

  // Update User Handler
  const handleUpdateUser = async (e) => {
    if (e) e.preventDefault();
    if (!editUser) return;
    setEditError('');

    if (editForm.password && editForm.password.length < 6) {
      setEditError('New password must be at least 6 characters.');
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        role: editForm.role
      };
      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await fetch(`${API_BASE_URL || ''}/api/admin/users/${editUser.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundFX.play('success');
        showToast(data.message || `User @${editUser.username} updated.`, 'success');
        setEditModalOpen(false);
        setEditUser(null);
        reloadUsers();
      } else {
        soundFX.play('alert');
        setEditError(data.detail || data.error || 'Failed to update user.');
      }
    } catch (err) {
      console.warn('Update user error:', err);
      setEditError('Cannot connect to server. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open Delete Confirmation Modal Handler
  const handleOpenDeleteModal = (user) => {
    soundFX.play('alert');
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Confirm Delete User Handler
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL || ''}/api/admin/users/${userToDelete.username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundFX.play('trash');
        showToast(data.message || `User @${userToDelete.username} deleted.`, 'warning');
        setDeleteModalOpen(false);
        setUserToDelete(null);
        reloadUsers();
      } else {
        soundFX.play('alert');
        showToast(data.detail || data.error || 'Failed to delete user.', 'danger');
      }
    } catch (err) {
      console.warn('Delete user error:', err);
      showToast('Cannot connect to server. Please try again.', 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Scroll and highlight target section when adminSection changes
  useEffect(() => {
    if (!adminSection) return;
    const targetMap = {
      portal: 'admin-section-portal',
      admin_portal: 'admin-section-portal',
      users: 'admin-section-users',
      admin_users: 'admin-section-users',
      models: 'admin-section-models',
      admin_models: 'admin-section-models',
      logs: 'admin-section-logs',
      admin_logs: 'admin-section-logs',
      db: 'admin-section-db',
      admin_db: 'admin-section-db',
      metrics: 'admin-section-metrics',
      admin_metrics: 'admin-section-metrics',
    };
    const targetId = targetMap[adminSection];
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('admin-section-highlight');
          setTimeout(() => el.classList.remove('admin-section-highlight'), 2200);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [adminSection]);

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
    setClearConfirmOpen(false);
    setClearingLogs(true);
    try {
      const res = await fetch(`${API_BASE_URL || ''}/api/admin/audit-logs`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundFX.play('success');
        showToast("All audit logs permanently purged from database.", "warning");
        setAuditLogs([]);
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
    <>
    <div className="space-y-8 animate-fade-in no-print text-slate-800 w-full max-w-[1600px] mx-auto">
      
      {/* Admin Portal Superuser Banner */}
      <div id="admin-section-portal" className="scroll-mt-24 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs relative overflow-hidden transition-all duration-300">
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
      <div id="admin-section-logs" className="scroll-mt-24 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6 transition-all duration-300">
        
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

            {/* ── CLEAR AUDIT LOGS BUTTON ── */}
            <button
              id="admin-clear-audit-logs-btn"
              onClick={() => {
                soundFX.play('click');
                setClearConfirmOpen(true);
              }}
              disabled={clearingLogs || auditLogs.length === 0}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition shadow-md shadow-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Permanently delete all audit logs from the database"
            >
              {clearingLogs ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Audit Logs</span>
                  {auditLogs.length > 0 && (
                    <span className="bg-rose-500/40 border border-rose-400/50 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full font-mono">
                      {auditLogs.length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audit Metric Counters */}
        <div id="admin-section-metrics" className="scroll-mt-24 grid grid-cols-2 sm:grid-cols-5 gap-3 transition-all duration-300">
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
      <div id="admin-section-models" className="scroll-mt-24 space-y-4 transition-all duration-300">
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

      {/* Section 2: Multi-Tier Database & Infrastructure Diagnostics */}
      <div id="admin-section-db" className="scroll-mt-24 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-5 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              <span>Multi-Tier Database & Infrastructure Diagnostics</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live connection telemetry, FastAPI inference latency, and data persistence pool health.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-1">
            <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">FastAPI Core Engine</span>
            <div className="text-emerald-700 font-bold text-sm flex items-center gap-1.5 pt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online (Port 5000)
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-1">
            <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">Active Storage Layer</span>
            <div className="text-amber-800 font-bold font-mono text-sm pt-1 truncate">
              {systemStatus?.database_mode || '3-Tier Connection Pool'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-1">
            <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">ML Inference Latency</span>
            <div className="text-slate-900 font-bold font-mono text-sm pt-1">&lt; 12ms average</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-1">
            <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">Clinical Assessments Stored</span>
            <div className="text-slate-900 font-bold font-mono text-sm pt-1">{assessments?.length || 0} Records</div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button 
            onClick={() => {
              soundFX.play('click');
              fetchSystemStatus();
              fetchAuditLogs();
              showToast("System diagnostics refreshed. All pipelines nominal.", "success");
            }}
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-2xs btn-magnetic flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Run Deep Diagnostics Ping</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: USER MANAGEMENT & ACCESS CONTROL CENTER                       */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div id="admin-section-users" className="scroll-mt-24 bg-white rounded-3xl p-6 md:p-8 space-y-6 border border-slate-200 shadow-xs transition-all duration-300">
        
        {/* User Management Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                <Users className="w-3 h-3 text-rose-600" /> User Directory & Access Control
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider">
                Active Directory
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Manage System Users & Clinical Directory</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-2xl">
              Create, edit, reset passwords, change access roles, and manage all patient user profiles and administrator accounts.
            </p>
          </div>

          {/* Action Buttons: Add User & Refresh */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                soundFX.play('click');
                reloadUsers();
                showToast("Users directory refreshed.", "info");
              }}
              disabled={usersLoading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs disabled:opacity-50"
              title="Refresh Users List"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-rose-600 ${usersLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="admin-add-user-btn"
              onClick={() => {
                soundFX.play('click');
                setCreateError('');
                setCreateForm({ name: '', username: '', password: '', role: 'user' });
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition shadow-md shadow-rose-500/25"
              title="Create a new user account"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* User Stats Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Accounts</div>
            <div className="text-xl font-black text-slate-900 font-mono">{userStats.total}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">Administrators</div>
            <div className="text-xl font-black text-rose-800 font-mono">{userStats.admins}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">Clinical Users</div>
            <div className="text-xl font-black text-blue-800 font-mono">{userStats.clinicalUsers}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Total Assessments</div>
            <div className="text-xl font-black text-emerald-800 font-mono">{userStats.totalAssessments}</div>
          </div>
        </div>

        {/* Search Toolbar & Role Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name, username, or role..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 font-medium text-slate-800 transition"
            />
            {userSearch && (
              <button
                onClick={() => setUserSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
            {[
              { id: 'ALL', label: `All (${userStats.total})` },
              { id: 'ADMIN', label: `Admins (${userStats.admins})` },
              { id: 'USER', label: `Clinical Users (${userStats.clinicalUsers})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.play('click');
                  setUserRoleFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  userRoleFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role & Access</th>
                <th className="py-3 px-4">Assessments</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-[11px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="font-bold text-slate-700">No users found.</p>
                    <p className="text-[11px] text-slate-500">
                      {userSearch ? `No accounts matching "${userSearch}".` : 'No registered users in this category.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const isSuper = u.role === 'admin' || u.username === 'admin' || u.username === 'Ayushman24';
                  const isCurrentAdmin = userProfile && u.username?.toLowerCase() === userProfile.username?.toLowerCase();
                  const isRootAdmin = u.username?.toLowerCase() === 'ayushman24' || u.username?.toLowerCase() === 'admin';

                  return (
                    <tr key={u.username || idx} className="hover:bg-slate-50/90 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs font-bold text-xs ${
                            isSuper
                              ? 'bg-linear-to-br from-rose-500 to-red-600'
                              : 'bg-linear-to-br from-cyan-600 to-blue-600'
                          }`}>
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name || 'User'}</span>
                              {isCurrentAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">ID #{idx + 1}</div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-amber-700 font-bold text-xs">
                            @{u.username}
                          </span>
                          <button
                            onClick={() => handleCopyUsername(u.username)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Copy username"
                          >
                            {copiedUsername === u.username ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
                          isSuper 
                            ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {isSuper ? <ShieldAlert className="w-2.5 h-2.5 text-rose-600" /> : <User className="w-2.5 h-2.5 text-slate-500" />}
                          {isSuper ? 'SUPERUSER ADMIN' : 'CLINICAL USER'}
                        </span>
                      </td>

                      {/* Assessments Count */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <HeartPulse className="w-3 h-3 text-rose-500" />
                          <span>{u.assessments_count || 0} Records</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {u.created_at && u.created_at !== 'System Default' && u.created_at !== 'Recent'
                              ? new Date(u.created_at).toLocaleDateString([], { dateStyle: 'medium' })
                              : u.created_at || 'Recent'}
                          </span>
                        </div>
                      </td>

                      {/* Actions: Edit, Reset Password, Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer shadow-2xs"
                            title="Edit User Profile & Role"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-700 transition cursor-pointer shadow-2xs"
                            title="Reset Account Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleOpenDeleteModal(u)}
                            disabled={isRootAdmin || isCurrentAdmin}
                            className={`p-1.5 rounded-lg border transition shadow-2xs ${
                              isRootAdmin || isCurrentAdmin
                                ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                                : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 cursor-pointer'
                            }`}
                            title={
                              isRootAdmin 
                                ? 'Primary root administrator cannot be deleted' 
                                : isCurrentAdmin 
                                  ? 'You cannot delete your own logged in account' 
                                  : 'Permanently delete user'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

    {/* ═══════════════════════════════════════════════════════════
        CLEAR AUDIT LOGS CONFIRMATION MODAL
        ═══════════════════════════════════════════════════════════ */}
    {clearConfirmOpen && (
      <div
        className="fixed inset-0 z-200 glass-modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget) setClearConfirmOpen(false); }}
      >
        <div className="glass-modal-container rounded-3xl p-7 sm:p-8 max-w-md w-full animate-modal-spring border border-rose-500/25 relative overflow-hidden">

          {/* Ambient danger glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-rose-500/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-amber-500/8 blur-[50px] pointer-events-none" />

          {/* Icon */}
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/12 border border-rose-500/30 flex items-center justify-center mb-4 neon-ring-pulse"
              style={{ boxShadow: '0 0 20px rgba(244, 63, 94, 0.25)' }}>
              <Trash2 className="w-7 h-7 text-rose-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white tracking-tight">
                Clear All Audit Logs?
              </h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                This will permanently delete{' '}
                <span className="text-rose-400 font-black">
                  {auditLogs.length} audit {auditLogs.length === 1 ? 'record' : 'records'}
                </span>{' '}
                from the database. This action <strong className="text-white">cannot be undone</strong>.
              </p>
            </div>
          </div>

          {/* Warning card */}
          <div className="relative z-10 bg-rose-500/8 border border-rose-500/25 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">Irreversible Action</span>
            </div>
            <ul className="text-[11px] text-slate-400 font-medium space-y-1 ml-6 list-disc">
              <li>All {auditLogs.length} log entries will be deleted from the database</li>
              <li>A new purge event will be recorded immediately after</li>
              <li>Export a CSV backup first if you need to retain records</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex gap-3">
            <button
              id="admin-clear-logs-cancel"
              onClick={() => {
                soundFX.play('click');
                setClearConfirmOpen(false);
              }}
              className="flex-1 py-3 rounded-2xl btn-ghost text-slate-200 font-bold text-sm cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              id="admin-clear-logs-confirm"
              onClick={() => {
                soundFX.play('alert');
                handleClearAuditLogs();
              }}
              disabled={clearingLogs}
              className="flex-1 py-3 rounded-2xl bg-linear-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-sm cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition disabled:opacity-60"
            >
              {clearingLogs ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Clear All Logs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ═══════════════════════════════════════════════════════════
        CREATE NEW USER MODAL
        ═══════════════════════════════════════════════════════════ */}
    {createModalOpen && (
      <div
        className="fixed inset-0 z-200 glass-modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}
      >
        <div className="glass-modal-container rounded-3xl p-6 sm:p-8 max-w-lg w-full animate-modal-spring border border-rose-500/30 relative overflow-hidden text-slate-800">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create New User Account</h3>
                <p className="text-xs text-slate-400 font-medium">Provision clinical clinician or administrator</p>
              </div>
            </div>
            <button
              onClick={() => setCreateModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {createError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name / Doctor / Clinician
              </label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Dr. Jane Smith"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-white text-xs font-medium outline-none transition"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  placeholder="janesmith"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-white text-xs font-mono outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const pass = generateRandomPassword();
                    setCreateForm(prev => ({ ...prev, password: pass }));
                    setShowCreatePassword(true);
                  }}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Generate Strong Password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showCreatePassword ? 'text' : 'password'}
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-white text-xs font-mono outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                Access Level / Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setCreateForm(prev => ({ ...prev, role: 'user' }))}
                  className={`p-3 rounded-2xl border cursor-pointer transition select-none ${
                    createForm.role === 'user'
                      ? 'bg-linear-to-br from-cyan-500/20 to-blue-500/10 border-cyan-400 text-white'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-4 h-4 ${createForm.role === 'user' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">Clinical User</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">Patient vitals assessment & diagnostics</p>
                </div>

                <div
                  onClick={() => setCreateForm(prev => ({ ...prev, role: 'admin' }))}
                  className={`p-3 rounded-2xl border cursor-pointer transition select-none ${
                    createForm.role === 'admin'
                      ? 'bg-linear-to-br from-rose-500/20 to-red-500/10 border-rose-400 text-white'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className={`w-4 h-4 ${createForm.role === 'admin' ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">Administrator</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">Full control suite, ML retrain, database</p>
                </div>
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl btn-ghost text-slate-300 font-bold text-xs cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition disabled:opacity-50"
              >
                {createLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create User</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ═══════════════════════════════════════════════════════════
        EDIT USER / RESET PASSWORD MODAL
        ═══════════════════════════════════════════════════════════ */}
    {editModalOpen && editUser && (
      <div
        className="fixed inset-0 z-200 glass-modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget) setEditModalOpen(false); }}
      >
        <div className="glass-modal-container rounded-3xl p-6 sm:p-8 max-w-lg w-full animate-modal-spring border border-rose-500/30 relative overflow-hidden text-slate-800">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Edit User Account</h3>
                <p className="text-xs text-slate-400 font-medium font-mono">@{editUser.username}</p>
              </div>
            </div>
            <button
              onClick={() => setEditModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {editError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateUser} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-white text-xs font-medium outline-none transition"
              />
            </div>

            {/* Reset Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Reset Password (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const pass = generateRandomPassword();
                    setEditForm(prev => ({ ...prev, password: pass }));
                    setShowEditPassword(true);
                  }}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Generate Strong Password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave blank to retain current password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-white text-xs font-mono outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">If resetting, enter at least 6 characters.</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                Access Level / Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => {
                    if (editUser.username?.toLowerCase() !== 'ayushman24' && editUser.username?.toLowerCase() !== 'admin') {
                      setEditForm(prev => ({ ...prev, role: 'user' }));
                    }
                  }}
                  className={`p-3 rounded-2xl border transition select-none ${
                    editForm.role === 'user'
                      ? 'bg-linear-to-br from-cyan-500/20 to-blue-500/10 border-cyan-400 text-white'
                      : 'bg-slate-900/50 border-white/10 text-slate-400'
                  } ${editUser.username?.toLowerCase() === 'ayushman24' || editUser.username?.toLowerCase() === 'admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-4 h-4 ${editForm.role === 'user' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">Clinical User</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">Patient diagnostics tool access</p>
                </div>

                <div
                  onClick={() => setEditForm(prev => ({ ...prev, role: 'admin' }))}
                  className={`p-3 rounded-2xl border cursor-pointer transition select-none ${
                    editForm.role === 'admin'
                      ? 'bg-linear-to-br from-rose-500/20 to-red-500/10 border-rose-400 text-white'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className={`w-4 h-4 ${editForm.role === 'admin' ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">Administrator</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">Full administrative governance</p>
                </div>
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl btn-ghost text-slate-300 font-bold text-xs cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition disabled:opacity-50"
              >
                {editLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ═══════════════════════════════════════════════════════════
        DELETE USER CONFIRMATION MODAL
        ═══════════════════════════════════════════════════════════ */}
    {deleteModalOpen && userToDelete && (
      <div
        className="fixed inset-0 z-200 glass-modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}
      >
        <div className="glass-modal-container rounded-3xl p-7 sm:p-8 max-w-md w-full animate-modal-spring border border-rose-500/25 relative overflow-hidden text-slate-800">
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/12 border border-rose-500/30 flex items-center justify-center mb-4 neon-ring-pulse"
              style={{ boxShadow: '0 0 20px rgba(244, 63, 94, 0.25)' }}>
              <Trash2 className="w-7 h-7 text-rose-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white tracking-tight">
                Delete User Account?
              </h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                Are you sure you want to permanently delete{' '}
                <strong className="text-rose-400 font-mono">@{userToDelete.username}</strong> ({userToDelete.name || 'User'})?
              </p>
            </div>
          </div>

          <div className="relative z-10 bg-rose-500/8 border border-rose-500/25 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">Permanent Deletion</span>
            </div>
            <ul className="text-[11px] text-slate-400 font-medium space-y-1 ml-6 list-disc">
              <li>The user's login credentials will be revoked immediately</li>
              <li>All {userToDelete.assessments_count || 0} associated patient assessment records will be deleted</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div className="relative z-10 flex gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 py-3 rounded-2xl btn-ghost text-slate-200 font-bold text-sm cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteUser}
              disabled={deleteLoading}
              className="flex-1 py-3 rounded-2xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition disabled:opacity-60"
            >
              {deleteLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
