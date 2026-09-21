import React, { useState } from 'react';
import { FiCopy, FiExternalLink, FiCode, FiCheck } from 'react-icons/fi';

export default function OverviewTab() {
  const [fixLang, setFixLang] = useState('express');
  const [copied, setCopied] = useState(false);

  const expressCode = `// Install: npm install helmet
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "trusted-cdn.com"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
}));`;

  const nginxCode = `# In server block or http context
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://trusted-cdn.com;" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;`;

  const copySnippet = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Severity Breakdown Counter */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="text-xs font-bold text-zinc-900 uppercase tracking-wide mb-4 flex items-center justify-between">
          <span>Severity Breakdown</span>
          <span className="text-[10px] font-mono text-zinc-400">TOTAL: 18 DETECTIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-red-700 uppercase">Critical</div>
              <div className="text-2xl font-extrabold font-mono text-red-800 mt-0.5">2</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-orange-700 uppercase">High</div>
              <div className="text-2xl font-extrabold font-mono text-orange-800 mt-0.5">5</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-amber-700 uppercase">Medium</div>
              <div className="text-2xl font-extrabold font-mono text-amber-800 mt-0.5">8</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Low</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-0.5">3</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Prioritized List Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wide">Prioritized Vulnerabilities</h2>
        <span className="text-[10px] font-mono text-zinc-400">SORTED BY THREAT WEIGHT</span>
      </div>

      {/* VULNERABILITY 1: Critical CSP Missing */}
      <div className="bg-white border border-red-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
        
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-200">
              CRITICAL
            </span>
            <span className="text-[11px] font-mono text-zinc-400">OWASP A03:2021 – Injection</span>
          </div>
          <span className="text-xs font-mono font-bold text-red-600">-25 Pts Deduction</span>
        </div>

        <h3 className="text-base font-bold text-zinc-950 mb-2">Missing Content-Security-Policy (CSP)</h3>

        <div className="space-y-3 text-xs text-zinc-600">
          <div>
            <span className="font-bold text-zinc-900 block mb-0.5">📖 What is it?</span>
            <p className="leading-relaxed">
              CSP restricts the domains from which scripts, images, and styles can be fetched and executed. Without it, standard browser security defenses against Cross-Site Scripting (XSS) are bypassed.
            </p>
          </div>
          <div>
            <span className="font-bold text-zinc-900 block mb-0.5">⚠️ Why it matters?</span>
            <p className="leading-relaxed">
              Adversaries can inject arbitrary client JavaScript to steal `document.cookie` tokens, trigger unauthorized REST API mutations, or alter UI components.
            </p>
          </div>
        </div>

        {/* Patch Generator Section */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <FiCode className="text-[14px] text-[#8C95A6]" />
              <span>Remediation Patch</span>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFixLang('express')}
                className={`px-2.5 py-1 text-[10.5px] rounded font-mono font-semibold transition-all ${
                  fixLang === 'express' ? 'bg-zinc-900 text-white' : 'bg-slate-100 text-zinc-600 hover:bg-slate-200'
                }`}
              >
                Express.js
              </button>
              <button
                type="button"
                onClick={() => setFixLang('nginx')}
                className={`px-2.5 py-1 text-[10.5px] rounded font-mono font-semibold transition-all ${
                  fixLang === 'nginx' ? 'bg-zinc-900 text-white' : 'bg-slate-100 text-zinc-600 hover:bg-slate-200'
                }`}
              >
                Nginx
              </button>
            </div>
          </div>

          <div className="relative bg-[#0B0D13] border border-zinc-800 rounded-xl p-3.5 font-mono text-xs text-slate-200">
            <pre className="overflow-x-auto leading-relaxed">
              <code>{fixLang === 'express' ? expressCode : nginxCode}</code>
            </pre>
            <button
              type="button"
              onClick={() => copySnippet(fixLang === 'express' ? expressCode : nginxCode)}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-200 font-mono flex items-center gap-1"
            >
              {copied ? <FiCheck className="text-emerald-400 text-[11px]" /> : <FiCopy className="text-[11px]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VULNERABILITY 2: High CVE WordPress */}
      <div className="bg-white border border-orange-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
        
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
              HIGH
            </span>
            <span className="text-[11px] font-mono text-zinc-400">CVE-2024-3934</span>
          </div>
          <span className="text-xs font-mono font-bold text-orange-600">-15 Pts Deduction</span>
        </div>

        <h3 className="text-base font-bold text-zinc-950 mb-1">WordPress 6.2 — Unauthenticated XSS Injection</h3>
        <p className="text-xs text-zinc-600 mb-3 leading-relaxed">
          Flawed block parser attributes allow unauthorized stored scripts. Fingerprinted directly from the `generator` meta tag.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="font-mono">
            <span className="text-zinc-500">Remediation:</span> <span className="font-bold text-zinc-800">Upgrade core to WordPress 6.4+</span>
          </div>
          <a 
            href="https://nvd.nist.gov" 
            target="_blank" 
            rel="noreferrer"
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 font-mono text-[11px] font-medium text-zinc-800 flex items-center gap-1 shadow-2xs transition-all"
          >
            <FiExternalLink className="text-[11px] text-zinc-500" />
            <span>NVD Advisory</span>
          </a>
        </div>
      </div>
    </div>
  );
}
