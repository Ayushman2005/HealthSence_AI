import React from 'react';

export default function SplashLoader({ isInitialLoading, loadingPhase, loadingProgress }) {
  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#0b0f19]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 select-none transition-all duration-700 ease-out ${
        isInitialLoading ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-105'
      }`}
    >
      {/* Ambient glow mesh behind loader */}
      <div className="absolute w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-400/15 to-amber-300/10 blur-[130px] animate-float-blob pointer-events-none" />

      {/* Central Logo Ring Container */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Spinning Liquid Ring Arc */}
        <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 border-t-amber-400 border-r-amber-500 animate-spin-slow shadow-xl shadow-amber-500/20 flex items-center justify-center" />
        
        {/* Inner Pulsating Logo */}
        <div className="absolute w-20 h-20 rounded-2xl bg-slate-900 border border-amber-500/30 p-3 shadow-lg shadow-amber-500/20 flex items-center justify-center animate-heartbeat">
          <img 
            src="/logo.png" 
            alt="HealthSence AI Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
      </div>

      {/* Brand Header */}
      <h1 className="text-3xl font-black text-white tracking-tight mb-2">
        HealthSence <span className="text-gradient-amber font-black">AI</span>
      </h1>
      
      {/* Phase Status */}
      <p className="text-xs font-bold text-amber-400 animate-pulse tracking-wide uppercase mb-6 h-4 text-center">
        {loadingPhase}
      </p>

      {/* Dynamic Progress Bar */}
      <div className="w-72 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80 shadow-inner mb-3">
        <div 
          className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 h-full transition-all duration-200 rounded-full shadow-xs"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>

      {/* Percentage Counter */}
      <div className="flex items-center gap-1.5 font-mono text-sm font-black text-slate-200">
        <span className="text-gradient-amber text-lg">{loadingProgress}%</span>
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Loaded</span>
      </div>
    </div>
  );
}
