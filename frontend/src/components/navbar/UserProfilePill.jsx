import React from 'react';

export default function UserProfilePill({ userProfile, onClick }) {
  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  return (
    <div 
      onClick={onClick}
      className="group flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/80 hover:bg-white border border-amber-200/80 cursor-pointer shadow-xs nav-pill-item"
      title={userProfile?.name || 'Account'}
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none group-hover:scale-105 transition-transform duration-300">
        {initials}
      </div>
      <span className="nav-pill-label text-xs font-bold text-slate-800 group-hover:text-amber-600 pr-1">
        {userProfile?.name || 'User'}
      </span>
    </div>
  );
}
