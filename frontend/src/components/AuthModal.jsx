import React from 'react';
import { AlertCircle, ArrowRight, PlusCircle } from 'lucide-react';

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
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden text-slate-100">
      
      {/* Background ambient blob */}
      <div className="absolute top-[-15%] left-[-15%] w-[45%] h-[45%] bg-zinc-200/30 rounded-full blur-[140px] pointer-events-none animate-float-blob" />
      
      <div className="w-full max-w-[460px] glass-modal-container rounded-3xl p-8 md:p-10 shadow-xl relative z-10 animate-modal-spring">
        
        <div className="flex flex-col items-center text-center mb-6">
          <img 
            src="/logo.png" 
            alt="HealthSenceAI Logo" 
            className="w-16 h-16 rounded-2xl object-contain mb-4 shadow-sm" 
          />
          <h2 className="font-extrabold text-3xl text-zinc-900 tracking-tight">HealthSence<span className="text-zinc-500">AI</span></h2>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm font-medium">
            {authMode === 'login' 
              ? 'Sign in to access your clinical dashboard and models' 
              : 'Create an account to begin clinical assessments'}
          </p>
        </div>
        
        {authMode === 'login' ? (
          
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Username
              </label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="btn-magnetic w-full py-3.5 text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/35 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 font-semibold">
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('register'); setLoginError(''); }}
                  className="text-amber-600 hover:text-amber-500 hover:underline cursor-pointer font-bold"
                >
                  Sign Up Now
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-5">
            {registerError && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                placeholder="e.g. Ayushman Kar"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={registerUsername}
                onChange={e => setRegisterUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <input 
                type="password" 
                value={registerConfirmPassword}
                onChange={e => setRegisterConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-500"
              />
            </div>

            <button 
              type="submit" 
              disabled={registerLoading}
              className="btn-magnetic w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {registerLoading ? 'Creating account...' : 'Create Account'}
              <PlusCircle className="w-4 h-4" />
            </button>
            
            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500 font-semibold">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('login'); setRegisterError(''); }}
                  className="text-zinc-900 hover:underline cursor-pointer font-bold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
