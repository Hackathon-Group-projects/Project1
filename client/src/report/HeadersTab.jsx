import React from 'react';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

const headerSpecs = [
  {
    name: 'Content-Security-Policy',
    status: 'MISSING',
    type: 'danger',
    value: null,
    desc: 'Mitigates cross-site scripting (XSS) and data injection vulnerabilities.',
  },
  {
    name: 'Strict-Transport-Security (HSTS)',
    status: 'MISSING',
    type: 'danger',
    value: null,
    desc: 'Enforces secure HTTPS connections and eliminates SSL stripping risks.',
  },
  {
    name: 'X-Frame-Options',
    status: 'PRESENT',
    type: 'success',
    value: 'DENY',
    desc: 'Prevents clickjacking by disabling unauthorized iframe embedding.',
  },
  {
    name: 'X-Content-Type-Options',
    status: 'PRESENT',
    type: 'success',
    value: 'nosniff',
    desc: 'Prevents MIME-type confusion sniffing across scripts and style assets.',
  },
  {
    name: 'Referrer-Policy',
    status: 'WARN',
    type: 'warning',
    value: 'no-referrer-when-downgrade',
    desc: 'Controls how much referrer information is transmitted during outgoing requests.',
  },
  {
    name: 'Permissions-Policy',
    status: 'MISSING',
    type: 'danger',
    value: null,
    desc: 'Restricts camera, microphone, and geolocation browser device APIs.',
  },
];

export default function HeadersTab() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-zinc-950">HTTP Response Security Headers</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Passive inspection of HTTP/1.1 and HTTP/2 response metadata</p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold">
          Score: 3/6 Passing
        </span>
      </div>

      <div className="divide-y divide-slate-100 font-mono text-xs">
        {headerSpecs.map((hdr, idx) => (
          <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900">{hdr.name}</span>
                {hdr.value && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-zinc-600 text-[10.5px]">
                    "{hdr.value}"
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-zinc-500 font-sans mt-0.5">{hdr.desc}</p>
            </div>

            <div className="shrink-0">
              {hdr.status === 'PRESENT' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  <FiCheck className="text-[11px]" /> PRESENT
                </span>
              )}
              {hdr.status === 'MISSING' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 font-bold text-[10px]">
                  <FiX className="text-[11px]" /> MISSING
                </span>
              )}
              {hdr.status === 'WARN' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                  <FiAlertTriangle className="text-[11px]" /> WEAK CONFIG
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
