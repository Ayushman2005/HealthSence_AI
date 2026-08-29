import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, HeartPulse, Stethoscope, Bot, ClipboardList, 
  TrendingUp, Settings, ShieldAlert, Zap, Cpu, ArrowRight, X, Command
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function CommandPalette({
  isOpen,
  setIsOpen,
  setCurrentTab,
  setShowSimulatorModal,
  userProfile,
  resetWizard
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const actions = [
    {
      id: 'wizard',
      title: 'Start Cardiovascular Risk Assessment',
      subtitle: 'Evaluate Heart Disease, CAD, & hemodynamic risk dimensions',
      icon: HeartPulse,
      category: 'Diagnostic Engine',
      action: () => {
        if (resetWizard) resetWizard();
        setCurrentTab('wizard');
      }
    },
    {
      id: 'simulator',
      title: 'Open Real-Time Biometrics Simulator',
      subtitle: 'Live interactive what-if parameters and risk delta knobs',
      icon: Zap,
      category: 'Interactive Tools',
      action: () => {
        setShowSimulatorModal(true);
      }
    },
    {
      id: 'symptom_checker',
      title: 'Symptom Checker & Triage Engine',
      subtitle: 'Analyze symptoms and review differential conditions',
      icon: Stethoscope,
      category: 'Clinical Intelligence',
      action: () => setCurrentTab('symptom_checker')
    },
    {
      id: 'chatbot',
      title: 'HealthBot Clinical AI Assistant',
      subtitle: '24/7 interactive clinical assistant and medical guidance',
      icon: Bot,
      category: 'AI Chat',
      action: () => setCurrentTab('chatbot')
    },
    {
      id: 'dashboard',
      title: 'Clinical Overview Dashboard',
      subtitle: 'Review overall health score and organ risk profiles',
      icon: TrendingUp,
      category: 'Analytics',
      action: () => setCurrentTab('dashboard')
    },
    {
      id: 'history',
      title: 'Patient Medical History Audit',
      subtitle: 'Inspect past risk evaluations and longitudinal records',
      icon: ClipboardList,
      category: 'Patient Records',
      action: () => setCurrentTab('history')
    },
    {
      id: 'insights',
      title: 'Longitudinal Health Analytics',
      subtitle: 'View trends and multi-patient biometric charts',
      icon: Cpu,
      category: 'Analytics',
      action: () => setCurrentTab('insights')
    },
    {
      id: 'account',
      title: 'User Account & Security',
      subtitle: 'Manage profile information and authentication credentials',
      icon: Settings,
      category: 'System',
      action: () => setCurrentTab('account')
    }
  ];

  if (userProfile?.role === 'admin') {
    actions.push({
      id: 'admin_portal',
      title: 'Administrator Control Center',
      subtitle: 'Manage ML models, pipeline retrain, & user databases',
      icon: ShieldAlert,
      category: 'Administration',
      action: () => setCurrentTab('admin_portal')
    });
  }

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundFX.play('switch');
        setIsOpen(prev => !prev);
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        soundFX.play('slider');
        setSelectedIndex(prev => (prev + 1) % (filteredActions.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        soundFX.play('slider');
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
      } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
        e.preventDefault();
        soundFX.play('success');
        filteredActions[selectedIndex].action();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-start justify-center pt-20 sm:pt-28 p-4 no-print">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Box Container */}
      <div className="relative w-full max-w-2xl glass-modal-container rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden animate-modal-spring z-10 flex flex-col">
        
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search health modules (e.g. 'Simulator', 'Heart Risk', 'OCR')..."
            className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base font-bold text-white placeholder:text-slate-500"
          />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400">
              ESC to close
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action List */}
        <div className="max-h-95 overflow-y-auto p-2 space-y-1 bg-slate-950/80">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-bold">
              No matching clinical commands found for "{query}"
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFX.play('success');
                    item.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-linear-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-500/40 text-white shadow-md' 
                      : 'border border-transparent text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-800 text-amber-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{item.title}</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.2 rounded-full bg-slate-800/90 text-amber-400 border border-amber-500/20">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-slate-900/95 border-t border-amber-500/15 flex items-center justify-between text-[10px] font-bold text-slate-400 px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↑</kbd><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↵</kbd> Select</span>
          </div>
          <span className="text-amber-400 font-extrabold flex items-center gap-1">
            <Command className="w-3 h-3" /> Quick Action Launcher
          </span>
        </div>

      </div>
    </div>
  );
}
