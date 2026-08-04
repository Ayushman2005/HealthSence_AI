import React from 'react';

export default function BrandLogo({ onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="group flex items-center gap-2.5 p-1.5 px-2 rounded-2xl hover:bg-amber-500/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none cursor-pointer nav-pill-item"
      title="HealthSence AI"
    >
      <img 
        src="/logo.png" 
        alt="HealthSenceAI Logo" 
        className="w-9 h-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0" 
      />
      <span className="nav-pill-label text-slate-900 font-extrabold text-lg tracking-tight">
        HealthSence <span className="text-gradient-amber font-black">AI</span>
      </span>
    </div>
  );
}
