import React, { useState } from 'react';
import { FiArrowRight, FiCopy, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function AiFixTab() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [copiedHsts, setCopiedHsts] = useState(false);

  const askAi = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setResponse(`Analyzing OWASP guidelines for "${question}"...\n\nRecommendation: When deploying Content-Security-Policy in Express, generate random cryptographically strong nonces per request:\n\nconst nonce = crypto.randomBytes(16).toString('base64');\nres.locals.cspNonce = nonce;\n\nThen pass "'nonce-' + nonce" into your scriptSrc directive within helmet.contentSecurityPolicy.`);
  };

  const copyCode = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Executive Summary Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <HiSparkles className="text-[14px] text-cyan-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Gemini 1.5 Executive Remediation Plan</h3>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-zinc-600 border border-slate-200">
            OWASP GROUNDED
          </span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed mb-4">
          This target exhibits critical exposure primarily due to missing CSP headers and outdated CMS software (WordPress 6.2). Resolving these two items will immediately recover <span className="font-bold text-emerald-600 font-mono">+40 security points</span>.
        </p>

        {/* Priority Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Priority 1</span>
            <div className="text-xs font-bold text-zinc-900 mt-0.5">Enforce CSP Header</div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">Est. Time: 30 mins</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Priority 2</span>
            <div className="text-xs font-bold text-zinc-900 mt-0.5">Upgrade WP to 6.4+</div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">Est. Time: 15 mins</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Priority 3</span>
            <div className="text-xs font-bold text-zinc-900 mt-0.5">Restrict CORS Wildcard</div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">Est. Time: 20 mins</div>
          </div>
        </div>
      </div>

      {/* Interactive RAG AI Assistant */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h4 className="text-xs font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
          <HiSparkles className="text-[#8C95A6]" />
          <span>Ask Secura AI Assistant (RAG Grounded)</span>
        </h4>
        <form onSubmit={askAi} className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., How to configure CSP nonce with Express Helmet?"
            className="w-full pl-3.5 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#8C95A6] focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <span>Ask</span>
            <FiArrowRight className="text-[12px]" />
          </button>
        </form>

        {response && (
          <div className="mt-4 p-4 rounded-xl bg-[#0B0D13] border border-zinc-800 text-slate-200 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span className="text-cyan-400 flex items-center gap-1">
                <HiSparkles className="text-[14px]" /> Secura Assistant Response
              </span>
              <span className="text-zinc-500">OWASP Source: CSP v2024</span>
            </div>
            <p className="text-zinc-300 font-sans leading-relaxed whitespace-pre-line">{response}</p>
          </div>
        )}
      </div>

      {/* Direct Copyable Code Patches */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Production Manifest Fixes</h4>
          <span className="text-[10px] font-mono text-zinc-400">COPY & DEPLOY</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
          <span className="font-bold text-xs text-zinc-900 block mb-1">Nginx HSTS Enforcer</span>
          <p className="text-xs text-zinc-500 mb-2 font-sans">Forces browser HTTPS transport for 1 year including subdomains.</p>
          <div className="bg-[#0B0D13] p-3 rounded-lg text-slate-200 font-mono text-[11px] relative">
            <code>add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;</code>
            <button
              type="button"
              onClick={() => copyCode('add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;', setCopiedHsts)}
              className="absolute top-2 right-2 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 font-mono flex items-center gap-1"
            >
              {copiedHsts ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
              <span>{copiedHsts ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
