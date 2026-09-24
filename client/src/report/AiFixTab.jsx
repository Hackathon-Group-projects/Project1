import React, { useState } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { FiArrowRight, FiShield, FiCpu, FiAlertTriangle, FiCode, FiTerminal, FiX, FiCheck, FiCopy, FiClock, FiPercent, FiSend } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CopyableCodeBlock = ({ className, children, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    const textToCopy = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const match = /language-(\w+)/.exec(className || '');
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
        children={String(children).replace(/\n$/, '')}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1rem', background: '#0B0D13', fontSize: '11px', lineHeight: '1.6' }}
        {...props}
      />
    </div>
  );
};

function getParsedContent(description) {
  if (!description) return { explanation: 'No details provided.', fixCode: '' };
  
  const codeIdx = description.indexOf('```');
  
  if (codeIdx === -1) {
    // If no code blocks exist, just put the whole text in explanation
    return { explanation: description, fixCode: 'No code patch provided. Review configuration manually.' };
  }
  
  // Find the last paragraph break BEFORE the code block
  let splitIdx = description.lastIndexOf('\n\n', codeIdx);
  
  // If there's no double newline, try a single newline
  if (splitIdx === -1) {
    splitIdx = description.lastIndexOf('\n', codeIdx);
  }
  
  // If still no newline, just split exactly at the code block
  if (splitIdx === -1 || splitIdx === 0) {
    splitIdx = codeIdx;
  }

  const explanation = description.substring(0, splitIdx).trim();
  const fixCode = description.substring(splitIdx).trim();

  return { 
    explanation: explanation || 'Security configuration issue detected.', 
    fixCode: fixCode 
  };
}

export default function AiFixTab({ data }) {
      const [chatInput, setChatInput] = useState('');

  

  const handleAskAI = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const event = new CustomEvent('open-secura-chat', {
      detail: { query: chatInput }
    });
    window.dispatchEvent(event);
    setChatInput('');
  };

  if (!data || !data.aiReport) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <HiSparkles className="text-4xl text-zinc-300 mb-3" />
        <h3 className="text-lg font-bold text-zinc-800">No AI Report Found</h3>
      </div>
    );
  }

  const aiData = data.aiReport;
  const issues = aiData.vulnerabilities || [];
  
  const openChatWithContext = (issueTitle) => {
    const event = new CustomEvent('open-secura-chat', {
      detail: { query: `How do I fix ${issueTitle}?` }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6 font-sans pb-20 relative">
      <div className="bg-[#09090b] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="flex flex-col sm:flex-row justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 mb-3">
              <HiSparkles className="text-[12px] text-cyan-400" />
              <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-wider">Gemini 3.5 Lite Online</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Executive Remediation Plan</h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              AI-generated step-by-step instructions to patch detected vulnerabilities. 
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {issues.map((issue, idx) => {
          const isCritical = issue.severity === 'CRITICAL' || issue.severity === 'HIGH';
          return (
            <div key={idx} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all flex flex-col group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                    isCritical ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                <button 
                  onClick={() => openChatWithContext(issue.title || issue.type)}
                  className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded-md transition-colors"
                >
                  <HiSparkles /> Ask AI
                </button>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-2 leading-snug">{issue.title || (issue.type.replace(/_/g, ' ').toUpperCase())}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                {issue.description}
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-modal', { detail: { issue: issue } }))}
                className="w-full mt-auto py-2 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                View in Details
                <FiArrowRight className="text-xs text-slate-400" />
              </button>
            </div>
          );
        })}
      </div>

      
      {/* Custom AI Query Card */}
      <div className="mt-8 bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 sm:p-8 shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HiSparkles className="text-8xl text-cyan-400" />
        </div>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 mb-3">
              <HiSparkles className="text-[12px] text-cyan-400" />
              <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-wider">Ask Custom Query</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Have a specific question about these patches?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              Type your question below and Secura AI will answer it using your scan data as context. 
            </p>
          </div>
          
          <div className="flex-1 w-full">
            <form onSubmit={handleAskAI} className="relative flex items-center w-full">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="E.g., How do I apply this fix in Docker?"
                className="w-full pl-4 pr-12 py-3.5 bg-zinc-800/50 border border-zinc-700/80 rounded-xl text-sm font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 focus:bg-zinc-800 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 w-9 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <FiSend className="text-sm" />
              </button>
            </form>
          </div>
        </div>
      </div>

      
    </div>
  );
}
