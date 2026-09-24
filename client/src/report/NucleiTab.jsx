import React from 'react';
import { HiSparkles } from "react-icons/hi2";
import { FiActivity, FiTerminal } from 'react-icons/fi';

export default function NucleiTab({ data, onSwitchTab }) {
  if (!data || !data.rawResults || !data.rawResults.nuclei || data.rawResults.nuclei.length === 0) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <FiActivity className="text-4xl text-zinc-300 mb-3" />
        <h3 className="text-lg font-bold text-zinc-800">No Nuclei Findings</h3>
        <p className="text-sm text-zinc-500 mt-2">
          The DAST scanner did not detect any exposed endpoints or severe misconfigurations.
        </p>
      </div>
    );
  }

  const nuclei = data.rawResults.nuclei;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-gradient-to-r from-purple-900 to-fuchsia-900 rounded-2xl p-6 sm:p-8 shadow-md border border-fuchsia-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <FiActivity className="text-8xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Nuclei DAST Scanner</h2>
          <p className="text-sm text-fuchsia-200 max-w-2xl leading-relaxed">
            Nuclei performs Dynamic Application Security Testing (DAST). 
            Unlike passive checks, this engine actively sends attack payloads and targeted HTTP requests to your server 
            to uncover hidden misconfigurations, exposed <code>.env</code> files, admin panels, and unauthenticated endpoints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {nuclei.map((finding, i) => {
          const isCritical = finding.severity?.toLowerCase() === 'critical' || finding.severity?.toLowerCase() === 'high';
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {finding.severity || 'info'}
                </span>
                <h3 className="text-sm font-bold text-zinc-900">{finding.name || finding.type || 'Nuclei Finding'}</h3>
              </div>
              
              <div className="relative bg-[#0B0D13] border border-zinc-800 rounded-xl p-4 mt-3 overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-1 bg-red-600 text-white text-[8px] font-bold font-mono tracking-widest uppercase rounded-bl-lg">
                  LIVE MATCH
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FiTerminal className="text-fuchsia-400 text-sm" />
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">Vulnerable Endpoint</span>
                </div>
                <div className="text-xs font-mono text-emerald-400 break-all leading-relaxed">
                  {finding.matched || 'Unknown URL'}
                </div>
                
                {finding.description && (
                  <p className="text-[11px] text-zinc-500 mt-3 pt-3 border-t border-zinc-800/50 leading-relaxed">
                    {finding.description}
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={() => {
                    
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-ai-modal', {
                        detail: { keyword: finding.name || finding.type }
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
    </div>
  );
}
