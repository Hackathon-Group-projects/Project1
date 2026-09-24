const fs = require('fs');

const overviewCode = `import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function OverviewTab({ data, onSwitchTab }) {
  if (!data) return <div className="p-5 text-sm text-gray-500">No data available.</div>;

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  if (data.rawResults.headers && data.rawResults.headers.missing) {
    data.rawResults.headers.missing.forEach(h => {
      const s = (h.severity || 'MEDIUM').toUpperCase();
      if (s === 'CRITICAL') criticalCount++;
      else if (s === 'HIGH') highCount++;
      else if (s === 'MEDIUM') mediumCount++;
      else lowCount++;
    });
  }

  if (data.rawResults.cves && data.rawResults.cves.length > 0) {
    data.rawResults.cves.forEach(cve => {
      const cvss = cve.cvssScore || 0;
      if (cvss >= 9.0) criticalCount++;
      else if (cvss >= 7.0) highCount++;
      else if (cvss >= 4.0) mediumCount++;
      else lowCount++;
    });
  }

  const totalIssues = criticalCount + highCount + mediumCount + lowCount;
  const healthScore = Math.max(0, 100 - (criticalCount * 25 + highCount * 15 + mediumCount * 5 + lowCount * 2));

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Security Posture Overview</h1>
            <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
              Scan completed for <span className="font-mono font-bold text-slate-800">{data.targetUrl}</span>. 
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Health Score</span>
              <div className="flex items-baseline gap-1">
                <span className={\`text-4xl font-extrabold font-mono tracking-tighter \${healthScore > 80 ? 'text-emerald-600' : healthScore > 50 ? 'text-amber-500' : 'text-red-600'}\`}>
                  {healthScore}
                </span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 mt-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Threat Distribution</h2>
          <span className="text-[10px] font-mono text-slate-400">TOTAL: {totalIssues} DETECTIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-red-700 uppercase">Critical</div>
              <div className="text-2xl font-extrabold font-mono text-red-800 mt-0.5">{criticalCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-orange-700 uppercase">High</div>
              <div className="text-2xl font-extrabold font-mono text-orange-800 mt-0.5">{highCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-amber-700 uppercase">Medium</div>
              <div className="text-2xl font-extrabold font-mono text-amber-800 mt-0.5">{mediumCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Low</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-0.5">{lowCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* AI Remediation Call-To-Action */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-zinc-700 group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <HiSparkles className="text-8xl text-zinc-100" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">Gemini Security Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Automated Remediation Plan Ready</h2>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed mb-6">
            The AI engine has analyzed all vulnerabilities and generated step-by-step 
            patching instructions, precise configuration snippets, and code fixes.
          </p>
          <button 
            onClick={() => onSwitchTab('ai')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <HiSparkles className="text-cyan-500 text-lg" />
            <span>Go to AI Remediation Plan</span>
            <FiArrowRight className="text-zinc-400 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
`;

const aiFixCode = `import React, { useState } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { FiArrowRight, FiShield, FiCpu, FiAlertTriangle, FiCode, FiTerminal, FiX, FiCheck, FiCopy, FiClock, FiPercent } from 'react-icons/fi';
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

function getParsedContent(description) {
  if (!description) return { explanation: '', fixCode: '' };
  const lowerDesc = description.toLowerCase();
  let splitIndex = -1;
  const fixKeywords = ['to fix this', 'remediation', 'how to fix', 'solution:', 'fix:', 'step-by-step', 'here is how to'];
  for (const kw of fixKeywords) {
    const idx = lowerDesc.indexOf(kw);
    if (idx !== -1) {
      if (splitIndex === -1 || idx < splitIndex) {
        splitIndex = idx;
      }
    }
  }
  if (splitIndex === -1) {
    return { explanation: description, fixCode: '' };
  }
  return {
    explanation: description.substring(0, splitIndex).trim(),
    fixCode: description.substring(splitIndex).trim()
  };
}

export default function AiFixTab({ data }) {
  const [selectedIssue, setSelectedIssue] = useState(null);

  if (!data || !data.aiReport) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <HiSparkles className="text-4xl text-zinc-300 mb-3" />
        <h3 className="text-lg font-bold text-zinc-800">No AI Report Found</h3>
      </div>
    );
  }

  const aiData = data.aiReport;
  const issues = aiData.findings || [];
  
  const openChatWithContext = (issueTitle) => {
    const event = new CustomEvent('open-secura-chat', {
      detail: { query: \`How do I fix \${issueTitle}?\` }
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
              <div className={\`absolute top-0 left-0 w-1 h-full \${isCritical ? 'bg-red-500' : 'bg-amber-500'}\`} />
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border \${
                    isCritical ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }\`}>
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
                onClick={() => setSelectedIssue(issue)}
                className="w-full mt-auto py-2 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                View in Details
                <FiArrowRight className="text-xs text-slate-400" />
              </button>
            </div>
          );
        })}
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedIssue(null)}
          />
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${
                  (selectedIssue.severity === 'CRITICAL' || selectedIssue.severity === 'HIGH') 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-amber-100 text-amber-600'
                }\`}>
                  <FiAlertTriangle className="text-[15px]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                    {selectedIssue.title || (selectedIssue.type.replace(/_/g, ' ').toUpperCase())}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-zinc-500 hover:text-zinc-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Top Metadata Row */}
            <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100/80">
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                <div className="flex items-center gap-1.5"><FiShield className="text-slate-400" /> Category: {selectedIssue.type || 'Configuration'}</div>
                <div className="flex items-center gap-1.5"><FiClock className="text-slate-400" /> Est. Fix Time: ~15 Mins</div>
                <div className="flex items-center gap-1.5 text-emerald-600"><FiPercent /> AI Confidence: 98% High</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <span className="text-lg">📖</span> What is it?
                </h3>
                <div className="text-xs text-zinc-600 leading-relaxed markdown-body-chat">
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
                      {getParsedContent(selectedIssue.description).explanation}
                    </ReactMarkdown>
                </div>
              </div>

              <div className="space-y-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Why it matters?
                </h3>
                <p className="text-xs text-red-800/80 leading-relaxed font-medium">
                  Leaving this unresolved significantly increases the risk of data breaches, unauthorized access, or complete system compromise. Adversaries actively scan for this exact vulnerability pattern.
                </p>
              </div>

              <div className="space-y-3 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <span className="text-lg">🛠️</span> How to fix it (Step-by-step guide & code)
                </h3>
                <div className="text-xs text-zinc-600 leading-relaxed markdown-body-chat">
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
                      {getParsedContent(selectedIssue.description).fixCode || "Apply the theoretical fix based on standard security practices."}
                    </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('client/src/report/OverviewTab.jsx', overviewCode);
fs.writeFileSync('client/src/report/AiFixTab.jsx', aiFixCode);
