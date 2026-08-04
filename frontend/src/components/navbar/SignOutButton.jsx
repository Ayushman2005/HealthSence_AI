import React from 'react';
import { LogOut } from 'lucide-react';

export default function SignOutButton({ onLogout, authToken }) {
  if (!authToken) return null;

  return (
    <button 
      onClick={onLogout}
      className="group flex items-center gap-2 p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 text-xs font-bold cursor-pointer nav-pill-item"
      title="Sign Out"
    >
      <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]" />
      <span className="nav-pill-label">
        Sign Out
      </span>
    </button>
  );
}
