import React from 'react';
import {
  OverviewTabButton,
  NewAssessmentTabButton,
  SymptomCheckerTabButton,
  HealthChatbotTabButton,
  MedicalReportTabButton,
  AssessmentHistoryTabButton,
  HealthInsightsTabButton,
  AccountTabButton,
  AdminPortalTabButton
} from './buttons';

export default function NavTabs({ currentTab, setCurrentTab, resetWizard, userRole }) {
  return (
    <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full no-scrollbar py-1 px-1">
      <OverviewTabButton
        isActive={currentTab === 'dashboard'}
        onClick={() => setCurrentTab('dashboard')}
      />

      <NewAssessmentTabButton
        isActive={currentTab === 'wizard' || currentTab === 'results'}
        onClick={() => {
          if (resetWizard) resetWizard();
          setCurrentTab('wizard');
        }}
      />

      <SymptomCheckerTabButton
        isActive={currentTab === 'symptom_checker'}
        onClick={() => setCurrentTab('symptom_checker')}
      />

      <HealthChatbotTabButton
        isActive={currentTab === 'chatbot'}
        onClick={() => setCurrentTab('chatbot')}
      />

      <MedicalReportTabButton
        isActive={currentTab === 'upload_report'}
        onClick={() => setCurrentTab('upload_report')}
      />

      <AssessmentHistoryTabButton
        isActive={currentTab === 'history'}
        onClick={() => setCurrentTab('history')}
      />

      <HealthInsightsTabButton
        isActive={currentTab === 'insights'}
        onClick={() => setCurrentTab('insights')}
      />

      <AccountTabButton
        isActive={currentTab === 'account'}
        onClick={() => setCurrentTab('account')}
      />

      {userRole === 'admin' && (
        <AdminPortalTabButton
          isActive={currentTab === 'admin_portal'}
          onClick={() => setCurrentTab('admin_portal')}
        />
      )}
    </nav>
  );
}
