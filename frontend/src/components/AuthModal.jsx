import React, { useState } from 'react';
import { AlertCircle, ArrowRight, PlusCircle, Lock, User, Eye, EyeOff, HeartPulse, Shield, Sparkles } from 'lucide-react';

export default function AuthModal({
  authMode,
  setAuthMode,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  loginLoading,
  handleLogin,
  registerName,
  setRegisterName,
  registerUsername,
  setRegisterUsername,
  registerPassword,
  setRegisterPassword,
  registerConfirmPassword,
  setRegisterConfirmPassword,
  registerError,
  setRegisterError,
  registerLoading,
  handleRegister
}) {
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfPw, setShowRegConfPw] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* ── Ambient Background Orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-130 h-130 rounded-full bg-amber-500/8 blur-[120px] animate-float-blob" />
        <div className="absolute -bottom-40 -right-32 w-120 h-120 rounded-full bg-emerald-500/7 blur-[120px] animate-float-blob-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-90 h-90 rounded-full bg-cyan-500/5 blur-[100px] animate-float-blob-3" />
      </div>

      {/* ── Subtle grid ── */}
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />

      {/* ── Main Auth Card ── */}
      <div className="w-full max-w-115 relative z-10 animate-modal-spring">
        
        {/* Outer gradient ring */}
        <div className="absolute -inset-px rounded-[28px] bg-linear-to-br from-amber-500/30 via-transparent to-emerald-500/20 pointer-events-none rounded-inherit" />

        <div className="glass-modal-container rounded-[26px] p-7 sm:p-9 relative">
          
          {/* ── Brand Header ── */}
          <div className="flex flex-col items-center text-center mb-7">
            
            {/* Logo ring with conic spin */}
            <div className="relative mb-5 animate-auth-float">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent"
                style={{
                  background: 'conic-gradient(from 0deg, #f59e0b, #10b981, #06b6d4, #f59e0b) border-box',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  animation: 'spin-slow 6s linear infinite',
                  borderRadius: '18px',
                  padding: '2px'
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[13px] flex items-center justify-center p-2.5">
                  <img src="/logo.png" alt="HealthSence AI Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            <h2 className="font-black text-3xl text-white tracking-tight">
              Health<span className="text-gradient-amber">Sence</span> <span className="text-slate-300">AI</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs leading-relaxed">
              {authMode === 'login'
                ? 'Sign in to access your precision cardiovascular intelligence'
                : 'Create your account to begin clinical risk assessments'}
            </p>

            {/* ECG line decoration */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
              <HeartPulse className="w-3.5 h-3.5 text-amber-500/60 animate-heartbeat" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            </div>
          </div>

          {/* ── Tab Toggle ── */}
          <div className="flex bg-slate-900/70 rounded-2xl p-1 mb-6 border border-white/6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setRegisterError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-250 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setLoginError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-250 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ── Login Form ── */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-up">
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-3.5 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Username field */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full px-4 py-3.5 pl-11 glass-input rounded-2xl text-sm font-semibold"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPw ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3.5 pl-11 pr-11 glass-input rounded-2xl text-sm font-semibold"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginLoading}
                id="auth-login-submit"
                className="btn-magnetic w-full py-4 text-white bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-600 rounded-2xl font-black text-sm shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loginLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Sign In Securely</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── Register Form ── */
            <form onSubmit={handleRegister} className="space-y-3.5 animate-fade-up">
              {registerError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-3.5 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={registerName}
                    onChange={e => setRegisterName(e.target.value)}
                    placeholder="e.g. Ayushman Kar"
                    required
                    className="w-full px-4 py-3 pl-11 glass-input rounded-xl text-sm font-semibold"
                  />
                  <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={e => setRegisterUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    required
                    className="w-full px-4 py-3 pl-11 glass-input rounded-xl text-sm font-semibold"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    type={showRegPw ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full px-4 py-3 pl-11 pr-11 glass-input rounded-xl text-sm font-semibold"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <button type="button" onClick={() => setShowRegPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer">
                    {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showRegConfPw ? 'text' : 'password'}
                    value={registerConfirmPassword}
                    onChange={e => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full px-4 py-3 pl-11 pr-11 glass-input rounded-xl text-sm font-semibold"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <button type="button" onClick={() => setShowRegConfPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer">
                    {showRegConfPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={registerLoading}
                id="auth-register-submit"
                className="btn-magnetic w-full py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {registerLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Create My Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Footer Legal ── */}
          <p className="text-center text-[10px] text-slate-600 mt-5 font-medium">
            Protected by clinical-grade encryption · HIPAA-ready architecture
          </p>
        </div>
      </div>
    </div>
  );
}
