import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function HealthInsightsTabButton({ isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      title="Health Insights"
      className={`group relative flex items-center gap-2.5 p-2.5 sm:p-3 text-xs sm:text-sm font-semibold rounded-2xl nav-pill-item cursor-pointer transition-all ${
        isActive 
          ? 'glass-tab-active font-extrabold scale-105' 
          : 'text-slate-700 bg-white/80 hover:bg-white border border-slate-200/80 hover:border-amber-400/50 hover:text-amber-700'
      }`}
    >
      <TrendingUp className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-white' : 'text-amber-600'}`} />
      <span className="nav-pill-label font-bold text-xs sm:text-sm">
        Health Insights
      </span>
    </button>
  );
}
