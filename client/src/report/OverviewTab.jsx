import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function OverviewTab({ data, onSwitchTab }) {
  if (!data) return <div className="p-5 text-sm text-gray-500">No data available.</div>;

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

    // 1. Headers
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
  }



  const totalIssues = criticalCount + highCount + mediumCount + lowCount;
  const healthScore = Math.max(0, 100 - (criticalCount * 25 + highCount * 15 + mediumCount * 5 + lowCount * 2));

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Security Posture Overview</h1>
            <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
              Scan completed for <span className="font-mono font-bold text-slate-800">{data.targetUrl}</span>. 
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Health Score</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold font-mono tracking-tighter ${healthScore > 80 ? 'text-emerald-600' : healthScore > 50 ? 'text-amber-500' : 'text-red-600'}`}>
                  {healthScore}
                </span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 mt-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Threat Distribution</h2>
          <span className="text-[10px] font-mono text-slate-400">TOTAL: {totalIssues} DETECTIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-red-700 uppercase">Critical</div>
              <div className="text-2xl font-extrabold font-mono text-red-800 mt-0.5">{criticalCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-orange-700 uppercase">High</div>
              <div className="text-2xl font-extrabold font-mono text-orange-800 mt-0.5">{highCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-amber-700 uppercase">Medium</div>
              <div className="text-2xl font-extrabold font-mono text-amber-800 mt-0.5">{mediumCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Low</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-0.5">{lowCount}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* AI Remediation Call-To-Action */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-zinc-700 group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <HiSparkles className="text-8xl text-zinc-100" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">Gemini Security Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Automated Remediation Plan Ready</h2>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed mb-6">
            The AI engine has analyzed all vulnerabilities and generated step-by-step 
            patching instructions, precise configuration snippets, and code fixes.
          </p>
          <button 
            onClick={() => onSwitchTab('ai')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <HiSparkles className="text-cyan-500 text-lg" />
            <span>Go to AI Remediation Plan</span>
            <FiArrowRight className="text-zinc-400 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
