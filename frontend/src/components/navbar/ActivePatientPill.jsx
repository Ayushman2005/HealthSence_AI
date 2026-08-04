import React from 'react';

export default function ActivePatientPill({ activeUser, onClearActiveUser }) {
  if (!activeUser) return null;

  return (
    <div 
      className="group flex items-center gap-2 p-2 sm:px-2.5 sm:py-2 rounded-2xl glass-panel border-amber-300/80 text-xs font-semibold cursor-pointer nav-pill-item"
      title={`Active Patient: ${activeUser}`}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <span className="nav-pill-label text-slate-800 font-bold">
        {activeUser}
      </span>
      {onClearActiveUser && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClearActiveUser(); }} 
          className="nav-pill-label text-slate-400 hover:text-slate-900 font-extrabold ml-0.5 transition-colors"
          title="Clear Active Patient"
        >
          ✕
        </button>
      )}
    </div>
  );
}
