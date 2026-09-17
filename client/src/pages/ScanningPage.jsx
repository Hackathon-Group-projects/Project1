import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiGlobe, 
  FiCheck, 
  FiLoader, 
  FiAlertTriangle 
} from 'react-icons/fi';

export default function ScanningPage({ 
  targetUrl = "https://kuchdaalobhai", 
  scanId = "20253118-Mnnit", 
  progress = 68 
}) {
  return (
    <div className="bg-tech-matrix text-zinc-800 font-sans text-[13px] antialiased min-h-screen flex flex-col selection:bg-[#8C95A6] selection:text-white relative">
      
      {/* Subtle Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-b from-[#8C95A6]/15 via-slate-300/10 to-transparent blur-3xl pointer-events-none -z-10" />


    

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col justify-center">

        {/* Target Domain Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#5B6475] shrink-0">
              <FiGlobe className="text-[18px]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Target Domain
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-zinc-900 flex items-center gap-2">
                {targetUrl}
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-normal">
                  PORT 443
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 self-end sm:self-center">
            <span>Scan ID:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-zinc-700">
              #{scanId}
            </span>
          </div>
        </div>

        {/* Animated Progress Section */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FiLoader className="text-[15px] text-[#8C95A6] animate-spin" />
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                Analysis In Progress
              </span>
            </div>
            <div className="font-mono text-sm font-extrabold text-zinc-900">
              {progress}%
            </div>
          </div>

          {/* Animated Progress Track */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
            <div 
              className="h-full rounded-full animate-shimmer transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-2">
            <span>Phase 3 of 6</span>
            <span>Estimated: ~6s remaining</span>
          </div>
        </div>

        {/* Scan Steps Pipeline */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs mb-6">
          <div className="text-xs font-bold text-zinc-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Execution Pipeline</span>
            <span className="text-[10px] font-mono text-zinc-400">NON-INVASIVE MODE</span>
          </div>

          <div className="space-y-3 font-sans">
            {/* Step 1: SSL Check */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCheck className="text-[14px] stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-zinc-800">SSL/TLS Certificate Check</span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                [Done]
              </span>
            </div>

            {/* Step 2: HTTP Headers */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCheck className="text-[14px] stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-zinc-800">HTTP Security Headers Scan</span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                [Done]
              </span>
            </div>

            {/* Step 3: Tech Fingerprinting (Active) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8C95A6]/20 text-[#5B6475] flex items-center justify-center shrink-0">
                  <FiLoader className="text-[14px] animate-spin" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-950">Tech Stack Fingerprinting...</span>
                  <div className="text-[10px] text-[#5B6475] font-mono">Analyzing HTTP responses & generator meta</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-[#8C95A6] text-white shadow-2xs">
                [Running]
              </span>
            </div>

            {/* Step 4: CVE Lookup */}
            <div className="flex items-center justify-between p-2 rounded-xl opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  ⏸
                </div>
                <span className="text-xs font-medium text-zinc-600">CVE / Known Vulnerability Lookup</span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                [Waiting]
              </span>
            </div>

            {/* Step 5: Nuclei Scan */}
            <div className="flex items-center justify-between p-2 rounded-xl opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  ⏸
                </div>
                <span className="text-xs font-medium text-zinc-600">Nuclei Lightweight Scan</span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                [Waiting]
              </span>
            </div>

            {/* Step 6: AI Analysis */}
            <div className="flex items-center justify-between p-2 rounded-xl opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  ⏸
                </div>
                <span className="text-xs font-medium text-zinc-600">AI-Powered Analysis</span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                [Waiting]
              </span>
            </div>
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="bg-[#0B0D13] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200 font-mono text-[11.5px] leading-relaxed mb-6">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-semibold text-zinc-300">Live Engine Telemetry</span>
            </div>
            <span className="text-[10px] text-zinc-500">buffer: 1024b</span>
          </div>

          <div className="space-y-1.5 overflow-x-auto">
            <div className="text-zinc-500">&gt; Initializing passive handshake with {targetUrl}:443...</div>
            <div><span className="text-emerald-400">&gt; [OK]</span> TLS 1.3 Certificate valid until 2025-12-01 <span className="text-emerald-400">✓</span></div>
            <div><span className="text-cyan-400">&gt; [INFO]</span> Response headers collected (14 total headers evaluated)</div>
            <div><span className="text-amber-400">&gt; [WARN]</span> Missing: Content-Security-Policy (CSP) flag ⚠️</div>
            <div><span className="text-[#8C95A6]">&gt; [PROBE]</span> Detecting web software... WordPress 6.2 identified</div>
            <div className="text-zinc-400 flex items-center gap-1">
              <span>&gt; Querying OSV.dev registry for WordPress 6.2 vulnerabilities</span>
              <span className="w-2 h-3.5 bg-[#8C95A6] inline-block terminal-cursor" />
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="flex items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/80 py-2.5 px-4 rounded-xl text-center">
          <FiAlertTriangle className="text-[14px] text-amber-600 shrink-0" />
          <span className="font-medium">Please don't close this tab while real-time diagnostics are executing.</span>
        </div>

      </main>
    </div>
  );
}