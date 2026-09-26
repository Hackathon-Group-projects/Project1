import React from 'react';
import { HiSparkles } from "react-icons/hi2";
import { FiDatabase, FiExternalLink, FiServer } from 'react-icons/fi';

export default function CvesTab({ data, onSwitchTab }) {
  if (!data || !data.rawResults || !data.rawResults.cves || data.rawResults.cves.length === 0) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <FiDatabase className="text-4xl text-zinc-300 mb-3" />
        <h3 className="text-lg font-bold text-zinc-800">No CVEs Found</h3>
        <p className="text-sm text-zinc-500 mt-2">
          No known Common Vulnerabilities and Exposures were detected in the tech stack.
        </p>
      </div>
    );
  }

  const cvesGroups = data.rawResults.cves;
  let allVulns = [];
  cvesGroups.forEach(group => {
    if (group.vulnerabilities) {
      group.vulnerabilities.forEach(v => {
        allVulns.push({ ...v, techName: group.technology, version: group.version });
      });
    }
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-2xl p-6 sm:p-8 shadow-md border border-red-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <FiDatabase className="text-8xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">CVE Registry (NVD/OSV)</h2>
          <p className="text-sm text-orange-200 max-w-2xl leading-relaxed">
            A CVE is a publicly disclosed security flaw. 
            Secura passively fingerprints the technologies running on your server, 
            then matches them against the official vulnerability databases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allVulns.length === 0 && <div className="p-5 text-sm text-gray-500">No vulnerabilities found.</div>}
        {allVulns.map((cve, i) => {
          const s = (cve.severity || 'MEDIUM').toUpperCase();
          const isCritical = s === 'CRITICAL';
          const isHigh = s === 'HIGH';
          
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${isCritical ? 'bg-red-600' : isHigh ? 'bg-orange-500' : 'bg-amber-400'}`} />
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isCritical ? 'bg-red-100 text-red-800' : isHigh ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {s}
                  </span>
                  <a href={`https://osv.dev/vulnerability/${cve.id}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-zinc-900 hover:text-blue-600 flex items-center gap-1 font-mono transition-colors">
                    {cve.id} <FiExternalLink className="text-[11px]" />
                  </a>

                  {cve.isKev && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-800 border border-red-300 shadow-sm animate-pulse">
                      🔥 CISA KEV (Known Exploited)
                    </span>
                  )}
                  
                  {cve.epssScore && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold border border-slate-200">
                      EPSS: {(cve.epssScore * 100).toFixed(2)}%
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <FiServer className="text-slate-400 text-xs" />
                  <span className="text-xs font-mono font-bold text-slate-700">{cve.techName || 'Unknown Tech'}</span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">v{cve.version || 'unknown'}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed mb-4">{cve.summary}</p>
              
              
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommended Action: Upgrade software</span>
                <button 
                  onClick={() => {
                    
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-ai-modal', {
                        detail: { keyword: cve.id }
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
