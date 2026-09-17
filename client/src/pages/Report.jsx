import React from 'react';
import { NavLink, Routes, Route, Link, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiShare2, 
  FiShield, 
  FiLock, 
  FiFileText, 
  FiCpu, 
  FiAlertCircle, 
  FiCrosshair,
  FiRotateCw
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

import OverviewTab from '../report/OverviewTab';
import HeadersTab from '../report/HeadersTab';
import SslTab from '../report/SslTab';
import CvesTab from '../report/CvesTab';
import NucleiTab from '../report/NucleiTab';
import AiFixTab from '../report/AiFixTab'; // Fixed import

export default function Report() {
  const { id = 'sec-9481b' } = useParams();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Report link copied to clipboard!');
  };

  return (
    <div className="bg-tech-matrix text-zinc-800 font-sans text-[13px] antialiased min-h-screen flex flex-col selection:bg-[#8C95A6] selection:text-white">
      
      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">

        {/* LEFT PANEL (30%) */}
        <aside className="w-full lg:w-[30%] flex flex-col gap-5 shrink-0">
          
          {/* Donut Gauge */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 self-start">
              <FiShield className="text-[14px] text-[#8C95A6]" />
              <span>Security Score</span>
            </div>

            <div className="relative w-40 h-40 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 stroke-current"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500 stroke-current"
                  strokeDasharray="42, 100"
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold font-mono text-zinc-950 leading-none">42</span>
                <span className="text-xs font-mono text-zinc-400 mt-1 font-semibold">/ 100</span>
              </div>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>RISK LEVEL: HIGH</span>
            </div>

            <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Target:</span>
                <span className="font-semibold text-zinc-800">example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Scan Date:</span>
                <span className="text-zinc-700">11 Sep 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Duration:</span>
                <span className="text-zinc-700">18 seconds</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold mb-3.5">
              — Quick Stats —
            </div>
            <div className="space-y-2.5 font-sans">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiLock className="text-[#5B6475]" />
                  <span>SSL / TLS Audit</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 text-emerald-800">A+ Valid</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiFileText className="text-[#5B6475]" />
                  <span>HTTP Headers</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-100 text-amber-800">3 Missing</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiCpu className="text-[#5B6475]" />
                  <span>Tech Stack</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-100 text-amber-800">WordPress 6.2</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiAlertCircle className="text-red-500" />
                  <span>CVE Registry</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-100 text-red-800">7 Found</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiCrosshair className="text-red-500" />
                  <span>Nuclei Engine</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-100 text-red-800">2 Issues</span>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
              <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-zinc-700 hover:bg-slate-50 transition-colors">
                <FiRotateCw className="text-[13px]" />
                <span>Re-scan Target</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-zinc-700 hover:bg-slate-50 transition-colors">
                <FiFileText className="text-[13px]" />
                <span>Export PDF</span>
              </button>
            </div>
            
          </div>
        </aside>

        {/* MAIN PANEL (70%) */}
        <section className="w-full lg:w-[70%] flex flex-col gap-5">
          
          {/* Internal Tabs Link Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
            <NavLink
              to=""
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
                }`
              }
            >
              Overview
            </NavLink>

            <NavLink
              to="/headers"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
                }`
              }
            >
              Headers (3)
            </NavLink>

            <NavLink
              to="/ssl"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
                }`
              }
            >
              SSL / TLS
            </NavLink>

            <NavLink
              to="/cves"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
                }`
              }
            >
              CVEs (7)
            </NavLink>

            <NavLink
              to="/nuclei"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
                }`
              }
            >
              Nuclei (2)
            </NavLink>

            <NavLink
              to="/ai"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
                }`
              }
            >
              <HiSparkles className="text-[14px]" />
              <span>AI Remediation</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-cyan-100 text-cyan-800 font-mono font-bold">RAG</span>
            </NavLink>
          </div>

          {/* Internal Routes */}
          <Routes>
            <Route index element={<OverviewTab />} />
            <Route path="/headers" element={<HeadersTab />} />
            <Route path="/ssl" element={<SslTab />} />
            <Route path="/cves" element={<CvesTab />} />
            <Route path="/nuclei" element={<NucleiTab />} />
            <Route path="/ai" element={<AiFixTab />} />
          </Routes>

        </section>

      </main>
    </div>
  );
}