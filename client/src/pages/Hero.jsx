import { useState } from 'react';
import {
  FiGlobe,
  FiSearch,
  FiArrowRight,
  FiLock,
  FiCode,
  FiCpu,
  FiAlertCircle,
  FiCrosshair
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';

const checkItems = [
  { icon: FiLock, title: 'SSL Audit', desc: 'Expiry & ciphers' },
  { icon: FiCode, title: 'HTTP Headers', desc: 'CSP & flags' },
  { icon: FiCpu, title: 'Tech Finger', desc: 'Stack & leaks' },
  { icon: FiAlertCircle, title: 'CVEs Lookup', desc: 'Exploit records' },
  { icon: FiCrosshair, title: 'Nuclei Scan', desc: 'Template checks' },
];

export default function Hero() {
  const [url, setUrl] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const fillDemo = (domain) => {
    setUrl(domain);
    setConfirmed(true);
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!url || !confirmed) return;

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }

    try {
      new URL(target);
      // Extra validation to prevent things like 'https://www.npmjs' (missing TLD)
      if (!target.includes('.')) {
        alert("Please enter a complete domain with an extension (e.g., domain.com)");
        return;
      }

      // Check cache first as per blueprint
      try {
        const res = await fetch(`http://${window.location.hostname}:4000/api/scan/cache-check?url=${encodeURIComponent(target)}`);
        const data = await res.json();

        if (data.cached && data.scanId) {
          window.location.href = `/report/${data.scanId}`;
          return;
        }
      } catch (fetchErr) {
        console.error("Cache check omitted/failed", fetchErr);
      }

      window.location.href = `/scanning?url=${encodeURIComponent(target)}`;
    } catch (err) {
      alert("Please enter a valid URL (e.g., example.com)");
    }
  };

  return (
    <div className='mt-[50px] mx-auto min-h-screen bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pb-12 px-4'>
      {/* Hero Intro */}
      <div className="text-center max-w-xl mx-auto mb-8 pt-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/90 mb-3 shadow-xs">
          <HiSparkles className="text-slate-600 text-[13px]" />
          <span>Passive, ethical, AI-powered scanning</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Audit Your Website's Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Comprehensive reconnaissance of SSL certificates, configuration drift, server stack fingerprinting, and public CVEs.
        </p>
      </div>

      {/* Input Box Card */}
      <form onSubmit={handleAuditSubmit} className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-4">
        <div className="relative flex items-center">
          <FiGlobe className="absolute left-3.5 text-[15px] text-slate-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., domain.com)..."
            className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
          />
          <div className="absolute right-2 flex items-center">
            <span className="text-[10px] text-slate-400 border border-slate-200 bg-white px-1.5 py-0.5 rounded font-mono hidden sm:inline">
              HTTPS ↵
            </span>
          </div>
        </div>

        {/* Disclaimer Checkbox */}
        <div className="mt-3 px-1 flex items-start gap-2 text-left">
          <input
            id="ethical-check"
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="ethical-check" className="text-[11px] text-slate-500 leading-snug cursor-pointer select-none">
            I confirm this is my website or I have permission to scan it. I understand this is a passive scan.
          </label>
        </div>

        {/* Trigger Button */}
        <button
          type="submit"
          disabled={!url || !confirmed}
          className="w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <FiSearch className="text-[14px]" />
          <span>Start Security Audit</span>
          <FiArrowRight className="text-[14px]" />
        </button>
      </form>

      {/* Demo Links */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mb-10">
        <span>OR try demo:</span>
        <button
          type="button"
          onClick={() => fillDemo('testphp.vulnweb.com')}
          className="text-slate-700 hover:text-black font-mono underline decoration-slate-300 underline-offset-4 transition-colors"
        >
          testphp.vulnweb.com
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => fillDemo('demo.testfire.net')}
          className="text-slate-700 hover:text-black font-mono underline decoration-slate-300 underline-offset-4 transition-colors"
        >
          demo.testfire.net
        </button>
      </div>

      {/* Stats Section */}
      <section className="max-w-2xl mx-auto py-4 px-6 border-y border-slate-200/90 grid grid-cols-3 gap-4 text-center mb-10 bg-white/70 rounded-xl backdrop-blur-xs">
        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">1,240+</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sites Scanned</div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">5 Modules</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Check Types</div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">Secura-AI</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Engine Ready</div>
        </div>
      </section>

      {/* What We Check (Cards Grid) */}
      <section className="mb-10 w-10/12 mx-auto">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2">
          <span className="text-xs font-semibold text-slate-800">What We Check</span>
          <span className="text-[11px] font-mono text-slate-500">5 Cards Suite</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {checkItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg bg-white/90 backdrop-blur-xs border border-slate-300 hover:border-slate-900 transition-all shadow-2xs ${idx === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 mb-2">
                  <Icon className="text-[14px]" />
                </div>
                <div className="text-xs font-semibold text-slate-900">{item.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow & Sample Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-10 w-10/12 mx-auto">
        <div className="p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-slate-200 flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">How It Works</span>
            <h3 className="text-xs font-semibold text-slate-900 mt-1 mb-3">3-Step Non-Invasive Flow</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">1</span>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Enter URL</div>
                  <div className="text-[11px] text-slate-500">Provide domain or host without credentials or agents.</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">2</span>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Passive Scan</div>
                  <div className="text-[11px] text-slate-500">Inspect DNS, SSL handshake, headers & metadata.</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">3</span>
                <div>
                  <div className="text-xs font-semibold text-slate-800">AI Report</div>
                  <div className="text-[11px] text-slate-500">Ranked vulnerabilities and prioritized patch suggestions.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-200 bg-white/90 backdrop-blur-xs p-4 flex flex-col justify-between overflow-hidden shadow-2xs">
          <div className="absolute inset-0 p-4 opacity-10 filter blur-[3px] pointer-events-none font-mono text-[10px] space-y-1 text-slate-800 select-none">
            <div>TARGET: demo.testfire.net</div>
            <div>[PASS] TLS 1.3 handshake successful</div>
            <div>[WARN] X-Content-Type-Options header missing</div>
            <div>[VULN] CVE-2023-XXXX Detected in web layer</div>
            <div>GRADE: B+ (3 recommended actions)</div>
          </div>

          <div className="relative z-10 my-auto py-3 text-center">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">WATERMARKED ARTIFACT</span>
            <h4 className="text-xs font-semibold text-slate-900 mt-2 mb-1">Sample Report Preview</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto mb-3">
              Inspect an actual passive audit report schema.
            </p>
            <button className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors">
              <span>View Sample Report</span>
              <FiArrowRight className="text-[14px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
