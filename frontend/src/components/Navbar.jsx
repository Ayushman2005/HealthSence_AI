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
    { id: 'wizard', label: 'Diagnostic Wizard', icon: HeartPulse, onClick: resetWizard },
    { id: 'symptom_checker', label: 'Symptom Triage', icon: Stethoscope },
    { id: 'chatbot', label: 'HealthBot AI', icon: Bot },
    { id: 'upload_report', label: 'Report & Rx', icon: FileText },
    { id: 'history', label: 'Audit History', icon: ClipboardList, protected: true },
    { id: 'insights', label: 'Health Insights', icon: TrendingUp, protected: true },
    { id: 'account', label: 'Account', icon: Settings, protected: true },
  ];

  if (userProfile?.role === 'admin') {
    navItems.push({ id: 'admin_portal', label: 'Admin Portal', icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors no-print">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setCurrentTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center p-1.5">
                <img src="/logo.png" alt="HealthSence AI Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                HealthSence <span className="text-amber-500 font-black">AI</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block -mt-1">
                Clinical Diagnostics
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
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
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Live Simulator Launcher Button */}
            <button
              onClick={() => setShowSimulatorModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-extrabold transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Risk Simulator</span>
            </button>

            {/* Profile Dropdown or Login CTA */}
            {authToken ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 bg-white/60 dark:bg-slate-800/60 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 font-extrabold text-xs flex items-center justify-center">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline max-w-[120px] truncate">
                    {userProfile?.name || activeUser || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{userProfile?.name || 'User Profile'}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">@{userProfile?.username || 'user'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('account');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-50/60 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-amber-600" />
                      Account Settings
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : null}

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto gap-1 py-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
