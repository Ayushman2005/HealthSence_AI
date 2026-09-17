import React, { useState } from 'react';
import { 
  LayoutDashboard, HeartPulse, Stethoscope, Bot, 
  ClipboardList, Settings, ShieldAlert, LogOut, 
  Menu, X, ChevronDown, Zap, Volume2, VolumeX, Activity
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function Navbar({
  currentTab,
  setCurrentTab,
  resetWizard,
  userProfile,
  activeUser,
  authToken,
  handleLogout,
  setShowSimulatorModal,
  setIsCommandPaletteOpen
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);

  const isAdmin = userProfile?.role === 'admin';

  const navLinks = isAdmin
    ? [
        { id: 'admin_portal', label: 'Admin Console', icon: ShieldAlert, isAdmin: true },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'wizard', label: 'Check Heart Risk', icon: HeartPulse, onClick: resetWizard },
        { id: 'symptom_checker', label: 'Symptom Checker', icon: Stethoscope },
        { id: 'chatbot', label: 'Cardio AI', icon: Bot },
        { id: 'history', label: 'History', icon: ClipboardList }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'wizard', label: 'Check Heart Risk', icon: HeartPulse, onClick: resetWizard },
        { id: 'symptom_checker', label: 'Symptom Checker', icon: Stethoscope },
        { id: 'chatbot', label: 'Cardio AI', icon: Bot },
        { id: 'history', label: 'History', icon: ClipboardList }
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
    <header className="sticky top-0 z-50 glass-header no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Telemetry Indicator */}
          <div className="flex items-center gap-4 shrink-0">
            <div 
              onClick={() => {
                soundFX.play('switch');
                setCurrentTab(isAdmin ? 'admin_portal' : 'dashboard');
              }}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 group-hover:shadow-amber-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                  <img src="/logo.png" alt="HealthSence AI" className="w-full h-full object-contain filter drop-shadow" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  HealthSence <span className="text-amber-400">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider -mt-0.5">
                  {isAdmin ? 'System Admin Control' : 'Precision Cardio AI'}
                </span>
              </div>
            </div>

            {/* Live Cardiac Telemetry Indicator (Desktop) */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="font-bold">72 BPM</span>
                <span className="text-emerald-500/60">•</span>
                <span>Sinus Rhythm</span>
              </div>
              <svg className="w-20 h-5 text-emerald-400 opacity-70" viewBox="0 0 100 24" fill="none">
                <path 
                  d="M0 12 L30 12 L35 4 L42 20 L48 8 L54 16 L60 12 L100 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="animate-ecg"
                />
              </svg>
            </div>
          </div>

          {/* Desktop Navigation Links (Icon Dock with Tooltips) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <div key={link.id} className="relative group">
                  <button
                    onClick={() => handleNavClick(link)}
                    className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/35 scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105'
                    }`}
                    title={link.label}
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>

                  {/* High-Tech Floating Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-9 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-950/95 border border-white/15 text-[11px] font-bold text-white shadow-xl backdrop-blur-md flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400' : 'bg-slate-400'}`} />
                      <span>{link.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right Action Area (Sound, Simulator, Command, Profile) */}
          <div className="flex items-center gap-2">
            
            {/* Audio Feedback Toggle */}
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-slate-900/80 border-white/10 text-amber-400 hover:border-amber-500/40' 
                  : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Mute Interface Audio' : 'Unmute Interface Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Simulator Button (Icon-based with Tooltip) */}
            <div className="relative group hidden lg:block">
              <button
                onClick={() => {
                  soundFX.play('click');
                  setShowSimulatorModal(true);
                }}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-amber-500/40 text-slate-200 hover:text-white transition cursor-pointer shadow-xs flex items-center justify-center"
                title="Open What-If Risk Simulator"
                aria-label="Open What-If Risk Simulator"
              >
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-9 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap">
                <div className="px-2.5 py-1 rounded-lg bg-slate-950/95 border border-white/15 text-[11px] font-bold text-white shadow-xl backdrop-blur-md">
                  What-If Simulator
                </div>
              </div>
            </div>

            {/* Command Palette Trigger */}
            {setIsCommandPaletteOpen && (
              <button
                onClick={() => {
                  soundFX.play('click');
                  setIsCommandPaletteOpen(true);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:border-white/20 transition cursor-pointer"
                title="Open Command Palette (Ctrl+K)"
              >
                <span>⌘K</span>
              </button>
            )}

            {/* Profile Avatar / User Account Dropdown */}
            {authToken ? (
              <div className="relative">
                <button
                  onClick={() => {
                    soundFX.play('click');
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/80 text-left transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center bg-linear-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-sm">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-slate-200 max-w-25 truncate">
                      {userProfile?.name || activeUser || 'User'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${isAdmin ? 'text-amber-400' : 'text-slate-400'}`}>
                      {isAdmin ? '👑 Admin' : 'Clinician'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 z-50 space-y-1 animate-modal-spring border border-white/15"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">{userProfile?.name || 'User Profile'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">@{userProfile?.username || 'user'}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          soundFX.play('switch');
                          setCurrentTab('admin_portal');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2 transition cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        soundFX.play('switch');
                        setCurrentTab('account');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2 transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFX.play('alert');
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                soundFX.play('click');
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 py-3 space-y-1.5 animate-tab-fade">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-r from-amber-500 to-amber-600 text-white font-black shadow-md shadow-amber-500/25'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
