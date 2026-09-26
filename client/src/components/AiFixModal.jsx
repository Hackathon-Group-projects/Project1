import React from 'react';
import { FiX, FiAlertTriangle, FiShield, FiCheck, FiCopy } from 'react-icons/fi';
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
  const codeIdx = description.indexOf('\`\`\`');
  if (codeIdx === -1) {
    return { explanation: description, fixCode: 'No code patch provided. Review configuration manually.' };
  }
  let splitIdx = description.lastIndexOf('\n\n', codeIdx);
  if (splitIdx === -1) splitIdx = description.lastIndexOf('\n', codeIdx);
  if (splitIdx === -1 || splitIdx === 0) splitIdx = codeIdx;
  return {
    explanation: description.substring(0, splitIdx).trim() || 'Security configuration issue detected.',
    fixCode: description.substring(splitIdx).trim()
  };
}

function getPrFixData(description, title) {
  try {
    let cleanDesc = description;
    if (cleanDesc.includes('```json')) {
      cleanDesc = cleanDesc.split('```json')[1].split('```')[0].trim();
    }
    const parsed = JSON.parse(cleanDesc);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        filePath: parsed[0].filePath || 'src/security-fix.js',
        replacementCode: parsed[0].replacementCode
      };
    } else if (parsed && parsed.filePath && parsed.replacementCode) {
      return parsed;
    }
    throw new Error('Not perfect JSON');
  } catch (e) {
    const parsedMd = getParsedContent(description);
    return {
      filePath: `src/fixes/${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.js`,
      replacementCode: parsedMd.fixCode
    };
  }
}


export default function AiFixModal({ issue, onClose }) {
  const [showPrForm, setShowPrForm] = React.useState(false);
  const [formData, setFormData] = React.useState({ repoUrl: '', patToken: '' });
  const [isPrLoading, setIsPrLoading] = React.useState(false);
  const [prResult, setPrResult] = React.useState(null);

  const handleCreatePr = async () => {
    if (!formData.repoUrl || !formData.patToken) return;
    setIsPrLoading(true);
    setPrResult(null);

    try {
      const fixData = getPrFixData(issue.description, issue.title || issue.type || 'fix');

      const response = await fetch('http://localhost:3000/api/github/create-pr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: formData.repoUrl,
          patToken: formData.patToken,
          fixData: fixData
        })
      });
      const data = await response.json();
      if (response.ok) {
        setPrResult({ success: true, url: data.prUrl });
      } else {
        setPrResult({ success: false, error: data.error || 'Failed to create PR' });
      }
    } catch (error) {
      setPrResult({ success: false, error: 'Network error occurred' });
    } finally {
      setIsPrLoading(false);
    }
  };

  if (!issue) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(issue.severity === 'CRITICAL' || issue.severity === 'HIGH')
              ? 'bg-red-100 text-red-600'
              : 'bg-amber-100 text-amber-600'
              }`}>
              <FiAlertTriangle className="text-[15px]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                {issue.title || (issue.type?.replace(/_/g, ' ').toUpperCase()) || 'Security Issue'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-zinc-500 hover:text-zinc-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100/80">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            <div className="flex items-center gap-1.5"><FiShield className="text-slate-400" /> Category: {issue.type || 'Configuration'}</div>
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
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const hasNewline = String(children).includes('\n');
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
                {getParsedContent(issue.description).explanation}
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <span className="text-lg">🛠️</span> How to fix it (Step-by-step guide & code)
              </h3>
              <button
                onClick={() => setShowPrForm(!showPrForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition-colors"
              >
                🚀 Auto-Fix via PR
              </button>
            </div>

            {showPrForm && (
              <div className="mt-3 mb-4 p-4 bg-white rounded-lg border border-emerald-100 shadow-sm animate-in fade-in duration-200">
                <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">GitHub Actions</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">GitHub Repo URL</label>
                    <input
                      name="github-repo-url-field"
                      type="url"
                      autoComplete="off"
                      spellCheck="false"
                      placeholder="https://github.com/username/repo-name"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={formData.repoUrl}
                      onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Personal Access Token (PAT)</label>
                    <input
                      name="github-pat-token-field"
                      type="password"
                      autoComplete="new-password"
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={formData.patToken}
                      onChange={(e) => setFormData({ ...formData, patToken: e.target.value })}
                    />
                    <p className="mt-1.5 text-[9px] text-slate-500">
                      Format: `ghp_...` | Get one from <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">GitHub Settings &rarr; Developer settings &rarr; Tokens (classic)</a>. Make sure to check the <b>repo</b> scope.
                    </p>
                  </div>

                  {prResult && (
                    <div className={`p-2.5 rounded border text-xs ${prResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {prResult.success ? (
                        <div className="flex items-center gap-2">
                          <FiCheck className="text-sm" />
                          <span>PR Created! <a href={prResult.url} target="_blank" rel="noopener noreferrer" className="font-bold underline">View on GitHub</a></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FiAlertTriangle className="text-sm" />
                          <span>{prResult.error}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleCreatePr}
                      disabled={isPrLoading || !formData.repoUrl || !formData.patToken}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md text-xs font-bold disabled:opacity-50 hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      {isPrLoading ? 'Creating PR...' : 'Create Pull Request'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-zinc-600 leading-relaxed markdown-body-chat">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const hasNewline = String(children).includes('\n');
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
                {getParsedContent(issue.description).fixCode || "Apply the theoretical fix based on standard security practices."}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
