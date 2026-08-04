import React from 'react';
import BrandLogo from './BrandLogo';
import NavTabs from './NavTabs';
import ActivePatientPill from './ActivePatientPill';
import UserProfilePill from './UserProfilePill';
import SignOutButton from './SignOutButton';

export default function Navbar({
  currentTab,
  setCurrentTab,
  resetWizard,
  userProfile,
  activeUser,
  setActiveUser,
  authToken,
  handleLogout
}) {
  return (
    <header className="sticky top-0 z-50 w-full glass-header border-b border-amber-200/60 px-2.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 no-print shadow-md backdrop-blur-2xl transition-all duration-300">
      {/* Left: Brand Logo */}
      <BrandLogo onClick={() => setCurrentTab('dashboard')} />

      {/* Center: Top Navigation Options */}
      <NavTabs
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        resetWizard={resetWizard}
        userRole={userProfile?.role}
      />

      {/* Right: Active Patient, Profile, and Sign Out */}
      <div className="flex items-center gap-2.5 shrink-0">
        <ActivePatientPill 
          activeUser={activeUser} 
          onClearActiveUser={() => setActiveUser('')} 
        />

        <UserProfilePill 
          userProfile={userProfile} 
          onClick={() => setCurrentTab('account')} 
        />

        <SignOutButton 
          onLogout={handleLogout} 
          authToken={authToken} 
        />
      </div>
    </header>
  );
}
