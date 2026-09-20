import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, HeartPulse, Stethoscope, Bot,
  ClipboardList, Settings, ShieldAlert, LogOut,
  Menu, X, ChevronDown, Zap, Volume2, VolumeX, Search,
  Database, Cpu, Users, BarChart3, RefreshCw, Terminal, User
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

/* ─────────────────────────────────────────────────────────────
   ADMIN NAVBAR — Rose-themed, admin-only controls
───────────────────────────────────────────────────────────── */
function AdminNavbar({
  currentTab, setCurrentTab, userProfile, authToken,
  handleLogout, setIsCommandPaletteOpen, handleRetrain, retraining,
  adminSection, setAdminSection
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSoundToggle = () => {
    const newState = soundFX.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundFX.play('click');
  };

  const adminActions = [
    { id: 'portal',  label: 'Control Suite',   shortLabel: 'Suite',     desc: 'Main admin dashboard',          targetId: 'admin-section-portal',  icon: ShieldAlert },
    { id: 'users',   label: 'User Management', shortLabel: 'User Mgmt', desc: 'Registered user directory',     targetId: 'admin-section-users',   icon: Users },
    { id: 'models',  label: 'ML Models',       shortLabel: 'ML Models', desc: 'Active Heart ML classifiers',   targetId: 'admin-section-models',  icon: Cpu },
    { id: 'logs',    label: 'Audit Logs',      shortLabel: 'Audit Logs',desc: 'Live security & audit stream',  targetId: 'admin-section-logs',    icon: Terminal },
    { id: 'db',      label: 'Database',        shortLabel: 'Database',  desc: 'Multi-tier database & storage', targetId: 'admin-section-db',      icon: Database },
    { id: 'metrics', label: 'Telemetry',       shortLabel: 'Telemetry', desc: 'Real-time telemetry & counters',targetId: 'admin-section-metrics', icon: BarChart3 },
  ];

  // Map anchor targets within admin portal
  const handleAdminNavClick = (sectionId, targetId) => {
    soundFX.play('switch');
    if (setAdminSection) setAdminSection(sectionId);
    if (currentTab !== 'admin_portal') {
      setCurrentTab('admin_portal');
    }
    setMobileMenuOpen(false);

    const performScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('admin-section-highlight');
        setTimeout(() => el.classList.remove('admin-section-highlight'), 2200);
      }
    };

    if (currentTab === 'admin_portal') {
      performScroll();
    } else {
      setTimeout(performScroll, 130);
    }
  };

  const isCurrentActive = (action) => {
    if (currentTab !== 'admin_portal') return false;
    if (adminSection) {
      return adminSection === action.id || adminSection === `admin_${action.id}`;
    }
    return action.id === 'portal';
  };

  return (
    <header className={`sticky top-0 z-50 no-print transition-all duration-300 ${scrolled ? 'shadow-2xl shadow-black/70' : ''}`}
      style={{ background: 'rgba(8, 4, 12, 0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(244, 63, 94, 0.2)' }}>

      {/* Top accent line — rose admin theme */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(244,63,94,0.8) 25%, rgba(251,113,133,0.6) 50%, rgba(244,63,94,0.5) 75%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'cyberGlowSweep 5s ease infinite'
        }}
      />

      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* ── Left Group: Brand Logo & Admin Suite Identity ── */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              onClick={() => handleAdminNavClick('portal', 'admin-section-portal')}
              className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
              title="HealthSence AI Admin Suite"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-linear-to-tr from-rose-500/30 to-rose-400/10 blur-sm group-hover:blur-md transition-all" style={{ animation: 'glowPulse 3s ease-in-out infinite' }} />
                <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-rose-500 via-rose-600 to-red-500 p-[1.5px] shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                    <img src="/logo.png" alt="HealthSence AI" className="w-full h-full object-contain drop-shadow" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[14px] sm:text-[15px] font-black text-white tracking-tight leading-none">
                  Health<span style={{ background: 'linear-gradient(135deg,#fb7185,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sence</span>
                  <span className="text-rose-400 ml-1 text-sm">AI</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.14em] mt-0.5 flex items-center gap-1" style={{ color: '#f43f5e' }}>
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span>Admin Suite</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="System Live" />
                </span>
              </div>
            </div>
          </div>

          {/* ── Admin Nav Pills — User Management and all buttons explicitly visible ── */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-2xl shrink-0"
            style={{ background: 'rgba(20, 4, 8, 0.85)', border: '1px solid rgba(244,63,94,0.18)', backdropFilter: 'blur(12px)' }}
            role="navigation"
            aria-label="Admin Navigation Tabs"
          >
            {adminActions.map((action) => {
              const Icon = action.icon;
              const active = isCurrentActive(action);
              return (
                <button
                  key={action.id}
                  id={`admin-nav-${action.id}`}
                  onClick={() => handleAdminNavClick(action.id, action.targetId)}
                  title={action.desc}
                  className={`flex items-center gap-1.5 px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                    active
                      ? 'text-white scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-rose-500/10 hover:scale-[1.01]'
                  }`}
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(244,63,94,0.92), rgba(225,29,72,0.95))',
                    boxShadow: '0 4px 14px rgba(244,63,94,0.4), 0 0 10px rgba(244,63,94,0.25)',
                    color: '#ffffff'
                  } : { background: 'transparent' }}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-rose-400'}`} />
                  <span className="font-bold hidden 2xl:inline">{action.label}</span>
                  <span className="font-bold inline 2xl:hidden">{action.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Right Action Area: Always includes Account & Profile ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">

            {/* Sound toggle */}
            <button
              onClick={handleSoundToggle}
              id="admin-navbar-sound-toggle"
              className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                soundEnabled
                  ? 'border-rose-500/25 text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10'
                  : 'border-white/10 text-slate-500 hover:text-slate-400'
              }`}
              style={{ background: 'rgba(15,4,8,0.7)' }}
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Retrain shortcut button */}
            {handleRetrain && (
              <button
                onClick={() => { soundFX.play('switch'); handleRetrain(); }}
                id="admin-navbar-retrain-btn"
                disabled={retraining}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all disabled:opacity-50 shrink-0"
                style={{
                  background: retraining ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.06)',
                  borderColor: 'rgba(245,158,11,0.3)',
                  color: '#fbbf24'
                }}
                title="Retrain Heart ML Models"
              >
                <Cpu className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
                <span className="hidden xl:inline">{retraining ? 'Training...' : 'Retrain ML'}</span>
              </button>
            )}

            {/* Command palette */}
            {setIsCommandPaletteOpen && (
              <button
                onClick={() => { soundFX.play('click'); setIsCommandPaletteOpen(true); }}
                id="admin-navbar-cmd-palette"
                className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer hover:bg-slate-800/60 shrink-0"
                style={{ background: 'rgba(15,4,8,0.5)', borderColor: 'rgba(255,255,255,0.08)' }}
                title="Open Command Palette (Ctrl+K)"
              >
                <Search className="w-3 h-3 text-slate-400" />
                <span>⌘K</span>
              </button>
            )}

            {/* ── Admin Account & Profile Dropdown (Guaranteed 100% Visible & Fully Padded) ── */}
            <div className="relative shrink-0">
              <button
                onClick={() => { soundFX.play('click'); setProfileDropdownOpen(!profileDropdownOpen); }}
                id="admin-navbar-profile-btn"
                className={`flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl border text-left transition-all cursor-pointer shadow-sm shrink-0 select-none ${
                  currentTab === 'account'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/30'
                    : 'bg-rose-500/12 hover:bg-rose-500/20 border-rose-500/35 hover:border-rose-500/60'
                }`}
                title="Account Settings & Profile"
              >
                {/* Rose account icon avatar */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md bg-linear-to-br from-rose-500 via-rose-600 to-red-500 text-white shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col leading-none shrink-0">
                  <span className="text-[11px] font-black text-white max-w-21.25 truncate">
                    {userProfile?.username ? `@${userProfile.username}` : (userProfile?.name?.includes('Administrator') ? 'Admin' : (userProfile?.name || 'Admin'))}
                  </span>
                  <span className="text-[9px] font-extrabold text-rose-300 mt-0.5 flex items-center gap-1">
                    <User className="w-2.5 h-2.5 text-rose-300" /> Account <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-rose-200' : ''}`} />
                  </span>
                </div>
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-2xl p-2 z-50 space-y-1 animate-modal-spring shadow-2xl"
                  style={{ background: 'rgba(10,4,10,0.98)', border: '1px solid rgba(244,63,94,0.3)', backdropFilter: 'blur(20px)' }}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  {/* Admin info header */}
                  <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid rgba(244,63,94,0.15)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-linear-to-br from-rose-500 to-rose-600 text-white"
                        style={{ boxShadow: '0 0 12px rgba(244,63,94,0.3)' }}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white truncate">{userProfile?.name || 'Administrator'}</p>
                        <p className="text-[10px] font-medium flex items-center gap-1" style={{ color: '#fb7185' }}>
                          <User className="w-3 h-3 text-rose-400" /> @{userProfile?.username || 'admin'} · Superuser
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { handleAdminNavClick('portal', 'admin-section-portal'); setProfileDropdownOpen(false); }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-rose-500/10 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="p-1 rounded-lg" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)' }}>
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <span>Admin Control Suite</span>
                  </button>

                  <button
                    onClick={() => { soundFX.play('switch'); setCurrentTab('account'); setProfileDropdownOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                      currentTab === 'account' ? 'bg-amber-500/20 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
                      <Settings className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span>Account Settings</span>
                  </button>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => { soundFX.play('alert'); handleLogout(); setProfileDropdownOpen(false); }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => { soundFX.play('click'); setMobileMenuOpen(!mobileMenuOpen); }}
              className="md:hidden p-2 rounded-xl border text-slate-400 hover:text-white transition cursor-pointer"
              style={{ background: 'rgba(15,4,8,0.7)', borderColor: 'rgba(244,63,94,0.15)' }}
              aria-label="Toggle admin menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Admin Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 space-y-1 animate-tab-fade"
          style={{ background: 'rgba(10,4,10,0.98)', borderTop: '1px solid rgba(244,63,94,0.2)' }}>
          <p className="text-[9px] font-black uppercase tracking-widest px-1 pb-1 text-rose-500/70">Admin Navigation</p>
          {adminActions.map((action) => {
            const Icon = action.icon;
            const active = isCurrentActive(action);
            return (
              <button
                key={action.id}
                onClick={() => handleAdminNavClick(action.id, action.targetId)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-rose-500/20 text-white border border-rose-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-rose-500/8'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-rose-400' : 'text-rose-500/80'}`} />
                <div className="text-left">
                  <div className={`font-black ${active ? 'text-white' : 'text-slate-200'}`}>{action.label}</div>
                  <div className="text-[10px] text-slate-500">{action.desc}</div>
                </div>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </button>
            );
          })}
          <div className="pt-2 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => { soundFX.play('switch'); setCurrentTab('account'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Account Settings</span>
            </button>
            <button
              onClick={() => { soundFX.play('alert'); handleLogout(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/8 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   USER NAVBAR — Amber health-themed, clinical user controls
───────────────────────────────────────────────────────────── */
function UserNavbar({
  currentTab, setCurrentTab, resetWizard, userProfile,
  activeUser, authToken, handleLogout, setShowSimulatorModal, setIsCommandPaletteOpen
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'dashboard',       label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'wizard',          label: 'Heart Risk',  icon: HeartPulse, onClick: resetWizard },
    { id: 'symptom_checker', label: 'Symptoms',   icon: Stethoscope },
    { id: 'chatbot',         label: 'Cardio AI',  icon: Bot },
    { id: 'history',         label: 'History',    icon: ClipboardList },
  ];

  const handleNavClick = (link) => {
    soundFX.play('switch');
    if (link.onClick) link.onClick();
    setCurrentTab(link.id);
    setMobileMenuOpen(false);
  };

  const handleSoundToggle = () => {
    const newState = soundFX.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundFX.play('click');
  };

  return (
    <header className={`sticky top-0 z-50 glass-header no-print transition-all duration-300 ${scrolled ? 'shadow-2xl shadow-black/50' : ''}`}>
      {/* Top amber accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 20%, rgba(16,185,129,0.5) 50%, rgba(6,182,212,0.4) 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'cyberGlowSweep 6s ease infinite'
        }}
      />

      <div className="w-full max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* ── Brand Logo ── */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={() => { soundFX.play('switch'); setCurrentTab('dashboard'); }}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-linear-to-tr from-amber-500/30 to-yellow-400/20 blur-sm group-hover:blur-md transition-all animate-glow-pulse" />
                <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-amber-500 via-amber-600 to-yellow-400 p-[1.5px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden">
                    <img src="/logo.png" alt="HealthSence AI" className="w-full h-full object-contain drop-shadow" />
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-[15px] font-black text-white tracking-tight leading-none">
                  Health<span className="text-gradient-amber">Sence</span>
                  <span className="text-amber-400 ml-1 text-sm">AI</span>
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-0.5">
                  Precision Cardio
                </span>
              </div>
            </div>

            {/* Live ECG indicator (desktop) */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-white/8 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="font-bold">72 BPM</span>
                <span className="opacity-40">·</span>
                <span>NSR</span>
              </div>
              <svg className="w-16 h-5 text-emerald-400 opacity-55" viewBox="0 0 80 24" fill="none">
                <path d="M0 12 L22 12 L27 4 L33 20 L38 8 L43 16 L48 12 L80 12"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="animate-ecg" />
              </svg>
            </div>
          </div>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-white/8 shadow-inner backdrop-blur-xl flex-1 max-w-xl mx-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  id={`nav-${link.id}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black tracking-wide transition-all duration-200 cursor-pointer flex-1 justify-center whitespace-nowrap ${
                    isActive
                      ? 'bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-white/6 hover:scale-[1.01]'
                  }`}
                  aria-label={link.label}
                  title={link.label}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                  <span className="hidden lg:inline">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Sound toggle */}
            <button
              onClick={handleSoundToggle}
              id="navbar-sound-toggle"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-900/70 border-white/8 text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/8'
                  : 'bg-slate-900/40 border-white/5 text-slate-600 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Mute Interface Audio' : 'Unmute Interface Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Simulator button */}
            <div className="relative group hidden lg:block">
              <button
                onClick={() => { soundFX.play('click'); setShowSimulatorModal(true); }}
                id="navbar-simulator-btn"
                className="p-2 rounded-xl bg-slate-900/70 hover:bg-amber-500/10 border border-white/8 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 transition-all cursor-pointer flex items-center justify-center"
                title="Open What-If Risk Simulator"
              >
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap">
                <div className="tooltip-popup px-2.5 py-1 rounded-lg text-[10px] font-bold text-white">
                  What-If Simulator
                </div>
              </div>
            </div>

            {/* Command palette */}
            {setIsCommandPaletteOpen && (
              <button
                onClick={() => { soundFX.play('click'); setIsCommandPaletteOpen(true); }}
                id="navbar-cmd-palette"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/50 border border-white/8 text-[10px] font-mono text-slate-500 hover:text-slate-200 hover:border-white/18 transition cursor-pointer hover:bg-slate-800/60"
                title="Open Command Palette (Ctrl+K)"
              >
                <Search className="w-3 h-3" />
                <span>⌘K</span>
              </button>
            )}

            {/* Profile Dropdown */}
            {(authToken || userProfile) && (
              <div className="relative shrink-0">
                <button
                  onClick={() => { soundFX.play('click'); setProfileDropdownOpen(!profileDropdownOpen); }}
                  id="navbar-profile-btn"
                  className={`flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl border transition-all cursor-pointer shrink-0 text-left ${
                    currentTab === 'account'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25'
                      : 'border-white/10 hover:border-amber-500/40 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200'
                  }`}
                  title="Account Settings & Profile"
                >
                  {/* User account icon avatar */}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-linear-to-br from-amber-500 to-yellow-400 text-slate-950 shadow-sm shrink-0">
                    <User className="w-4 h-4 text-slate-950" />
                  </div>
                  <div className="hidden sm:flex flex-col leading-none">
                    <span className="text-[11px] font-black text-slate-200 max-w-24 truncate">
                      {userProfile?.name || activeUser || 'User'}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 mt-0.5 flex items-center gap-1">
                      <User className="w-2.5 h-2.5" /> Account
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 z-50 space-y-1 animate-modal-spring border border-white/12 shadow-2xl"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2.5 border-b border-white/8 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-linear-to-br from-amber-500 to-yellow-400 text-slate-950 shrink-0">
                          <User className="w-4.5 h-4.5 text-slate-950" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white truncate">{userProfile?.name || 'User Profile'}</p>
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-amber-400" /> @{userProfile?.username || 'user'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { soundFX.play('switch'); setCurrentTab('account'); setProfileDropdownOpen(false); }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-white/8 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="p-1 rounded-lg bg-amber-500/12 border border-amber-500/25">
                        <Settings className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <span>Account Settings</span>
                    </button>

                    <div className="border-t border-white/8 mt-1 pt-1">
                      <button
                        onClick={() => { soundFX.play('alert'); handleLogout(); setProfileDropdownOpen(false); }}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/8 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => { soundFX.play('click'); setMobileMenuOpen(!mobileMenuOpen); }}
              className="md:hidden p-2 rounded-xl bg-slate-900/70 border border-white/8 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile User Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/8 px-4 py-3 space-y-1 animate-tab-fade">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                <span>{link.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   DEFAULT EXPORT — Routes to correct navbar by role
───────────────────────────────────────────────────────────── */
export default function Navbar(props) {
  const isAdmin = props.userProfile?.role === 'admin';
  return isAdmin
    ? <AdminNavbar {...props} />
    : <UserNavbar {...props} />;
}
