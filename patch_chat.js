const fs = require('fs');

const chatCode = `import React, { useState, useEffect } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { FiX, FiSend, FiCopy, FiCheck } from 'react-icons/fi';
import { TbRobot } from "react-icons/tb";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CopyableCodeBlock = ({ className, children, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    const textToCopy = String(children).replace(/\\n$/, '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const match = /language-(\\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  return (
    <div className="relative my-3 rounded-xl overflow-hidden shadow-sm border border-zinc-800">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
        <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">{language}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors bg-transparent border-none p-1">
          {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        children={String(children).replace(/\\n$/, '')}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1rem', background: '#0B0D13', fontSize: '11px', lineHeight: '1.6' }}
        {...props}
      />
    </div>
  );
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am Secura AI. How can I help you analyze vulnerabilities or generate fix patches today?' }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      if (e.detail && e.detail.query) {
        sendMessage(e.detail.query);
      }
    };
    window.addEventListener('open-secura-chat', handleOpenChat);
    return () => window.removeEventListener('open-secura-chat', handleOpenChat);
  }, []);

  const sendMessage = async (queryText) => {
    if (!queryText.trim()) return;

    const userMsg = { sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const scanContext = localStorage.getItem('lastScanId');
      const bodyPayload = {
        question: queryText,
        report_context: scanContext ? \`Focus on scan ID: \${scanContext}\` : "General security context"
      };

      const res = await fetch(\`http://\${window.location.hostname}:8000/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Error connecting to Gemini API. Please check backend.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Network error. Cannot reach AI server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const query = inputQuery;
    setInputQuery('');
    sendMessage(query);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={\`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-4 rounded-full bg-[#09090b] text-white font-semibold text-xs shadow-[0_8px_25px_rgba(9,9,11,0.3)] hover:bg-[#18181b] hover:scale-105 active:scale-95 transition-all duration-300 group \${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }\`}
        aria-label="Open Secura AI Assistant"
      >
        <TbRobot className='text-[40px]'/>
      </button>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      <div
        className={\`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out \${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }\`}
      >
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#09090b] text-white flex items-center justify-center">
              <HiSparkles className="text-cyan-400 text-[16px]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Secura AI Remediation</h3>
              <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.5 Lite RAG Online
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

        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs bg-gradient-to-b from-slate-50/30 to-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={\`flex flex-col \${msg.sender === 'user' ? 'items-end' : 'items-start'}\`}
            >
              <div
                className={\`max-w-[85%] p-3.5 rounded-2xl leading-relaxed \${
                  msg.sender === 'user'
                    ? 'bg-[#09090b] text-white rounded-br-xs'
                    : 'bg-slate-100 text-zinc-800 border border-slate-200/60 rounded-bl-xs'
                }\`}
              >
                {msg.sender === 'ai' ? (
                  <div className="markdown-body-chat">
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        code({node, className, children, ...props}) {
                          const match = /language-(\\w+)/.exec(className || '');
                          const hasNewline = String(children).includes('\\n');
                          const isBlock = match || hasNewline;
                          return isBlock ? (
                            <CopyableCodeBlock className={className} {...props}>{children}</CopyableCodeBlock>
                          ) : (
                            <code className="px-1.5 py-0.5 bg-slate-200/50 rounded-md font-mono text-[10.5px] border border-slate-200 text-zinc-800 whitespace-nowrap" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="font-mono text-[11.5px] whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="max-w-[85%] p-3.5 rounded-2xl leading-relaxed bg-slate-100 text-zinc-800 border border-slate-200/60 rounded-bl-xs font-mono text-[11.5px] flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>

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
              disabled={isLoading}
              className="absolute right-1.5 w-8 h-8 rounded-lg bg-[#09090b] hover:bg-zinc-800 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <FiSend className="text-[13px]" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
`;

fs.writeFileSync('client/src/components/AIChatWidget.jsx', chatCode);
