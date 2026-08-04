import React from 'react';
import { Bot, RefreshCw, User, Stethoscope, Send } from 'lucide-react';

export default function HealthChatbot({
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  handleSendChatMessage,
  userProfile
}) {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in no-print">
      
      {/* Upper Banner Card */}
      <div className="glass-panel rounded-3xl p-6 border border-amber-200/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30">24/7 Clinical Assistant</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">Instant AI Responses</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">HealthBot AI Clinical Assistant</h2>
              <p className="text-xs text-slate-600 font-medium mt-1 max-w-2xl">
                Ask any questions regarding disease prevention, fasting blood sugar, blood pressure targets, cholesterol, symptoms, medications, or dietary guidelines.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setChatMessages([
              {
                id: Date.now(),
                sender: 'ai',
                category: 'Chat Reset',
                text: 'Hello! I am **HealthBot AI**. How can I assist you with your health questions today?',
                suggested_prompts: [
                  'How to lower fasting blood sugar?',
                  'What are normal blood pressure ranges?',
                  'What causes stomach ache after meals?'
                ],
                time: 'Just now'
              }
            ])}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-amber-400 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset Conversation</span>
          </button>
        </div>
      </div>

      {/* Quick Suggested Prompts Pills */}
      <div className="p-4 glass-panel border border-amber-200/60 rounded-3xl space-y-2">
        <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">Suggested Healthcare Questions:</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🩸 How to lower fasting blood sugar?', prompt: 'How to lower fasting blood sugar naturally?' },
            { label: '🫀 What are normal blood pressure ranges?', prompt: 'What are normal blood pressure ranges for adults?' },
            { label: '🤢 What causes stomach ache after meals?', prompt: 'What causes stomach ache after eating meals?' },
            { label: '🧪 What is an ideal LDL cholesterol level?', prompt: 'What is ideal LDL cholesterol level and how to reduce it?' },
            { label: '💊 How does Metformin work?', prompt: 'What is Metformin used for and what are its side effects?' },
            { label: '🧘 What is the DASH diet protocol?', prompt: 'What is the DASH diet for hypertension?' }
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendChatMessage(item.prompt)}
              className="px-3.5 py-2 bg-white/90 border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/60 text-slate-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Thread Window */}
      <div className="glass-panel rounded-3xl border border-amber-200/80 shadow-xl flex flex-col h-[580px] overflow-hidden">
        
        {/* Chat Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-md ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble Content */}
              <div className={`max-w-[80%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 px-1">
                  <span>{msg.sender === 'user' ? (userProfile?.name || 'Patient') : 'HealthBot AI'}</span>
                  <span>•</span>
                  <span>{msg.time}</span>
                  {msg.category && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 font-extrabold">
                      {msg.category}
                    </span>
                  )}
                </div>

                <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white/90 border border-slate-200/80 text-slate-800 rounded-tl-none space-y-2'
                }`}>
                  {/* Format linebreaks */}
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>

                  {msg.specialist && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-amber-900 font-bold">
                      <Stethoscope className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Recommended Specialist: {msg.specialist}</span>
                    </div>
                  )}
                </div>

                {/* Suggested Prompts if returned */}
                {msg.suggested_prompts && msg.suggested_prompts.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5 justify-start">
                    {msg.suggested_prompts.map((sp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendChatMessage(sp)}
                        className="px-2.5 py-1 bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-extrabold rounded-lg hover:bg-amber-100 cursor-pointer"
                      >
                        💡 {sp}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex items-center gap-3 text-slate-500 font-bold text-xs p-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center animate-bounce">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                <span>HealthBot AI is analyzing clinical database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white/80 border-t border-amber-200/60 no-print">
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
              placeholder="Ask HealthBot AI any medical question (e.g. How to lower glucose? What is normal BP?)..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-xs font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="btn-magnetic px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-40 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
