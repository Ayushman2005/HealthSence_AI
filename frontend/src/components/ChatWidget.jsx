import React from 'react';
import { Bot, MessageSquare, Send, User } from 'lucide-react';

export default function ChatWidget({
  isChatWidgetOpen,
  setIsChatWidgetOpen,
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  handleSendChatMessage
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 no-print flex flex-col items-end gap-2">
      {/* Floating Mini Chat Popup Drawer */}
      {isChatWidgetOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-95 h-[72vh] max-h-130 glass-modal-container border border-amber-500/30 shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-fade-in transition-all">
          {/* Mini Header */}
          <div className="p-3.5 bg-linear-to-r from-amber-500 via-amber-600 to-yellow-500 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-black text-xs text-white">HealthBot AI Assistant</h4>
                <span className="text-[9px] text-white/90 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block"></span>
                  24/7 Cardio AI Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsChatWidgetOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/70 text-xs">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-800 text-amber-400 border border-amber-500/20'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[82%] p-3 rounded-xl font-semibold leading-normal shadow-2xs ${
                  msg.sender === 'user' 
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100 rounded-tr-none' 
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none whitespace-pre-line shadow-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold p-2">
                <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                <span>HealthBot AI is analyzing...</span>
              </div>
            )}
          </div>

          {/* Mini Input Box */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask any health question..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl outline-none text-xs font-semibold text-white placeholder:text-slate-500 transition-colors"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsChatWidgetOpen(!isChatWidgetOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-xs rounded-full shadow-2xl shadow-amber-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageSquare className="w-5 h-5 text-white" />
        <span>Ask HealthBot AI</span>
      </button>
    </div>
  );
}
