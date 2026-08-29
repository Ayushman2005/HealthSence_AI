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
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden text-slate-900 dark:text-slate-100">
      
      {/* Background ambient glowing blob */}
      <div className="absolute top-[-15%] left-[-15%] w-[45%] h-[45%] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none animate-float-blob" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[45%] h-[45%] bg-yellow-500/15 rounded-full blur-[140px] pointer-events-none animate-float-blob-reverse" />
      
      <div className="w-full max-w-115 glass-modal-container rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 animate-modal-spring border border-amber-500/20">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30 mb-4">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center p-2">
              <img 
                src="/logo.png" 
                alt="HealthSence AI Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
          <h2 className="font-black text-3xl text-slate-900 dark:text-white tracking-tight">Health<span className="text-amber-500">Sence</span> AI</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-sm font-medium">
            {authMode === 'login' 
              ? 'Sign in to access your clinical risk intelligence dashboard' 
              : 'Create an account to begin clinical assessments'}
          </p>
        </div>
        
        {authMode === 'login' ? (
          
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl p-3 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold shadow-inner"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="btn-magnetic w-full py-4 text-white bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-2xl font-black text-sm shadow-lg shadow-amber-500/35 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('register'); setLoginError(''); }}
                  className="text-amber-500 hover:underline cursor-pointer font-black"
                >
                  Sign Up Now
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            {registerError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                placeholder="e.g. Ayushman Kar"
                required
                className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={registerUsername}
                onChange={e => setRegisterUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Confirm Password</label>
              <input 
                type="password" 
                value={registerConfirmPassword}
                onChange={e => setRegisterConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full px-4 py-3 glass-input rounded-2xl text-sm font-bold shadow-inner"
              />
            </div>

            <button 
              type="submit" 
              disabled={registerLoading}
              className="btn-magnetic w-full py-3.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {registerLoading ? 'Creating account...' : 'Create Account'}
              <PlusCircle className="w-4 h-4" />
            </button>
            
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('login'); setRegisterError(''); }}
                  className="text-amber-500 hover:underline cursor-pointer font-black"
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
