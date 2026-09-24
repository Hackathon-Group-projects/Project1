const fs = require('fs');

const headersCode = `import React from 'react';
import { FiShield, FiAlertTriangle, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { HiSparkles } from "react-icons/hi2";

const HEADER_EXPLANATIONS = {
  'Content-Security-Policy': {
    what: "Restricts where scripts, images, and other resources can be loaded from.",
    risk: "High risk of Cross-Site Scripting (XSS) attacks. Attackers can inject malicious scripts."
  },
  'Strict-Transport-Security': {
    what: "Forces the browser to only communicate over secure HTTPS connections.",
    risk: "Vulnerable to Man-in-the-Middle (MitM) downgrade attacks intercepting unencrypted traffic."
  },
  'X-Frame-Options': {
    what: "Prevents the site from being rendered inside an iframe on another site.",
    risk: "High risk of Clickjacking attacks. Users might be tricked into clicking hidden elements."
  },
  'X-Content-Type-Options': {
    what: "Stops browsers from trying to MIME-sniff the content type.",
    risk: "Allows MIME confusion attacks leading to potential script execution."
  }
};

export default function HeadersTab({ data, onSwitchTab }) {
  if (!data || !data.rawResults || !data.rawResults.headers) {
    return <div className="p-5 text-sm text-zinc-500">No Headers data available.</div>;
  }

  const { missing, secure } = data.rawResults.headers;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 shadow-md border border-indigo-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <FiShield className="text-8xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">HTTP Security Headers</h2>
          <p className="text-sm text-indigo-200 max-w-2xl leading-relaxed">
            Security headers are HTTP response headers that define the security policies of your web application. 
            They instruct the browser on how to behave securely, protecting against common attacks like XSS, Clickjacking, and protocol downgrades.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-red-500 text-lg" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Missing & Vulnerable ({missing?.length || 0})</h2>
          </div>
          {missing && missing.map((h, i) => {
            const explain = HEADER_EXPLANATIONS[h.header] || { what: 'Enhances security context for the browser.', risk: 'Potentially exposes user data or sessions to exploitation.' };
            return (
              <div key={i} className="bg-white border-l-4 border-l-red-500 border border-slate-200 rounded-r-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-mono text-sm font-bold text-zinc-900">{h.header}</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-red-100 text-red-700">MISSING</span>
                </div>
                <div className="text-xs text-zinc-600 bg-slate-50 p-3 rounded-lg space-y-2 flex-1">
                  <p><span className="font-bold text-zinc-800">What it does:</span> {explain.what}</p>
                  <p className="text-red-700"><span className="font-bold">Risk if missing:</span> {explain.risk}</p>
                </div>
                
                <div className="mt-1 flex justify-end">
                  <button 
                    onClick={() => {
                      if (onSwitchTab) onSwitchTab('ai');
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-secura-chat', {
                          detail: { query: \`How do I fix the missing \${h.header} security header?\` }
                        }));
                      }, 100);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#09090b] hover:bg-zinc-800 active:scale-95 text-white text-[10px] uppercase tracking-wider font-bold rounded-lg shadow-sm transition-all"
                  >
                    <HiSparkles className="text-cyan-400 text-xs" />
                    Fix it
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FiCheck className="text-emerald-500 text-lg" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Secure & Configured ({secure?.length || 0})</h2>
          </div>
          {secure && secure.map((h, i) => {
             const explain = HEADER_EXPLANATIONS[h.header] || { what: 'Provides additional security enforcement.', risk: 'Mitigated.' };
             return (
              <div key={i} className="bg-white border-l-4 border-l-emerald-500 border border-slate-200 rounded-r-xl p-4 shadow-sm flex flex-col gap-3 h-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-mono text-sm font-bold text-zinc-900">{h.header}</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-700">SECURE</span>
                </div>
                <div className="text-xs text-zinc-600 bg-slate-50 p-3 rounded-lg space-y-2">
                  <p><span className="font-bold text-zinc-800">What it does:</span> {explain.what}</p>
                  <div>
                    <span className="font-bold text-zinc-800 block mb-1">Detected Value:</span>
                    <div className="max-h-24 overflow-y-auto bg-[#0B0D13] p-2 rounded text-[10px] font-mono text-emerald-400 break-all border border-zinc-800 shadow-inner">
                      {h.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('client/src/report/HeadersTab.jsx', headersCode);
console.log('Headers rewriten.');
