import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LayoutDashboard, HeartPulse, Stethoscope, Bot, FileText, 
  ClipboardList, TrendingUp, Settings, ShieldAlert, LogOut, 
  User, Zap, ChevronDown, Cpu, Sparkles, Activity, Search, Volume2, VolumeX, Command
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function Navbar({
  currentTab,
  setCurrentTab,
  resetWizard,
  userProfile,
  activeUser,
  setActiveUser,
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

  const toggleAudio = () => {
    const newState = soundFX.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundFX.play('switch');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wizard', label: 'Risk Assessor', icon: HeartPulse, onClick: resetWizard, badge: 'LIVE' },
    { id: 'symptom_checker', label: 'Symptom Checker', icon: Stethoscope },
    { id: 'chatbot', label: 'AI Healthbot', icon: Bot, badge: '24/7' },
    { id: 'upload_report', label: 'Report Analyzer', icon: FileText, badge: 'OCR' },
    { id: 'history', label: 'Medical History', icon: ClipboardList, protected: true },
    { id: 'insights', label: 'Health Analytics', icon: TrendingUp, protected: true },
    { id: 'account', label: 'My Account', icon: Settings, protected: true },
  ];

  if (userProfile?.role === 'admin') {
    navItems.push({ id: 'admin_portal', label: 'Admin Console', icon: ShieldAlert, badge: 'ADMIN' });
  }

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
                title="Open Main Menu"
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

      {/* Hamburger Sidebar Drawer Backdrop & Sliding Panel */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] no-print">
          
          {/* Dark Glass Overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sliding Drawer Container */}
          <aside className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-950/95 border-r border-amber-500/30 shadow-2xl backdrop-blur-2xl flex flex-col z-10 animate-modal-spring overflow-hidden">
            
            {/* Drawer Top Header */}
            <div className="p-5 border-b border-amber-500/20 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1.5px] shadow-md shadow-amber-500/30">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-1">
                    <img src="/logo.png" alt="HealthSence AI Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Health<span className="text-amber-500">Sence</span> AI</h3>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Clinical Navigation Menu</p>
                </div>
              </div>

              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Functions List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 py-1">Clinical Applications</p>
              
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabChange(item);
                      setSidebarOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/35 border border-amber-300/40 translate-x-1'
                        : 'text-slate-200 hover:text-amber-400 hover:bg-amber-500/15 hover:translate-x-1 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isActive 
                          ? 'bg-white/20 text-white border-white/40' 
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Bottom Quick Action */}
            <div className="p-4 border-t border-amber-500/20 bg-slate-900/60 space-y-3">
              <button
                onClick={() => {
                  soundFX.play('click');
                  setShowSimulatorModal(true);
                  setSidebarOpen(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer btn-magnetic"
              >
                <Zap className="w-4 h-4 text-amber-400 animate-heartbeat" />
                <span>Launch Risk Simulator</span>
              </button>

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
                <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-amber-400" /> Diagnostic Engine</span>
                <span className="text-emerald-400 font-black">High Precision</span>
              </div>
            </div>

          </aside>

        </div>
      )}
    </>
  );
}
