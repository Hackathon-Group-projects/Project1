import React, { useState } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { FiX, FiSend } from 'react-icons/fi';
import { TbRobot } from "react-icons/tb";
export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am Secura AI. How can I help you analyze vulnerabilities or generate fix patches today?' }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: inputQuery };
    setMessages((prev) => [...prev, userMsg]);
    const query = inputQuery;
    setInputQuery('');

    // Simulate AI response grounded in Secura context
    setTimeout(() => {
      let aiReply = "I've analyzed your query against OWASP standards. Enforcing CSP with nonces or upgrading WordPress core will resolve this exposure.";
      if (query.toLowerCase().includes('csp') || query.toLowerCase().includes('header')) {
        aiReply = "To fix missing CSP headers in Express, use Helmet: app.use(helmet.contentSecurityPolicy({ directives: { defaultSrc: [\"'self'\"] } }));";
      } else if (query.toLowerCase().includes('score') || query.toLowerCase().includes('42')) {
        aiReply = "Your current security score is 42/100 due to missing CSP and WordPress CVE-2024-3934. Fixing these will boost your score by +40 points.";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    }, 800);
  };

  return (
    <>
      {/* ================= FLOATING CHAT BUTTON (BOTTOM CORNER) ================= */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-4 rounded-full bg-[#09090b] text-white font-semibold text-xs shadow-[0_8px_25px_rgba(9,9,11,0.3)] hover:bg-[#18181b] hover:scale-105 active:scale-95 transition-all duration-300 group ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        aria-label="Open Secura AI Assistant"
      >
        <TbRobot className='text-[40px]'/>
      </button>

      {/* ================= BACKDROP OVERLAY ================= */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* ================= SLIDING SIDEBAR DRAWER ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#09090b] text-white flex items-center justify-center">
              <HiSparkles className="text-cyan-400 text-[16px]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Secura AI Remediation</h3>
              <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 1.5 RAG Online
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <FiX className="text-[16px]" />
          </button>
        </div>

        {/* Chat Messages Stream Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs bg-gradient-to-b from-slate-50/30 to-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#09090b] text-white rounded-br-xs'
                    : 'bg-slate-100 text-zinc-800 border border-slate-200/60 rounded-bl-xs font-mono text-[11.5px]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Footer Box */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about security patches..."
              className="w-full pl-3.5 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#09090b] focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-8 h-8 rounded-lg bg-[#09090b] hover:bg-zinc-800 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <FiSend className="text-[13px]" />
            </button>
          </form>
          <div className="text-[10px] text-center text-zinc-400 font-mono mt-2">
            Secura AI can make mistakes. Verify critical security configurations.
          </div>
        </div>
      </div>
    </>
  );
}