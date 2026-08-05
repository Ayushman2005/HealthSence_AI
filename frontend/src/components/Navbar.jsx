import React, { useState } from 'react';
import { 
  LayoutDashboard, HeartPulse, Stethoscope, Bot, FileText, 
  ClipboardList, TrendingUp, Settings, ShieldAlert, LogOut, 
  User, Zap, ChevronDown 
} from 'lucide-react';

export default function Navbar({
  currentTab,
  setCurrentTab,
  resetWizard,
  userProfile,
  activeUser,
  setActiveUser,
  authToken,
  handleLogout,
  setShowSimulatorModal
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wizard', label: 'Risk Assessor', icon: HeartPulse, onClick: resetWizard },
    { id: 'symptom_checker', label: 'Symptom Checker', icon: Stethoscope },
    { id: 'chatbot', label: 'AI Health Assistant', icon: Bot },
    { id: 'upload_report', label: 'Report Analyzer', icon: FileText },
    { id: 'history', label: 'Medical History', icon: ClipboardList, protected: true },
    { id: 'insights', label: 'Health Analytics', icon: TrendingUp, protected: true },
    { id: 'account', label: 'My Account', icon: Settings, protected: true },
  ];

  if (userProfile?.role === 'admin') {
    navItems.push({ id: 'admin_portal', label: 'Admin Console', icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-50 glass-header no-print">
      {/* Subtle top ambient glowing border line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 w-full">
          
          {/* Brand Logo & Title - Left */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
            onClick={() => setCurrentTab('dashboard')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 p-[2px] shadow-md shadow-amber-500/30 group-hover:shadow-amber-500/50 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center p-1.5">
                  <img src="/logo.png" alt="HealthSence AI Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Health<span className="text-amber-600 font-black">Sence</span>
                </span>
                <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded-lg shadow-sm shadow-amber-500/30 uppercase">
                  AI
                </span>
              </div>
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-amber-700 -mt-0.5 flex items-center gap-1">
                <span>Clinical Risk Intelligence</span>
              </span>
            </div>
          </div>

          {/* Navigation Links - Full Fill */}
          <div className="hidden lg:flex items-center flex-1 mx-2">
            <nav className="flex items-center justify-between w-full bg-white/95 p-1.5 rounded-2xl border border-amber-500/20 shadow-xs backdrop-blur-xl gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setCurrentTab(item.id);
                    }}
                    className={`relative flex-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-md shadow-amber-500/30 scale-[1.02] ring-1 ring-amber-300/40'
                        : 'text-slate-800 hover:text-amber-700 hover:bg-amber-500/10 hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-amber-600'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs ml-0.5 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Simulator Launcher Button */}
            <button
              onClick={() => setShowSimulatorModal(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/15 border border-amber-500/40 hover:border-amber-500/70 text-amber-900 hover:text-amber-950 text-xs font-extrabold transition-all duration-200 shadow-xs shadow-amber-500/10 hover:shadow-md hover:shadow-amber-500/20 cursor-pointer btn-magnetic"
            >
              <Zap className="w-4 h-4 text-amber-600 animate-heartbeat" />
              <span>Risk Simulator</span>
            </button>

            {/* Profile Dropdown or Login CTA */}
            {authToken ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-amber-500/30 hover:border-amber-500 bg-white backdrop-blur-md shadow-xs transition-all duration-200 cursor-pointer group"
                >
                  <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1.5px] shadow-xs shadow-amber-500/20">
                    <div className="w-full h-full bg-amber-50 rounded-[6px] text-amber-700 font-black text-xs flex items-center justify-center">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 hidden md:inline max-w-[120px] truncate group-hover:text-amber-600 transition-colors">
                    {userProfile?.name || activeUser || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2.5 w-56 glass-panel rounded-2xl shadow-2xl py-2 z-50 animate-modal-spring border border-amber-500/20"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-amber-500/10">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-xs font-black text-slate-900 truncate">{userProfile?.name || 'User Profile'}</p>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 shrink-0">
                          {userProfile?.role || 'user'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate">@{userProfile?.username || 'user'}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentTab('account');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-amber-500/10 hover:text-amber-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-amber-600" />
                        <span>Account Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
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

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto gap-1.5 py-2.5 border-t border-amber-500/10 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setCurrentTab(item.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs'
                    : 'text-slate-800 hover:bg-amber-500/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
