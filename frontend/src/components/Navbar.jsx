import React, { useState } from 'react';
import { 
  LayoutDashboard, HeartPulse, Stethoscope, Bot, 
  ClipboardList, Settings, ShieldAlert, LogOut, 
  Menu, X, ChevronDown, Zap
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

  const isAdmin = userProfile?.role === 'admin';

  // For Admin role: ONLY display the Admin Console tab. For regular clinicians: display standard medical tabs.
  const navLinks = isAdmin
    ? [
        {
          id: 'admin_portal',
          label: 'Admin Console',
          icon: ShieldAlert,
          isAdmin: true
        }
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => {
              soundFX.play('switch');
              setCurrentTab(isAdmin ? 'admin_portal' : 'dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                <img src="/logo.png" alt="HealthSence AI" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                HealthSence <span className="text-amber-600">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider -mt-0.5">
                {isAdmin ? 'System Admin Control' : 'Cardiovascular Health'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90">
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
                        ? 'bg-rose-500 text-white shadow-xs' 
                        : 'bg-white text-slate-900 font-black shadow-sm border border-slate-200/80'
                      : link.isAdmin
                        ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (link.isAdmin ? 'text-white' : 'text-amber-600') : (link.isAdmin ? 'text-rose-500' : 'text-slate-500')}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Area (Simulator + User Profile / Sign In) */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Simulator Button (Only shown for non-admin clinicians) */}
            {!isAdmin && (
              <button
                onClick={() => {
                  soundFX.play('click');
                  setShowSimulatorModal(true);
                }}
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-500/50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Open What-If Risk Simulator"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulator</span>
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
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-left transition shadow-xs cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                    isAdmin 
                      ? 'bg-rose-100 border border-rose-200 text-rose-700' 
                      : 'bg-amber-100 border border-amber-200 text-amber-700'
                  }`}>
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-slate-900 max-w-25 truncate">
                      {userProfile?.name || activeUser || 'User'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${isAdmin ? 'text-rose-600' : 'text-slate-500'}`}>
                      {isAdmin ? '👑 Admin' : 'Clinician'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-fade-in"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.name || 'User Profile'}</p>
                      <p className="text-[10px] text-slate-500 font-medium">@{userProfile?.username || 'user'}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          soundFX.play('switch');
                          setCurrentTab('admin_portal');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        soundFX.play('switch');
                        setCurrentTab('account');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-amber-600" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFX.play('alert');
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
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
              className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-xs"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (Simple and Clean) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1.5 animate-fade-in shadow-lg">
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
                      : 'bg-amber-500 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : (link.isAdmin ? 'text-rose-500' : 'text-amber-500')}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

