const fs = require('fs');

const headersCode = `import React from 'react';
import { FiShield, FiAlertTriangle, FiCheck, FiX, FiInfo } from 'react-icons/fi';

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

export default function HeadersTab({ data }) {
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
                <div className="text-xs text-zinc-600 bg-slate-50 p-3 rounded-lg space-y-2">
                  <p><span className="font-bold text-zinc-800">What it does:</span> {explain.what}</p>
                  <p className="text-red-700"><span className="font-bold">Risk if missing:</span> {explain.risk}</p>
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
              <div key={i} className="bg-white border-l-4 border-l-emerald-500 border border-slate-200 rounded-r-xl p-4 shadow-sm flex flex-col gap-3">
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

const sslCode = `import React from 'react';
import { FiLock, FiAlertTriangle, FiCheck, FiInfo, FiShield } from 'react-icons/fi';

export default function SslTab({ data }) {
  if (!data || !data.rawResults || !data.rawResults.ssl) {
    return <div className="p-5 text-sm text-gray-500">No SSL data available.</div>;
  }
  const ssl = data.rawResults.ssl;
  
  // Calculate days left theoretically
  const validTo = new Date(ssl.valid_to || Date.now() + 86400000 * 30);
  const validFrom = new Date(ssl.valid_from || Date.now());
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((validTo - now) / (1000 * 60 * 60 * 24)));
  const isExpired = daysLeft === 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <FiLock className="text-8xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Transport Layer Security (SSL/TLS)</h2>
          <p className="text-sm text-teal-100 max-w-2xl leading-relaxed">
            SSL/TLS encrypts the connection between the user's browser and your server. 
            Without proper encryption, all data (including passwords and session cookies) is sent in plain text, 
            making the site highly vulnerable to Man-in-the-Middle (MitM) attacks.
          </p>
        </div>
      </div>

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
            <FiAlertTriangle className="text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900 mb-1">CRITICAL: Certificate Expired</h3>
            <p className="text-xs text-red-800/80 leading-relaxed">
              Your SSL certificate has expired. Modern browsers (Chrome, Firefox, Safari) will block users from accessing your site, displaying a massive "Not Secure" or "Your connection is not private" warning. Renew immediately!
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Protocol Status</div>
          <div className="flex items-center gap-2">
            <FiCheck className="text-emerald-500 text-xl" />
            <span className="text-lg font-bold text-zinc-900">HTTPS Enforced</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Certificate Issuer</div>
          <div className="text-sm font-bold text-zinc-900 font-mono truncate">{ssl.issuer || 'Let\'s Encrypt Authority'}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Validity Remaining</div>
          <div className="flex items-baseline gap-1">
            <span className={\`text-2xl font-extrabold font-mono \${daysLeft > 30 ? 'text-emerald-600' : daysLeft > 0 ? 'text-amber-500' : 'text-red-600'}\`}>
              {daysLeft}
            </span>
            <span className="text-xs font-bold text-slate-500">Days</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Certificate Details</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Subject / Domain</div>
            <div className="text-xs font-mono text-zinc-800">{ssl.subject || data.targetUrl}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Encryption Protocol</div>
            <div className="text-xs font-mono text-zinc-800">{ssl.protocol || 'TLSv1.3'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valid From</div>
            <div className="text-xs font-mono text-zinc-800">{validFrom.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valid To</div>
            <div className="text-xs font-mono text-zinc-800">{validTo.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('client/src/report/HeadersTab.jsx', headersCode);
fs.writeFileSync('client/src/report/SslTab.jsx', sslCode);
