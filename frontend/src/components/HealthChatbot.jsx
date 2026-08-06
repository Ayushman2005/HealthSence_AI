import React from 'react';
import { Bot, RefreshCw, User, Stethoscope, Send, Sparkles } from 'lucide-react';

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
      <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">24/7 Clinical Assistant</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Instant AI Neural Stream</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">HealthBot AI Clinical Assistant</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 max-w-2xl">
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
            className="px-3.5 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Reset Conversation</span>
          </button>
        </div>
      </div>

      {/* Quick Suggested Prompts Pills */}
      <div className="p-4 glass-panel border border-amber-500/20 rounded-3xl space-y-2">
        <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Suggested Healthcare Prompts:</span>
        </span>
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
              className="px-3.5 py-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Thread Window */}
      <div className="glass-panel rounded-3xl border border-amber-500/20 shadow-xl flex flex-col h-[580px] overflow-hidden">
        
        {/* Chat Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs shadow-md ${
                msg.sender === 'user'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
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
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black">
                      {msg.category}
                    </span>
                  )}
                </div>

                <div className={`p-4.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none space-y-2'
                }`}>
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>

                  {msg.specialist && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold">
                      <Stethoscope className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Recommended Specialist: {msg.specialist}</span>
                    </div>
                  )}
                </div>

                {/* Suggested Prompts */}
                {msg.suggested_prompts && msg.suggested_prompts.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5 justify-start">
                    {msg.suggested_prompts.map((sp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendChatMessage(sp)}
                        className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold rounded-xl hover:bg-amber-500/20 cursor-pointer transition"
                      >
                        💡 {sp}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI Thinking waveform indicator */}
          {chatLoading && (
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-extrabold text-xs p-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex items-center gap-2">
                {/* Audio Waveform Bars */}
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 bg-amber-500 rounded-full animate-[waveBar_0.8s_ease-in-out_infinite]" />
                  <span className="w-1 bg-amber-500 rounded-full animate-[waveBar_0.8s_ease-in-out_0.2s_infinite]" />
                  <span className="w-1 bg-amber-500 rounded-full animate-[waveBar_0.8s_ease-in-out_0.4s_infinite]" />
                </div>
                <span>HealthBot AI is computing clinical response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white/90 dark:bg-slate-900/90 border-t border-amber-500/10 no-print">
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
              className="flex-1 px-4 py-3 glass-input rounded-2xl outline-none text-xs font-bold shadow-inner"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="btn-magnetic px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-40 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
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
