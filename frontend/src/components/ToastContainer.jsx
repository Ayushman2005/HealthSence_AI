import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-8 right-8 z-9999 flex flex-col gap-3 pointer-events-none no-print">
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';
        const isDanger = t.type === 'danger';
        return (
          <div 
            key={t.id}
            className={`px-4 py-3 sm:px-5 sm:py-4 w-[calc(100vw-24px)] sm:w-auto max-w-100 border rounded-xl shadow-2xl bg-white dark:bg-slate-900 flex items-center gap-3.5 pointer-events-auto animate-slide-in ${
              isSuccess ? 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-800' :
              isWarning ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800' :
              isDanger ? 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800' :
              'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800'
            }`}
          >
            {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            {isDanger && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {!isSuccess && !isWarning && !isDanger && <Info className="w-5 h-5 text-amber-600 shrink-0" />}
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
