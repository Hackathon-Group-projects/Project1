import React from 'react';
import { FiAlertCircle, FiExternalLink } from 'react-icons/fi';

const cveList = [
  {
    id: 'CVE-2024-3934',
    severity: 'HIGH',
    score: '7.8',
    title: 'WordPress Core <= 6.2 - Stored Cross-Site Scripting (XSS)',
    pkg: 'WordPress 6.2',
    fixedIn: 'WordPress 6.4',
  },
  {
    id: 'CVE-2023-5561',
    severity: 'MEDIUM',
    score: '5.3',
    title: 'User Enumeration via REST API application endpoints',
    pkg: 'WordPress 6.2',
    fixedIn: 'WordPress 6.3.2',
  },
  {
    id: 'CVE-2023-38000',
    severity: 'MEDIUM',
    score: '6.1',
    title: 'Open redirect vulnerability across default login paths',
    pkg: 'WordPress 6.2',
    fixedIn: 'WordPress 6.2.2',
  },
];

export default function CvesTab() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-zinc-950">Open Source Vulnerabilities (OSV.dev)</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Live matching against global vulnerability databases (NVD, GitHub Advisories)</p>
        </div>
        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-mono font-bold text-xs">
          7 Matches Found
        </span>
      </div>

      <div className="space-y-3">
        {cveList.map((cve, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-zinc-950">{cve.id}</span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                  cve.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {cve.severity} (CVSS {cve.score})
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Component: {cve.pkg}</span>
            </div>

            <p className="text-xs text-zinc-700 mb-2 leading-relaxed">{cve.title}</p>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70 font-mono">
              <span className="text-emerald-700 font-semibold">Fixed In: {cve.fixedIn}</span>
              <a
                href={`https://osv.dev/vulnerability/${cve.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-600 hover:text-zinc-950 flex items-center gap-1 transition-colors"
              >
                <span>OSV Record</span>
                <FiExternalLink className="text-[11px]" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}