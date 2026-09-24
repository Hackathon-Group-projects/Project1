import React from 'react';
import { FiLock, FiAlertTriangle, FiCheck } from 'react-icons/fi';

export default function SslTab({ data }) {
  if (!data || !data.rawResults || !data.rawResults.ssl) {
    return <div className="p-5 text-sm text-gray-500">No SSL data available.</div>;
  }
  const ssl = data.rawResults.ssl;
  
  const daysLeft = ssl.daysRemaining || 0;
  const isExpired = !ssl.valid || daysLeft <= 0;

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
            <h3 className="text-sm font-bold text-red-900 mb-1">CRITICAL: Certificate Invalid/Expired</h3>
            <p className="text-xs text-red-800/80 leading-relaxed">
              Your SSL certificate is invalid. Modern browsers (Chrome, Firefox, Safari) will block users from accessing your site, displaying a massive "Not Secure" warning. Renew immediately!
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Protocol Status</div>
          <div className="flex items-center gap-2">
            {ssl.valid ? <FiCheck className="text-emerald-500 text-xl" /> : <FiAlertTriangle className="text-red-500 text-xl" />}
            <span className="text-lg font-bold text-zinc-900">{ssl.valid ? 'HTTPS Verified' : 'HTTPS Broken'}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Grade</div>
          <div className="text-sm font-bold text-zinc-900 font-mono truncate">{ssl.grade || 'Unknown'}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Validity Remaining</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-extrabold font-mono ${daysLeft > 30 ? 'text-emerald-600' : daysLeft > 0 ? 'text-amber-500' : 'text-red-600'}`}>
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
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Host</div>
            <div className="text-xs font-mono text-zinc-800">{data.targetUrl}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Issuer</div>
            <div className="text-xs font-mono text-zinc-800">{ssl.issuer || 'N/A'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valid From</div>
            <div className="text-xs font-mono text-zinc-800">{ssl.validFrom || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valid To</div>
            <div className="text-xs font-mono text-zinc-800">{ssl.validTo || 'Unknown'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
