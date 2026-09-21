import React from 'react';
import { Link } from 'react-router-dom';
import { GiCyberEye } from "react-icons/gi";
export default function LandingPage() {
  return (
    <div className="w-full min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#fbfbfc] text-[#09090b] antialiased overflow-x-hidden relative flex flex-col justify-between selection:bg-[#18181b] selection:text-white">
      
      {/* ================= BACKGROUND ANIMATED CONSTELLATION & VORTEX ================= */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Ambient Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.75)_0%,rgba(251,251,252,0.4)_55%,rgba(244,244,245,0.75)_100%)] z-0" />

        {/* Glow Orbs */}
        <div className="absolute rounded-full filter blur-[80px] pointer-events-none opacity-55 z-0 w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(228,228,231,0.55)_0%,rgba(244,244,245,0)_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[breatheGlow_12s_ease-in-out_infinite_alternate]" />
        <div className="absolute rounded-full filter blur-[80px] pointer-events-none opacity-55 z-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(212,212,216,0.4)_0%,rgba(244,244,245,0)_70%)] top-[10%] right-[15%] animate-[floatOrb_18s_ease-in-out_infinite_alternate]" />

        {/* Constellation SVG Network */}
        <svg className="absolute inset-0 w-full h-full z-1 opacit-95" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#111827" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#111827" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Network Connection Lines */}
          <g className="stroke-[#18181b] stroke-[1.15] [stroke-dasharray:4_3] opacity-22">
            <line x1="90" y1="180" x2="220" y2="240" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="220" y1="240" x2="340" y2="160" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="220" y1="240" x2="180" y2="380" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="180" y1="380" x2="320" y2="350" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="320" y1="350" x2="340" y2="160" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
            <line x1="320" y1="350" x2="480" y2="290" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="480" y1="290" x2="620" y2="210" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="180" y1="380" x2="240" y2="540" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="240" y1="540" x2="390" y2="490" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
            <line x1="320" y1="350" x2="390" y2="490" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="390" y1="490" x2="460" y2="640" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="240" y1="540" x2="160" y2="690" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="160" y1="690" x2="310" y2="760" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="310" y1="760" x2="460" y2="640" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
            <line x1="460" y1="640" x2="610" y2="780" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="310" y1="760" x2="230" y2="910" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="230" y1="910" x2="420" y2="880" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="420" y1="880" x2="610" y2="780" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="610" y1="780" x2="780" y2="860" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="480" y1="290" x2="590" y2="140" className="opacity-12 [stroke-dasharray:2_4]" />
            <line x1="590" y1="140" x2="750" y2="90" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="750" y1="90" x2="910" y2="120" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="910" y1="120" x2="1080" y2="170" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="1080" y1="170" x2="1220" y2="130" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
            <line x1="1080" y1="170" x2="1190" y2="290" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="1220" y1="130" x2="1390" y2="190" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="1190" y1="290" x2="1390" y2="190" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="1390" y1="190" x2="1520" y2="280" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="1190" y1="290" x2="1140" y2="470" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="1190" y1="290" x2="1340" y2="410" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
            <line x1="1340" y1="410" x2="1520" y2="280" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="1340" y1="410" x2="1490" y2="520" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="1140" y1="470" x2="1310" y2="600" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="1310" y1="600" x2="1490" y2="520" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
            <line x1="1140" y1="470" x2="1010" y2="650" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="1010" y1="650" x2="1180" y2="760" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="1310" y1="600" x2="1180" y2="760" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="1310" y1="600" x2="1440" y2="750" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="1180" y1="760" x2="1360" y2="890" className="animate-[lineFlow_10s_linear_infinite]" />
            <line x1="1440" y1="750" x2="1360" y2="890" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
            <line x1="780" y1="860" x2="1010" y2="650" className="animate-[lineFlow_8s_linear_infinite_reverse]" />
            <line x1="1010" y1="650" x2="940" y2="840" className="animate-[lineFlow_6s_linear_infinite]" />
            <line x1="940" y1="840" x2="1180" y2="760" className="animate-[lineFlow_7s_linear_infinite_reverse]" />
          </g>

          {/* Radar Waves */}
          <circle cx="320" cy="350" r="18" className="fill-none stroke-[#18181b] origin-center animate-[pingWave_4.5s_cubic-bezier(0,0.2,0.8,1)_infinite]" />
          <circle cx="1190" cy="290" r="22" className="fill-none stroke-[#18181b] origin-center animate-[pingWave_5.5s_cubic-bezier(0,0.2,0.8,1)_infinite_1.5s]" />
          <circle cx="1010" cy="650" r="16" className="fill-none stroke-[#18181b] origin-center animate-[pingWave_4.8s_cubic-bezier(0,0.2,0.8,1)_infinite_2.8s]" />
          <circle cx="460" cy="640" r="20" className="fill-none stroke-[#18181b] origin-center animate-[pingWave_5.2s_cubic-bezier(0,0.2,0.8,1)_infinite_0.7s]" />

          {/* Network Nodes */}
          <g className="fill-[#18181b]">
            <circle cx="90" cy="180" r="3.5" className="opacity-45" />
            <circle cx="220" cy="240" r="4.5" className="opacity-75 animate-[nodePulse_3.5s_ease-in-out_infinite_alternate]" />
            <circle cx="340" cy="160" r="4" className="opacity-45" />
            <circle cx="180" cy="380" r="4" className="opacity-45" />
            <circle cx="320" cy="350" r="6" className="opacity-95 animate-[nodePulse_3.5s_ease-in-out_infinite_alternate]" />
            <circle cx="480" cy="290" r="4.5" className="opacity-75" />
            <circle cx="620" cy="210" r="3.5" className="opacity-45" />
            <circle cx="240" cy="540" r="4" className="opacity-45" />
            <circle cx="390" cy="490" r="5" className="opacity-75" />
            <circle cx="460" cy="640" r="6" className="opacity-95 animate-[nodePulse_3.5s_ease-in-out_infinite_alternate]" />
            <circle cx="160" cy="690" r="3.5" className="opacity-45" />
            <circle cx="310" cy="760" r="5" className="opacity-75" />
            <circle cx="610" cy="780" r="4.5" className="opacity-75" />
            <circle cx="230" cy="910" r="3.5" className="opacity-45" />
            <circle cx="420" cy="880" r="4.5" className="opacity-75" />
            <circle cx="780" cy="860" r="5" className="opacity-75 animate-[nodePulse_3.5s_ease-in-out_infinite_alternate]" />
            <circle cx="590" cy="140" r="3.5" className="opacity-45" />
            <circle cx="750" cy="90" r="4" className="opacity-45" />
            <circle cx="910" cy="120" r="4" className="opacity-45" />
            <circle cx="1080" cy="170" r="4.5" className="opacity-75" />
            <circle cx="1220" cy="130" r="3.5" className="opacity-45" />
            <circle cx="1190" cy="290" r="6.5" className="opacity-95 animate-[nodePulse_3.5s_ease-in-out_infinite_alternate]" />
            <circle cx="1390" cy="190" r="4" className="opacity-45" />
            <circle cx="1520" cy="280" r="3.5" className="opacity-45" />
            <circle cx="1140" cy="470" r="4.5" className="opacity-75" />
            <circle cx="1340" cy="410" r="5" className="opacity-75" />
            <circle cx="1490" cy="520" r="4" className="opacity-45" />
            <circle cx="1310" cy="600" r="5.5" className="opacity-75 animate-[nodePulse_3.5s_ease-in-out_infinite_alternate]" />
            <circle cx="1010" cy="650" r="6" className="opacity-95 animate-[nodePulse_3.5s_ease-in-out_infinite_alternate]" />
            <circle cx="1180" cy="760" r="4.5" className="opacity-75" />
            <circle cx="1440" cy="750" r="4" className="opacity-45" />
            <circle cx="940" cy="840" r="4" className="opacity-45" />
            <circle cx="1360" cy="890" r="3.5" className="opacity-45" />
          </g>
        </svg>

        {/* Floating Cyber Dust Field */}
        <div className="absolute inset-0 z-2 pointer-events-none">
          <span className="absolute rounded-full bg-[#18181b] w-[3px] h-[3px] top-[18%] left-[12%] opacity-25 animate-[particleDriftA_14s_ease-in-out_infinite]" />
          <span className="absolute rounded-full bg-[#18181b] w-[4px] h-[4px] top-[28%] left-[24%] opacity-35 animate-[particleDriftB_17s_ease-in-out_infinite]" />
          <span className="absolute rounded-full bg-[#18181b] w-[2.5px] h-[2.5px] top-[45%] left-[8%] opacity-20 animate-[particleDriftC_19s_ease-in-out_infinite]" />
          <span className="absolute rounded-full bg-[#18181b] w-[5px] h-[5px] top-[65%] left-[18%] opacity-30 animate-[particleDriftA_16s_ease-in-out_infinite_2s]" />
          <span className="absolute rounded-full bg-[#18181b] w-[3.5px] h-[3.5px] top-[82%] left-[28%] opacity-25 animate-[particleDriftB_15s_ease-in-out_infinite_1s]" />
          <span className="absolute rounded-full bg-[#18181b] w-[2px] h-[2px] top-[12%] left-[38%] opacity-18 animate-[particleDriftC_22s_ease-in-out_infinite]" />
          <span className="absolute rounded-full bg-[#18181b] w-[3px] h-[3px] top-[78%] left-[45%] opacity-22 animate-[particleDriftA_18s_ease-in-out_infinite_3s]" />
          <span className="absolute rounded-full bg-[#18181b] w-[4px] h-[4px] top-[88%] left-[62%] opacity-30 animate-[particleDriftB_13s_ease-in-out_infinite]" />
        </div>

        {/* Orbital Vortex Rings */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] pointer-events-none z-1 opacity-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dotted border-[rgba(24,24,27,0.12)] border-[1.5px] w-[650px] h-[650px] animate-[spinSlow_90s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(24,24,27,0.12)] border-[1px] w-[950px] h-[750px] animate-[spinCounter_130s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[rgba(24,24,27,0.12)] border-[1px] w-[1250px] h-[900px] opacity-20 animate-[spinSlow_160s_linear_infinite]" />
        </div>
      </div>

      {/* ================= MAIN INTERFACE ================= */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Top Header */}
        <header className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-85">
            <div className="w-[38px] h-[38px] flex items-center justify-center">
              <GiCyberEye className='text-[80px]'/>
            </div>
            <span className="text-[1.45rem] font-bold tracking-tight text-[#09090b]">Secura</span>
          </Link>

          {/* Action Button: Sign In / Up (Links to auth page route if applicable) */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#09090b] text-white text-[0.92rem] font-semibold tracking-tight shadow-[0_4px_14px_rgba(9,9,11,0.15)] hover:bg-[#18181b] hover:-translate-y-px transition-all duration-200">
              <span>Sign In / Up</span>
              <svg className="w-[14px] h-[14px] transition-transform duration-150 hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3.5H3.5C2.67157 3.5 2 4.17157 2 5V11C2 11.8284 2.67157 12.5 3.5 12.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10.5 5.5L13 8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 py-10 max-w-[1200px] mx-auto w-full text-center">
          <div className="flex flex-col items-center max-w-[880px] animate-[heroEntrance_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards]">

            {/* Badge Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[rgba(24,24,27,0.08)] shadow-sm mb-7 text-[0.84rem] font-medium text-[#09090b] backdrop-blur-md hover:border-[rgba(24,24,27,0.16)] hover:shadow-md transition-all">
              <div className="w-4 h-4 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8.5" stroke="#18181b" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="3.5" fill="#18181b"/>
                  <path d="M10 1.5V4M10 16V18.5M1.5 10H4M16 10H18.5" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-semibold tracking-tight">Secura AI Web Security</span>
              <span className="text-[#71717a] text-[0.75rem]">•</span>
              <span className="text-[#71717a] text-[0.75rem] font-bold tracking-wider bg-[#f4f4f5] px-1.5 py-0.5 rounded">PASSING ONLY</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.35rem,4.8vw+0.5rem,4.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#09090b] mb-6 balance">
              Experience autonomous defense with the <span className="whitespace-nowrap">next-gen</span> security platform
            </h1>

            {/* Description */}
            <p className="text-[clamp(1.05rem,1.2vw+0.4rem,1.22rem)] font-normal leading-[1.62] text-[#52525b] max-w-[680px] mb-9 pretty">
              Secura continuously scans, models, and mitigates web vulnerabilities in real time before exploitation. Enterprise surface diagnostics and deep proactive resilience powered by autonomous AI agents.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
              <Link to="/dash" className="inline-flex items-center justify-center gap-2.5 px-9 py-3.5 bg-[#09090b] text-white text-[1.05rem] font-semibold tracking-[-0.015em] rounded-full shadow-[0_8px_24px_-4px_rgba(9,9,11,0.25)] hover:bg-[#18181b] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-4px_rgba(9,9,11,0.32)] transition-all">
                <span>Explore More</span>
                <span className="flex items-center justify-center w-[18px] h-[18px] transition-transform duration-150 group-hover:translate-x-1">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>

             
            </div>

            {/* Diagnostic Strip */}
            <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-[rgba(255,255,255,0.7)] border border-[rgba(24,24,27,0.08)] rounded-full text-[0.82rem] text-[#71717a] shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-md max-w-full flex-wrap justify-center sm:flex-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_0_2.5px_rgba(16,185,129,0.2)] animate-[pulseGreen_2s_infinite_ease-in-out]" />
                <span className="text-[#71717a]">Diagnostic Status:</span>
                <span className="text-[#09090b] font-semibold">Active & Armed</span>
              </div>
              <span className="text-[rgba(24,24,27,0.16)] hidden sm:inline">/</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#71717a]">Zero-Day Interception:</span>
                <span className="text-[#09090b] font-semibold">99.98%</span>
              </div>
              <span className="text-[rgba(24,24,27,0.16)] hidden sm:inline">/</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#71717a]">Autonomous Protocol:</span>
                <span className="text-[#09090b] font-semibold">Secura Neural v4</span>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between text-[0.82rem] text-[#71717a] border-t border-[rgba(24,24,27,0.05)] gap-3 text-center sm:text-left">
          <div>
            <span>&copy; 2026 Secura AI Systems Inc. All rights reserved.</span>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-[#52525b] font-medium">
              <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px] text-[#09090b]">
                <rect x="2" y="5.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4.5 5.5V3.8C4.5 2.4 5.6 1.3 7 1.3C8.4 1.3 9.5 2.4 9.5 3.8V5.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Encrypted Surface Environment
            </span>
          </div>
        </footer>

      </div>

    </div>
  );
}
