const fs = require('fs');

const cveCode = `import React from 'react';
import { FiDatabase, FiExternalLink, FiServer } from 'react-icons/fi';

export default function CvesTab({ data }) {
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

  const cves = data.rawResults.cves;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-2xl p-6 sm:p-8 shadow-md border border-red-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <FiDatabase className="text-8xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">CVE Registry (NVD)</h2>
          <p className="text-sm text-orange-200 max-w-2xl leading-relaxed">
            A CVE (Common Vulnerabilities and Exposures) is a publicly disclosed security flaw. 
            Secura passively fingerprints the technologies (and exact versions) running on your server, 
            then matches them against the official US National Vulnerability Database (NVD) to find unpatched software.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cves.map((cve, i) => {
          const isCritical = cve.cvssScore >= 9.0;
          const isHigh = cve.cvssScore >= 7.0 && cve.cvssScore < 9.0;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col relative overflow-hidden">
              <div className={\`absolute top-0 left-0 w-1.5 h-full \${isCritical ? 'bg-red-600' : isHigh ? 'bg-orange-500' : 'bg-amber-400'}\`} />
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider \${
                    isCritical ? 'bg-red-100 text-red-800' : isHigh ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                  }\`}>
                    CVSS {cve.cvssScore || 'N/A'}
                  </span>
                  <a href={cve.link || \`https://nvd.nist.gov/vuln/detail/\${cve.id}\`} target="_blank" rel="noreferrer" className="text-sm font-bold text-zinc-900 hover:text-blue-600 flex items-center gap-1 font-mono transition-colors">
                    {cve.id} <FiExternalLink className="text-[11px]" />
                  </a>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <FiServer className="text-slate-400 text-xs" />
                  <span className="text-xs font-mono font-bold text-slate-700">{cve.techName || 'Unknown Tech'}</span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">v{cve.version || 'unknown'}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed mb-4">{cve.description}</p>
              
              <div className="mt-auto bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Recommended Action</span>
                <span className="text-xs font-mono text-zinc-800 font-medium">Upgrade {cve.techName || 'software'} to the latest stable release to patch this vulnerability.</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`;

const nucleiCode = `import React from 'react';
import { FiActivity, FiTerminal } from 'react-icons/fi';

export default function NucleiTab({ data }) {
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
          const isCritical = finding.severity === 'critical' || finding.severity === 'high';
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <span className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider \${
                  isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }\`}>
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
                  {finding.matched_at || 'Unknown URL'}
                </div>
                {finding.description && (
                  <p className="text-[11px] text-zinc-500 mt-3 pt-3 border-t border-zinc-800/50 leading-relaxed">
                    {finding.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('client/src/report/CvesTab.jsx', cveCode);
fs.writeFileSync('client/src/report/NucleiTab.jsx', nucleiCode);
