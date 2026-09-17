import React from 'react';
import { FiCrosshair, FiAlertTriangle } from 'react-icons/fi';

const nucleiFindings = [
  {
    template: 'exposed-panels/wordpress-login',
    severity: 'MEDIUM',
    url: 'https://example.com/wp-login.php',
    desc: 'Publicly reachable administrative login panel discovered with no rate limiting headers.',
    matcher: 'status_code == 200 && body contains "wp-login"',
  },
  {
    template: 'misconfiguration/cors-wildcard',
    severity: 'MEDIUM',
    url: 'https://example.com/wp-json/',
    desc: 'CORS header "Access-Control-Allow-Origin: *" permits cross-origin resource leakage on API endpoints.',
    matcher: 'header contains "Access-Control-Allow-Origin: *"',
  },
];

export default function NucleiTab() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-zinc-950">Nuclei Lightweight Engine Execution</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Passive community template rules triggered during surface audit</p>
        </div>
        <span className="px-2 py-0.5 bg-slate-100 text-zinc-700 border border-slate-200 rounded font-mono text-xs">
          2 Findings
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {nucleiFindings.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <FiCrosshair className="text-red-500 text-[14px]" />
                <span className="font-bold text-zinc-900">{item.template}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                {item.severity}
              </span>
            </div>

            <p className="text-zinc-600 font-sans text-xs my-2 leading-relaxed">{item.desc}</p>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-[11px] text-zinc-600">
              <div><span className="text-zinc-400">Target URI:</span> <span className="text-zinc-900 font-bold">{item.url}</span></div>
              <div><span className="text-zinc-400">Matcher Rule:</span> <span className="text-[#5B6475]">{item.matcher}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}