import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LayoutDashboard, HeartPulse, Stethoscope, Bot, 
  ClipboardList, TrendingUp, Settings, ShieldAlert, LogOut, 
  User, Zap, ChevronDown, Cpu, Sparkles, Activity, Search, Volume2, VolumeX, Command,
  Heart, ArrowRight, ShieldCheck, Clock, Layers, Sliders
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function Navbar({
  currentTab,
  setCurrentTab,
  resetWizard,
  userProfile,
  activeUser,
  setActiveUser: _setActiveUser,
  authToken,
  handleLogout,
  setShowSimulatorModal,
  setIsCommandPaletteOpen
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut to close sidebar on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const toggleAudio = () => {
    const newState = soundFX.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundFX.play('switch');
  };

  // Structured Categorized Nav Items
  const clinicalEngines = [
    { 
      id: 'dashboard', 
      label: 'AI Health Dashboard', 
      desc: 'Overview, 6-Organ Matrix & Telemetry',
      icon: LayoutDashboard,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    { 
      id: 'wizard', 
      label: 'Risk Assessor Wizard', 
      desc: 'Multi-Disease Prediction Engine',
      icon: HeartPulse, 
      onClick: resetWizard, 
      badge: 'AI ML',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    { 
      id: 'symptom_checker', 
      label: 'Symptom Checker & Triage', 
      desc: 'Anatomical Differential Diagnostic',
      icon: Stethoscope,
      badge: 'TRIAGE',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
    },
    { 
      id: 'chatbot', 
      label: 'HealthBot AI Assistant', 
      desc: '24/7 Voice & Clinical Guidance',
      icon: Bot, 
      badge: '24/7 VOICE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    }
  ];

  const patientRecords = [
    { 
      id: 'history', 
      label: 'Medical Audit History', 
      desc: 'Longitudinal Patient Assessments',
      icon: ClipboardList, 
      protected: true 
    },
    { 
      id: 'insights', 
      label: 'Biometric Analytics', 
      desc: 'Trend Trajectories & Shift Curves',
      icon: TrendingUp, 
      protected: true 
    }
  ];

  const administration = [
    ...(userProfile?.role === 'admin' ? [{
      id: 'admin_portal', 
      label: 'Admin Governance Console', 
      desc: 'Pipeline & System Health Diagnostics',
      icon: ShieldAlert, 
      badge: 'ADMIN',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }] : []),
    { 
      id: 'account', 
      label: 'Account & Security Settings', 
      desc: 'Credentials, Profile & Security',
      icon: Settings, 
      protected: true 
    }
  ];

  const handleTabChange = (item) => {
    soundFX.play('switch');
    if (item.onClick) item.onClick();
    setCurrentTab(item.id);
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-header no-print border-b border-amber-500/20 shadow-2xl backdrop-blur-2xl">
        {/* Animated Top Ambient Glowing Sweep Border */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-transparent via-amber-500 via-yellow-400 to-transparent animate-pulse" />

        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4 w-full">
            
            {/* Left Section: Hamburger Menu + Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              
              {/* Three Lines Hamburger Button */}
              <button
                onClick={() => {
                  soundFX.play('click');
                  setSidebarOpen(!sidebarOpen);
                }}
                className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all duration-300 cursor-pointer shadow-md hover:scale-105 active:scale-95 group"
                title="Open Clinical Navigation Menu"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>

              {/* Brand Logo & Interactive Title */}
              <div 
                className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
                onClick={() => {
                  soundFX.play('switch');
                  setCurrentTab('dashboard');
                }}
              >
                <div className="relative">
                  {/* Outer pulsing neon glow ring */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 opacity-40 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse" />
                  
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                      <img src="/logo.png" alt="HealthSence AI Logo" className="w-full h-full object-contain group-hover:rotate-6 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  </div>
                  
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-slate-950"></span>
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                      Health<span className="text-amber-500 font-black">Sence</span>
                    </span>
                    <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white text-[9px] sm:text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-lg shadow-md shadow-amber-500/30 uppercase">
                      AI
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 -mt-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                      Clinical Risk Intelligence
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-black">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" /> Online
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Section: Quick Command Bar & Live Telemetry */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Command Palette Launcher */}
              <button
                onClick={() => {
                  soundFX.play('click');
                  if (setIsCommandPaletteOpen) setIsCommandPaletteOpen(true);
                }}
                className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/25 hover:border-amber-400/60 text-slate-300 hover:text-white text-xs font-semibold shadow-inner transition-all group cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 group-hover:text-slate-200">Search modules or actions...</span>
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400">
                  <Command className="w-2.5 h-2.5" /> K
                </span>
              </button>

              {/* Real-time Telemetry ECG Heartbeat & System Clock */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-400">{systemTime}</span>
                <span className="text-amber-400/80 font-bold border-l border-slate-700 pl-2">12ms Latency</span>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">

              {/* Sound FX Audio Feedback Toggle Button */}
              <button
                onClick={toggleAudio}
                className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/80 hover:bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-xs"
                title={soundEnabled ? "Mute Clinical UI Audio" : "Enable Clinical UI Audio"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Live Risk Simulator Button */}
              <button
                onClick={() => {
                  soundFX.play('click');
                  setShowSimulatorModal(true);
                }}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-black transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-amber-500/30 cursor-pointer btn-magnetic group"
              >
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform animate-heartbeat" />
                <span>Risk Simulator</span>
              </button>

              {/* User Profile Avatar Dropdown */}
              {authToken ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      soundFX.play('click');
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }}
                    className="flex items-center gap-2 sm:gap-2.5 p-1.5 pl-2.5 sm:pl-3 rounded-2xl border border-amber-500/30 hover:border-amber-400 bg-slate-900/90 backdrop-blur-xl shadow-md transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1.5px] shadow-md shadow-amber-500/30">
                      <div className="w-full h-full bg-slate-950 rounded-[9px] text-amber-400 font-black text-xs flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-black text-slate-100 max-w-[110px] truncate group-hover:text-amber-400 transition-colors">
                        {userProfile?.name || activeUser || 'User'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {userProfile?.role || 'Clinician'}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-amber-400'}`} />
                  </button>

                  {profileDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2.5 w-60 glass-panel rounded-3xl shadow-2xl py-2.5 z-50 animate-modal-spring border border-amber-500/30"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-amber-500/15">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-black text-white truncate">{userProfile?.name || 'User Profile'}</p>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                            {userProfile?.role || 'Clinician'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold truncate">@{userProfile?.username || 'user'}</p>
                        
                        <div className="mt-2.5 p-2 rounded-xl bg-slate-950/80 border border-amber-500/20 flex items-center justify-between text-[10px] font-bold text-slate-300">
                          <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-amber-500" /> Health System</span>
                          <span className="text-emerald-400 font-black">Operational</span>
                        </div>
                      </div>

                      <div className="py-1 px-1.5 space-y-1">
                        <button
                          onClick={() => {
                            soundFX.play('click');
                            setCurrentTab('account');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-black text-slate-200 hover:bg-amber-500/15 hover:text-amber-400 flex items-center gap-2.5 transition-all cursor-pointer"
                        >
                          <User className="w-4 h-4 text-amber-500" />
                          <span>Account Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            soundFX.play('alert');
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 transition-all cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

            </div>

          </div>
        </div>
      </header>

      {/* Enhanced Dynamic Sidebar Drawer Backdrop & Sliding Dock */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] no-print">
          
          {/* Animated Dark Glass Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sliding Cyber-Medical Command Dock Container */}
          <aside className="absolute top-0 left-0 bottom-0 w-88 max-w-[88vw] bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 border-r border-amber-500/30 shadow-2xl backdrop-blur-3xl flex flex-col z-10 animate-modal-spring overflow-hidden">
            
            {/* Ambient Gold Edge Reflector */}
            <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 opacity-60 animate-pulse pointer-events-none" />

            {/* Sidebar Top Header & Telemetry Status */}
            <div className="p-5 border-b border-amber-500/20 bg-slate-900/70 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/30">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1.5">
                      <img src="/logo.png" alt="HealthSence AI Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-1.5">
                      Health<span className="text-amber-500">Sence</span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 uppercase font-mono">AI</span>
                    </h3>
                    <p className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Clinical Suite v2.6</span>
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    soundFX.play('click');
                    setSidebarOpen(false);
                  }}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-transform active:scale-90 cursor-pointer"
                  title="Close Navigation Menu (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Mini ECG Heartbeat Telemetry Strip */}
              <div className="mt-3.5 p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 animate-heartbeat shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white font-mono flex items-center gap-1">
                      72 BPM <span className="text-[9px] font-bold text-emerald-400">Normal Sinus</span>
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Telemetry Stream</span>
                  </div>
                </div>

                {/* Animated Mini Waveform */}
                <div className="flex items-center gap-0.5 h-4">
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-1" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-2" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-3" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-4" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-5" />
                </div>
              </div>
            </div>

            {/* Quick Command Launcher inside Sidebar */}
            <div className="px-4 pt-3">
              <button
                onClick={() => {
                  soundFX.play('click');
                  setSidebarOpen(false);
                  if (setIsCommandPaletteOpen) setIsCommandPaletteOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-amber-500/25 hover:border-amber-400/50 text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-inner group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-white">Command Center...</span>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400 font-mono">
                  Ctrl+K
                </span>
              </button>
            </div>

            {/* Scrollable Navigation Sections List */}
            <div className="flex-1 px-4 py-3 overflow-y-auto space-y-5 custom-scrollbar">
              
              {/* Section 1: Clinical Intelligence Engines */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-amber-400" />
                    <span>Clinical Diagnostic Engines</span>
                  </span>
                  <span className="text-[9px] font-black text-slate-500">4 Tools</span>
                </div>
                
                {clinicalEngines.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item);
                        setSidebarOpen(false);
                      }}
                      className={`group w-full p-3 rounded-2xl text-left transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-xl shadow-amber-500/30 border border-amber-300/50 scale-[1.02]'
                          : 'bg-slate-900/60 hover:bg-amber-500/15 border border-slate-800/80 hover:border-amber-500/30 text-slate-200 hover:text-white hover:translate-x-1'
                      }`}
                    >
                      {/* Left glowing border stripe on active */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_12px_#fff]" />
                      )}

                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-slate-800 text-amber-400 border border-amber-500/20'
                        }`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-100 group-hover:text-amber-400'}`}>
                            {item.label}
                          </span>
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                          isActive ? 'bg-white/25 text-white border-white/40' : item.badgeColor
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Section 2: Longitudinal Patient Intelligence */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-amber-400" />
                    <span>Longitudinal Patient Intelligence</span>
                  </span>
                  <span className="text-[9px] font-black text-slate-500">2 Views</span>
                </div>

                {patientRecords.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item);
                        setSidebarOpen(false);
                      }}
                      className={`group w-full p-3 rounded-2xl text-left transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-xl shadow-amber-500/30 border border-amber-300/50 scale-[1.02]'
                          : 'bg-slate-900/60 hover:bg-amber-500/15 border border-slate-800/80 hover:border-amber-500/30 text-slate-200 hover:text-white hover:translate-x-1'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_12px_#fff]" />
                      )}

                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-slate-800 text-amber-400 border border-amber-500/20'
                        }`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-100 group-hover:text-amber-400'}`}>
                            {item.label}
                          </span>
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-amber-400'
                      }`} />
                    </button>
                  );
                })}
              </div>

              {/* Section 3: Governance & Settings */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                    <Settings className="w-3 h-3 text-amber-400" />
                    <span>System Governance & Account</span>
                  </span>
                </div>

                {administration.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item);
                        setSidebarOpen(false);
                      }}
                      className={`group w-full p-3 rounded-2xl text-left transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-xl shadow-amber-500/30 border border-amber-300/50 scale-[1.02]'
                          : 'bg-slate-900/60 hover:bg-amber-500/15 border border-slate-800/80 hover:border-amber-500/30 text-slate-200 hover:text-white hover:translate-x-1'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_12px_#fff]" />
                      )}

                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-slate-800 text-amber-400 border border-amber-500/20'
                        }`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-100 group-hover:text-amber-400'}`}>
                            {item.label}
                          </span>
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {item.badge ? (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                          isActive ? 'bg-white/25 text-white border-white/40' : item.badgeColor
                        }`}>
                          {item.badge}
                        </span>
                      ) : (
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-amber-400'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Sidebar Footer Dock with Simulator Launcher & System Metrics */}
            <div className="p-4 border-t border-amber-500/20 bg-slate-900/80 space-y-3 shrink-0">
              
              {/* Quick Launch Biometrics Simulator */}
              <button
                onClick={() => {
                  soundFX.play('click');
                  setShowSimulatorModal(true);
                  setSidebarOpen(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-black transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer btn-magnetic group"
              >
                <Zap className="w-4 h-4 text-white group-hover:scale-125 transition-transform animate-heartbeat" />
                <span>Launch Biometrics Simulator</span>
              </button>

              {/* Patient Profile / Sign out Footer Tile */}
              {authToken ? (
                <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-black text-white truncate">{userProfile?.name || activeUser || 'Active Clinician'}</span>
                      <span className="text-[9px] text-slate-400 font-bold capitalize">{userProfile?.role || 'Clinician'} Account</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFX.play('alert');
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition cursor-pointer shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-amber-400" /> Neural Architecture</span>
                  <span className="text-emerald-400 font-black">Online v2.6</span>
                </div>
              )}
            </div>

          </aside>

        </div>
      )}
    </>
  );
}
