import React from 'react';

export default function SplashLoader({ isInitialLoading, loadingPhase, loadingProgress }) {
  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center p-6 select-none transition-all duration-700 ease-out ${
        isInitialLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(5, 8, 16, 0.98)' }}
    >
      {/* ── Ambient background glows ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-100 h-100 rounded-full bg-amber-500/8 blur-[130px] animate-float-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-87.5 h-87.5 rounded-full bg-emerald-500/6 blur-[120px] animate-float-blob-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-70 h-70 rounded-full bg-cyan-500/5 blur-[100px] animate-float-blob-3" />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* ── Central Logo Assembly ── */}
      <div className="relative flex items-center justify-center mb-10 z-10">
        
        {/* Outer conic-gradient rotating ring */}
        <div
          className="absolute w-44 h-44 rounded-full animate-spin-slow"
          style={{
            background: 'conic-gradient(from 0deg, rgba(245,158,11,0.8), rgba(16,185,129,0.4), rgba(6,182,212,0.5), transparent 60%, rgba(245,158,11,0.8))',
            borderRadius: '50%',
            padding: '2px',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 2px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 2px))'
          }}
        />

        {/* Inner slower counter-rotating ring */}
        <div
          className="absolute w-36 h-36 rounded-full animate-spin-slow-reverse"
          style={{
            background: 'conic-gradient(from 180deg, rgba(16,185,129,0.5), rgba(6,182,212,0.3), transparent 50%, rgba(16,185,129,0.5))',
            borderRadius: '50%',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 1px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 1px))'
          }}
        />

        {/* Neon pulse ring */}
        <div className="absolute w-28 h-28 rounded-full border border-amber-500/25 neon-ring-pulse" />

        {/* Central logo box */}
        <div className="w-20 h-20 animate-heartbeat">
          <div className="w-full h-full rounded-[20px] bg-linear-to-br from-amber-500 via-amber-600 to-yellow-400 p-[2.5px] shadow-2xl shadow-amber-500/40">
            <div className="w-full h-full bg-slate-950 rounded-[17px] flex items-center justify-center p-3">
              <img src="/logo.png" alt="HealthSence AI" className="w-full h-full object-contain drop-shadow" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Brand Name ── */}
      <div className="z-10 text-center mb-2">
        <h1 className="text-4xl font-black text-white tracking-tight">
          HealthSence <span className="text-gradient-amber">AI</span>
        </h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
          Precision Cardiovascular Intelligence
        </p>
      </div>

      {/* ── ECG Decorative Strip ── */}
      <div className="z-10 mt-4 mb-5">
        <svg className="w-48 h-6 text-emerald-400 opacity-60" viewBox="0 0 200 24" fill="none">
          <path
            d="M0 12 L50 12 L58 4 L66 20 L74 8 L82 16 L90 12 L140 12 L148 4 L156 20 L164 8 L172 16 L180 12 L200 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg"
          />
        </svg>
      </div>

      {/* ── Phase Label ── */}
      <p className="z-10 text-[11px] font-bold text-amber-400 animate-pulse tracking-[0.15em] uppercase mb-5 h-4 text-center">
        {loadingPhase}
      </p>

      {/* ── Progress Bar ── */}
      <div className="z-10 w-72 space-y-2">
        {/* Track */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-200 relative overflow-hidden"
            style={{
              width: `${loadingProgress}%`,
              background: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)',
              boxShadow: '0 0 10px rgba(245,158,11,0.5)'
            }}
          >
            {/* Shimmer sweep inside bar */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmerLight 1.4s ease-in-out infinite'
              }}
            />
          </div>
        </div>

        {/* Percentage */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Loading</span>
          <span className="font-mono text-sm font-black text-gradient-amber">{loadingProgress}%</span>
        </div>
      </div>

      {/* ── Bottom micro-badge ── */}
      <div className="z-10 mt-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Clinical AI Systems Online</span>
      </div>
    </div>
  );
}
