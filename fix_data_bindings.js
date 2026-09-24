const fs = require('fs');

// --- 1. OVERVIEW TAB ---
let overview = fs.readFileSync('client/src/report/OverviewTab.jsx', 'utf8');
const newAgg = `  // 1. Headers
  if (data.rawResults?.headers?.missing) {
    data.rawResults.headers.missing.forEach(h => {
      const s = (h.severity || 'MEDIUM').toUpperCase();
      if (s === 'CRITICAL') criticalCount++;
      else if (s === 'HIGH') highCount++;
      else if (s === 'MEDIUM') mediumCount++;
      else lowCount++;
    });
  }

  // 2. CVEs (Backend returns [{technology, version, vulnerabilities: [{id, severity, summary}]}])
  if (data.rawResults?.cves?.length > 0) {
    data.rawResults.cves.forEach(techGroup => {
      if (techGroup.vulnerabilities) {
        techGroup.vulnerabilities.forEach(vuln => {
          const s = (vuln.severity || 'MEDIUM').toUpperCase();
          if (s === 'CRITICAL') criticalCount++;
          else if (s === 'HIGH') highCount++;
          else if (s === 'MEDIUM') mediumCount++;
          else lowCount++;
        });
      }
    });
  }

  // 3. Nuclei
  if (data.rawResults?.nuclei?.length > 0) {
    data.rawResults.nuclei.forEach(finding => {
      const s = (finding.severity || 'LOW').toUpperCase();
      if (s === 'CRITICAL') criticalCount++;
      else if (s === 'HIGH') highCount++;
      else if (s === 'MEDIUM') mediumCount++;
      else lowCount++;
    });
  }

  // 4. SSL (Expired = Critical)
  if (data.rawResults?.ssl) {
    const daysLeft = data.rawResults.ssl.daysRemaining;
    if (daysLeft <= 0 || !data.rawResults.ssl.valid) {
      criticalCount++;
    }
  }`;
// Replace the old aggregation block from '// 1. Headers' up to '}' before 'const totalIssues'
overview = overview.replace(/\/\/ 1\. Headers[\s\S]*?(?=\s*const totalIssues =)/, newAgg + '\n\n');
fs.writeFileSync('client/src/report/OverviewTab.jsx', overview);

// --- 2. CVES TAB ---
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
              <div className={\`absolute top-0 left-0 w-1.5 h-full \${isCritical ? 'bg-red-600' : isHigh ? 'bg-orange-500' : 'bg-amber-400'}\`} />
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider \${
                    isCritical ? 'bg-red-100 text-red-800' : isHigh ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                  }\`}>
                    {s}
                  </span>
                  <a href={\`https://osv.dev/vulnerability/\${cve.id}\`} target="_blank" rel="noreferrer" className="text-sm font-bold text-zinc-900 hover:text-blue-600 flex items-center gap-1 font-mono transition-colors">
                    {cve.id} <FiExternalLink className="text-[11px]" />
                  </a>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <FiServer className="text-slate-400 text-xs" />
                  <span className="text-xs font-mono font-bold text-slate-700">{cve.techName || 'Unknown Tech'}</span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">v{cve.version || 'unknown'}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed mb-4">{cve.summary}</p>
              
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
fs.writeFileSync('client/src/report/CvesTab.jsx', cveCode);

// --- 3. NUCLEI TAB ---
let nuclei = fs.readFileSync('client/src/report/NucleiTab.jsx', 'utf8');
nuclei = nuclei.replace(/finding\.severity === 'critical'/g, "finding.severity?.toLowerCase() === 'critical'");
nuclei = nuclei.replace(/finding\.severity === 'high'/g, "finding.severity?.toLowerCase() === 'high'");
nuclei = nuclei.replace(/finding\.matched_at/g, "finding.matched");
fs.writeFileSync('client/src/report/NucleiTab.jsx', nuclei);

// --- 4. SSL TAB ---
const sslCode = `import React from 'react';
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
`;
fs.writeFileSync('client/src/report/SslTab.jsx', sslCode);

// --- 5. AI FIX TAB (Remove hardcoded meta) ---
let aifix = fs.readFileSync('client/src/report/AiFixTab.jsx', 'utf8');
aifix = aifix.replace(
  /<div className="flex items-center gap-1.5"><FiClock className="text-slate-400" \/> Est\. Fix Time: ~15 Mins<\/div>/,
  ""
);
aifix = aifix.replace(
  /<div className="flex items-center gap-1.5 text-emerald-600"><FiPercent \/> AI Confidence: 98% High<\/div>/,
  ""
);
fs.writeFileSync('client/src/report/AiFixTab.jsx', aifix);

console.log("All bindings fixed to use actual backend data shapes.");
