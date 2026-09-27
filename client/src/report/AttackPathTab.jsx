import React, { useState } from 'react';
import { FiShield, FiAlertTriangle, FiLock, FiCpu, FiArrowRight, FiActivity } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function AttackPathTab({ data }) {
  const [selectedNode, setSelectedNode] = useState('chain-1');
  const targetHost = data?.targetHostname || data?.targetUrl || 'example.com';

  const attackNodes = [
    {
      id: 'chain-1',
      step: '01 / Initial Entry',
      title: 'Missing Cookie Secure/HttpOnly Flag',
      severity: 'MEDIUM',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Session cookies are exposed to client-side scripts over unencrypted channels.',
      exploitedBy: 'Passive Sniffing / XSS payload injection',
      impact: 'Allows token interception',
    },
    {
      id: 'chain-2',
      step: '02 / Escalation',
      title: 'Session Hijacking & Token Replay',
      severity: 'HIGH',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
      desc: 'Attacker captures valid session identifiers and replays requests impersonating the victim user.',
      exploitedBy: 'Automated Proxy / Cookie Stealer script',
      impact: 'Bypasses standard MFA/Login gate',
    },
    {
      id: 'chain-3',
      step: '03 / Full Compromise',
      title: 'Administrative Privilege Takeover',
      severity: 'CRITICAL',
      badgeBg: 'bg-red-100 text-red-800 border-red-200',
      desc: 'Attacker gains privileged dashboard access, executing arbitrary database queries and deploying web shells.',
      exploitedBy: 'RCE / Stored Payload Execution',
      impact: 'Total infrastructure compromise',
    },
  ];

  return (
    <div className="space-y-5 font-sans">
      
      {/* Threat Intelligence Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-slate-100/60 to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
              <FiActivity className="text-cyan-400 text-[18px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-950">Autonomous Attack Path Visualizer</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                  SIMULATION ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Mapping vulnerability chaining vectors reconstructed by Secura Neural AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400">Total Chaining Vectors:</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg">
              1 Critical Path
            </span>
          </div>
        </div>
      </div>

      {/* Visual Node Graph Map Container */}
      <div className="bg-[#0B0D13] border border-zinc-800 rounded-2xl p-6 shadow-xl text-slate-200 relative overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(140,149,166,0.15)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800 text-xs font-mono text-zinc-400 relative z-10">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Threat Simulation: {targetHost} ➔ Privilege Escalation</span>
          </span>
          <span className="text-[10px] text-zinc-500">Vector ID: #vec-9481-chain</span>
        </div>

        {/* Nodes Flow Layout (Horizontal Chain on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 my-4">
          
          {attackNodes.map((node, index) => (
            <div 
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedNode === node.id 
                  ? 'bg-zinc-900/90 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50' 
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{node.step}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${node.badgeBg}`}>
                    {node.severity}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-2 leading-snug">{node.title}</h4>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-4">{node.desc}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 text-[10.5px] font-mono space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Vector:</span>
                  <span className="text-zinc-200">{node.exploitedBy}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Impact:</span>
                  <span className="text-red-400 font-semibold">{node.impact}</span>
                </div>
              </div>

              {/* Connector Arrow for desktop */}
              {index < attackNodes.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-cyan-400 items-center justify-center shadow-lg">
                  <FiArrowRight className="text-sm" />
                </div>
              )}
            </div>
          ))}

        </div>

        {/* Bottom Intelligence Summary Box */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="text-zinc-400 flex items-center gap-2">
            <HiSparkles className="text-cyan-400 text-sm" />
            <span>AI Recommendation: Mitigate Node 01 (Secure Cookies) to break the entire kill-chain.</span>
          </div>
          <button 
            onClick={() => alert('Exporting complete Attack Path vector report...')} 
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Export Graph PDF
          </button>
        </div>

      </div>

    </div>
  );
}
