import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-2.5 pointer-events-none no-print">
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';
        const isDanger = t.type === 'danger';
        const isInfo = !isSuccess && !isWarning && !isDanger;

        const colorCfg = isSuccess
          ? { bar: '#10b981', icon: CheckCircle, iconColor: 'text-emerald-400', glow: 'rgba(16,185,129,0.15)' }
          : isWarning
          ? { bar: '#f59e0b', icon: AlertTriangle, iconColor: 'text-amber-400', glow: 'rgba(245,158,11,0.15)' }
          : isDanger
          ? { bar: '#f43f5e', icon: AlertCircle, iconColor: 'text-rose-400', glow: 'rgba(244,63,94,0.15)' }
          : { bar: '#06b6d4', icon: Info, iconColor: 'text-cyan-400', glow: 'rgba(6,182,212,0.15)' };

        const IconComp = colorCfg.icon;

        return (
          <div
            key={t.id}
            className="glass-modal-container flex items-start gap-3.5 p-4 pr-5 rounded-2xl pointer-events-auto animate-slide-in-right w-[min(calc(100vw-24px),380px)] relative overflow-hidden"
            style={{
              boxShadow: `0 12px 32px -8px rgba(0,0,0,0.7), 0 0 16px ${colorCfg.glow}, inset 0 1px 0 rgba(255,255,255,0.07)`
            }}
          >
            {/* Left color bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl"
              style={{ background: colorCfg.bar }}
            />

            {/* Icon */}
            <div
              className="p-1.5 rounded-xl shrink-0 border border-white/8"
              style={{ background: colorCfg.glow }}
            >
              <IconComp className={`w-4 h-4 ${colorCfg.iconColor}`} />
            </div>

            {/* Message */}
            <span className="text-[12px] font-semibold text-slate-200 leading-relaxed flex-1">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
