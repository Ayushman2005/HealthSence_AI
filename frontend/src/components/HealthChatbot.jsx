import React, { useState, useEffect } from 'react';
import { 
  Bot, RefreshCw, User, Stethoscope, Send, Sparkles, Mic, MicOff, 
  Volume2, VolumeX, Copy, Check, Heart, Droplets, ShieldAlert, Activity
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function HealthChatbot({
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  handleSendChatMessage,
  userProfile
}) {
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  // Categorized Prompt Library for Cardiology & Heart Disease
  const promptCategories = [
    { id: 'all', label: '🌟 All Prompts' },
    { id: 'cardio', label: '🫀 Heart Disease & CAD', icon: Heart },
    { id: 'bp', label: '🩺 Blood Pressure & Arteries', icon: Activity },
    { id: 'lipids', label: '🧪 Cholesterol & Lipids', icon: Droplets },
    { id: 'lifestyle', label: '🏃 Cardio Fitness & Diet', icon: Sparkles },
    { id: 'emergency', label: '🚨 Cardiac Warning Signs', icon: ShieldAlert }
  ];

  const suggestedPrompts = [
    { cat: 'cardio', label: '🫀 What are early indicators of Coronary Artery Disease?', prompt: 'What are the early clinical signs, symptoms, and diagnostic tests for coronary artery disease?' },
    { cat: 'bp', label: '🩺 What are normal blood pressure ranges by age (AHA)?', prompt: 'What are the current AHA guideline blood pressure stages for adults?' },
    { cat: 'lipids', label: '🧪 What is an ideal LDL & HDL cholesterol target for heart health?', prompt: 'What is the recommended LDL and HDL cholesterol target for cardiovascular protection?' },
    { cat: 'lifestyle', label: '🏃 How much aerobic cardio exercise is recommended weekly?', prompt: 'What is the recommended weekly duration and intensity of aerobic cardio exercise per AHA guidelines?' },
    { cat: 'lifestyle', label: '🥗 What is the DASH diet protocol for cardiovascular health?', prompt: 'Explain the DASH diet eating plan and daily sodium limits for lowering blood pressure.' },
    { cat: 'emergency', label: '🚨 What are the red-flag symptoms of acute myocardial infarction?', prompt: 'What are the emergency warning signs of heart attack and angina that require 911/ER triage?' },
    { cat: 'cardio', label: '💓 How does resting heart rate reflect cardiovascular conditioning?', prompt: 'What is an optimal resting heart rate and how does heart rate variability (HRV) relate to cardiac health?' },
    { cat: 'lipids', label: '🍰 How do triglycerides and fasting glucose affect arterial walls?', prompt: 'How does glycemic endothelial stress contribute to atherosclerosis and arterial plaque?' }
  ];

  const filteredPrompts = activeCategoryTab === 'all'
    ? suggestedPrompts
    : suggestedPrompts.filter(p => p.cat === activeCategoryTab);

  // Speech-to-Text handler (Voice Input)
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your current browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      soundFX.play('voice_end');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        soundFX.play('voice_start');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        soundFX.play('success');
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition initiation error", err);
      setIsListening(false);
    }
  };

  // Text-To-Speech handler (Read message aloud)
  const toggleSpeechOutput = (msgId, text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (activeSpeechMsgId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechMsgId(null);
      soundFX.play('voice_end');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/###/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setActiveSpeechMsgId(msgId);
      soundFX.play('voice_start');
    };
    utterance.onend = () => {
      setActiveSpeechMsgId(null);
      soundFX.play('voice_end');
    };
    utterance.onerror = () => {
      setActiveSpeechMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Copy to Clipboard
  const handleCopy = (msgId, text) => {
    soundFX.play('click');
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in no-print text-slate-100">
      
      {/* Upper Banner Card */}
      <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 shadow-xl relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">24/7 Clinical Assistant</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Voice-Enabled AI Stream
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">HealthBot AI Clinical Assistant</h2>
              <p className="text-xs text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
                Ask questions regarding disease prevention, fasting blood sugar, blood pressure targets, cholesterol, symptoms, or dietary and lifestyle guidelines. Supports voice input & audio readouts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.play('click');
              setChatMessages([
                {
                  id: Date.now(),
                  sender: 'ai',
                  category: 'Welcome & System Ready',
                  text: 'Hello! I am **HealthBot AI**, your 24/7 clinical AI health assistant. Ask me anything about disease prevention, blood pressure, diabetes, biomarkers, symptoms, exercise, or healthy nutrition guidelines.',
                  suggested_prompts: [
                    'How to lower fasting blood sugar?',
                    'What are normal blood pressure ranges?',
                    'What causes stomach ache after meals?'
                  ],
                  time: 'Just now'
                }
              ]);
            }}
            className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Conversation</span>
          </button>
        </div>
      </div>

      {/* Categorized Quick Suggested Prompts */}
      <div className="p-4 glass-panel border border-amber-500/20 rounded-3xl space-y-3 bg-slate-950/70">
        
        {/* Category Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggested Healthcare Prompts:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {promptCategories.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  soundFX.play('click');
                  setActiveCategoryTab(c.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  activeCategoryTab === c.id 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Chips */}
        <div className="flex flex-wrap gap-2">
          {filteredPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundFX.play('click');
                handleSendChatMessage(item.prompt);
              }}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Thread Window */}
      <div className="glass-panel rounded-3xl border border-amber-500/20 shadow-xl flex flex-col h-[580px] overflow-hidden bg-slate-950/90">
        
        {/* Chat Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {chatMessages.map(msg => {
            const isSpeakingThis = activeSpeechMsgId === msg.id;
            const isCopiedThis = copiedMsgId === msg.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-amber-500/20'
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
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-black">
                        {msg.category}
                      </span>
                    )}
                  </div>

                  <div className={`p-4.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                  }`}>
                    <div className="whitespace-pre-line text-slate-100">
                      {msg.text}
                    </div>

                    {msg.specialist && (
                      <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-amber-400 font-extrabold">
                        <Stethoscope className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Recommended Specialist: {msg.specialist}</span>
                      </div>
                    )}

                    {/* AI Message Action Buttons (Read Aloud & Copy) */}
                    {msg.sender === 'ai' && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          {/* Audio Readout */}
                          <button
                            type="button"
                            onClick={() => toggleSpeechOutput(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition"
                          >
                            {isSpeakingThis ? (
                              <>
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-1 bg-amber-400 animate-eq-1 rounded-full" />
                                  <span className="w-1 bg-amber-400 animate-eq-2 rounded-full" />
                                  <span className="w-1 bg-amber-400 animate-eq-3 rounded-full" />
                                </div>
                                <span>Stop Speech</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-amber-400" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>

                          {/* Copy message */}
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-400 hover:text-white font-bold cursor-pointer transition"
                          >
                            {isCopiedThis ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopiedThis ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
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
                          onClick={() => {
                            soundFX.play('click');
                            handleSendChatMessage(sp);
                          }}
                          className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold rounded-xl hover:bg-amber-500/20 cursor-pointer transition"
                        >
                          💡 {sp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* AI Thinking waveform indicator */}
          {chatLoading && (
            <div className="flex items-center gap-3 text-amber-400 font-extrabold text-xs p-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex items-center gap-2">
                {/* Audio Waveform Bars */}
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-1" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-2" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-3" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-4" />
                </div>
                <span>HealthBot AI is computing clinical response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar with Microphone Voice Input */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 no-print">
          <form
            onSubmit={e => {
              e.preventDefault();
              soundFX.play('click');
              handleSendChatMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? "Stop voice listening" : "Click to speak your medical question"}
              className={`p-3 rounded-2xl border transition cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-slate-800 text-amber-400 border-slate-700 hover:border-amber-400 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder={isListening ? "Listening to your voice... Speak now." : "Ask HealthBot AI any medical question (e.g. How to lower glucose? Normal BP ranges?)..."}
              className="flex-1 px-4 py-3 glass-input rounded-2xl outline-none text-xs font-bold text-white placeholder:text-slate-500 shadow-inner"
            />
            
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="btn-magnetic px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-40 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
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
