import React, { useState } from 'react';
import { 
  LayoutDashboard, HeartPulse, Stethoscope, Bot, 
  ClipboardList, Settings, ShieldAlert, LogOut, 
  User, Menu, X, ChevronDown, Activity, Zap
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
  setShowSimulatorModal
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wizard', label: 'Check Heart Risk', icon: HeartPulse, onClick: resetWizard },
    { id: 'symptom_checker', label: 'Symptom Checker', icon: Stethoscope },
    { id: 'chatbot', label: 'Cardio AI', icon: Bot },
    { id: 'history', label: 'History', icon: ClipboardList }
  ];

  if (userProfile?.role === 'admin') {
    navLinks.push({
      id: 'admin_portal',
      label: 'Admin Console',
      icon: ShieldAlert,
      isAdmin: true
    });
  }

  const handleNavClick = (link) => {
    soundFX.play('switch');
    if (link.onClick) link.onClick();
    setCurrentTab(link.id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => {
              soundFX.play('switch');
              setCurrentTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-rose-500 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                <img src="/logo.png" alt="HealthSence AI" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                HealthSence <span className="text-amber-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider -mt-0.5">
                Cardiovascular Health
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Simple, Direct Tab Bar) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? link.isAdmin 
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' 
                        : 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : link.isAdmin
                        ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (link.isAdmin ? 'text-white' : 'text-slate-950') : (link.isAdmin ? 'text-rose-400' : 'text-amber-400')}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Area (Simulator + User Profile / Sign In) */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Simulator Button */}
            <button
              onClick={() => {
                soundFX.play('click');
                setShowSimulatorModal(true);
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer"
              title="Open What-If Risk Simulator"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulator</span>
            </button>

            {/* Profile Avatar / User Account Dropdown */}
            {authToken ? (
              <div className="relative">
                <button
                  onClick={() => {
                    soundFX.play('click');
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/90 text-left transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xs flex items-center justify-center">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-white max-w-25 truncate">
                      {userProfile?.name || activeUser || 'User'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {userProfile?.role === 'admin' ? '👑 Admin' : 'Clinician'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fade-in"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{userProfile?.name || 'User Profile'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">@{userProfile?.username || 'user'}</p>
                    </div>

                    {userProfile?.role === 'admin' && (
                      <button
                        onClick={() => {
                          soundFX.play('switch');
                          setCurrentTab('admin_portal');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-300 hover:bg-rose-500/15 flex items-center gap-2 transition cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        soundFX.play('switch');
                        setCurrentTab('account');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
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
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                soundFX.play('click');
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (Simple and Clean) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-1.5 animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? link.isAdmin
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (link.isAdmin ? 'text-white' : 'text-slate-950') : 'text-amber-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
