import React from 'react';
import { FiCheckCircle, FiShield, FiCalendar, FiCpu } from 'react-icons/fi';

export default function SslTab() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <FiShield className="text-[16px]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Transport Layer Security (TLS/SSL)</h3>
            <span className="text-[11px] text-zinc-500 font-mono">TLS 1.3 Negotiated Handshake</span>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold rounded-lg text-sm">
            Grade: A+
          </span>
        </div>
      </div>

      {/* Grid Meta Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs">
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase mb-1">
            <FiCpu className="text-[13px]" />
            <span>Certificate Authority (Issuer)</span>
          </div>
          <div className="font-bold text-zinc-900">Let's Encrypt Authority X3</div>
          <div className="text-[11px] text-zinc-500 font-sans mt-0.5">RSA 2048-bit with OCSP Stapling active</div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase mb-1">
            <FiCalendar className="text-[13px]" />
            <span>Validity & Expiration</span>
          </div>
          <div className="font-bold text-zinc-900">Valid until 2026-12-01</div>
          <div className="text-[11px] text-emerald-600 font-semibold font-sans mt-0.5">78 days remaining (Auto-renews)</div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-zinc-400 text-[11px] uppercase block mb-1">Active Cipher Suite</span>
          <div className="font-bold text-zinc-900 break-all">TLS_AES_256_GCM_SHA384</div>
          <div className="text-[11px] text-zinc-500 font-sans mt-0.5">Perfect Forward Secrecy (PFS) enabled</div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-zinc-400 text-[11px] uppercase block mb-1">Deprecated Protocols</span>
          <div className="font-bold text-emerald-700 flex items-center gap-1">
            <FiCheckCircle className="text-[13px]" />
            <span>SSLv3, TLS 1.0, TLS 1.1 Disabled</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-sans mt-0.5">Zero POODLE or BEAST attack vectors</div>
        </div>
      </div>
    </div>
  );
}
