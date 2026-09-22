import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiGlobe, 
  FiCheck, 
  FiLoader, 
  FiAlertTriangle 
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

export default function ScanningPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUrl = searchParams.get('url');
  const { userEmail, token } = useContext(AuthContext);
  
  const [scanId, setScanId] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState(targetUrl ? [`> Initializing passive handshake with ${targetUrl}:443...`] : []);
  const [currentStep, setCurrentStep] = useState('Initializing');

  useEffect(() => {
    let eventSource;

    if (!userEmail) {
      setCurrentStep('NotFound');
      return;
    }

    if (!targetUrl) {
      if (userEmail) {
        const fetchHistory = async () => {
          try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`http://${window.location.hostname}:5000/api/scan/history?userEmail=${encodeURIComponent(userEmail)}`, { headers });
            const data = await res.json();
            if (data && data.length > 0) {
              const latestScan = data[0].scanId;
              localStorage.setItem('lastScanId', latestScan);
              navigate(`/report/${latestScan}`, { replace: true });
              return;
            }
          } catch (e) {
            console.error(e);
          }
          setCurrentStep('NotFound');
        };
        fetchHistory();
        return;
      }

      setCurrentStep('NotFound');
      return;
    }

    const startScan = async () => {
      try {
<<<<<<< HEAD
        const res = await fetch('http://localhost:3000/api/scan/start', {
=======
        const res = await fetch(`http://${window.location.hostname}:5000/api/scan/start`, {
>>>>>>> 822d0ce404b42f7e706e1eceb50fbf3d3be00948
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl, userEmail })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const newScanId = data.scanId;
        setScanId(newScanId);
        localStorage.setItem('lastScanId', newScanId);
        localStorage.setItem('lastScanUrl', targetUrl);

        if (data.status === 'cached') {
          setProgress(100);
          setLogs(prev => [...prev, `> [INFO] Scan results served from cache.`, `> [OK] Scan Finished.`]);
          setTimeout(() => {
            navigate('/report/' + newScanId);
          }, 1000);
          return;
        }

        // Open SSE connection
<<<<<<< HEAD
        eventSource = new EventSource(`http://localhost:3000/api/scan/progress?scanId=${newScanId}`);
=======
        eventSource = new EventSource(`http://${window.location.hostname}:5000/api/scan/progress?scanId=${newScanId}`);
>>>>>>> 822d0ce404b42f7e706e1eceb50fbf3d3be00948

        eventSource.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          
          if (msg.type === 'progress') {
            setProgress(msg.progress);
            setCurrentStep(msg.step);
            setLogs(prev => [...prev, `> [INFO] ${msg.log}`]);
          } else if (msg.type === 'done') {
            setProgress(100);
            setLogs(prev => [...prev, `> [OK] Scan Finished.`]);
            eventSource.close();
            // Optional: navigate to report page
            setTimeout(() => {
              navigate('/report/' + newScanId); // Ensure you pass scan ID if report page needs it
            }, 1000);
          } else if (msg.type === 'error') {
            setLogs(prev => [...prev, `> [ERROR] ${msg.message}`]);
            eventSource.close();
          }
        };

        eventSource.onerror = (err) => {
          console.error("SSE Error:", err);
          eventSource.close();
        };

      } catch (err) {
        setLogs(prev => [...prev, `> [ERROR] ${err.message}`]);
      }
    };

    startScan();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [targetUrl, navigate, userEmail]);
  return (
    <div className="bg-tech-matrix text-zinc-800 font-sans text-[13px] antialiased min-h-screen flex flex-col selection:bg-[#8C95A6] selection:text-white relative">
      
      {/* Subtle Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-b from-[#8C95A6]/15 via-slate-300/10 to-transparent blur-3xl pointer-events-none -z-10" />


    

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col justify-center">

        {!targetUrl || currentStep === 'NotFound' ? (
          <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center mt-20">
            <div className="bg-white border border-rose-50 rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col items-center justify-center text-center w-[400px]">
              <div className="mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Scan Report Not Found
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                No target URL provided.
              </p>
              <div className="flex items-center gap-3 w-full justify-center">
                <Link to="/" className="px-5 py-2.5 bg-[#0f172a] text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all active:scale-[0.98]">
                  Run New Scan
                </Link>
                <Link to="/history" className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all active:scale-[0.98]">
                  View History
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
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
            {[
              { id: 1, name: 'SSL/TLS Certificate Check', threshold: 30, start: 10 },
              { id: 2, name: 'HTTP Security Headers Scan', threshold: 50, start: 10 },
              { id: 3, name: 'Tech Stack Fingerprinting', threshold: 90, start: 10 },
              { id: 4, name: 'CVE / Known Vulnerability Lookup', threshold: 90, start: 10 },
              { id: 5, name: 'Nuclei Lightweight Scan', threshold: 70, start: 10 },
              { id: 6, name: 'AI-Powered Analysis', threshold: 98, start: 90 }
            ].map(step => {
              const isDone = progress >= step.threshold;
              const isRunning = progress >= step.start && progress < step.threshold;
              const isWaiting = progress < step.start;

              if (isDone) {
                return (
                  <div key={step.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FiCheck className="text-[14px] stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-800">{step.name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      [Done]
                    </span>
                  </div>
                );
              } else if (isRunning) {
                return (
                  <div key={step.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#8C95A6]/20 text-[#5B6475] flex items-center justify-center shrink-0">
                        <FiLoader className="text-[14px] animate-spin" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-950">{step.name}...</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-[#8C95A6] text-white shadow-2xs">
                      [Running]
                    </span>
                  </div>
                );
              } else {
                return (
                  <div key={step.id} className="flex items-center justify-between p-2 rounded-xl opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 font-mono text-[10px]">
                        ⏸
                      </div>
                      <span className="text-xs font-medium text-zinc-600">{step.name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                      [Waiting]
                    </span>
                  </div>
                );
              }
            })}
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
            {logs.map((log, i) => (
              <div key={i} className={
                log.includes('[ERROR]') ? 'text-red-400' : 
                log.includes('[OK]') ? 'text-emerald-400' : 
                log.includes('[WARN]') ? 'text-amber-400' : 
                'text-zinc-400'
              }>
                {log}
              </div>
            ))}
            {progress < 100 && (
              <div className="text-zinc-400 flex items-center gap-1">
                <span>&gt; Processing...</span>
                <span className="w-2 h-3.5 bg-[#8C95A6] inline-block animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="flex items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/80 py-2.5 px-4 rounded-xl text-center">
          <FiAlertTriangle className="text-[14px] text-amber-600 shrink-0" />
          <span className="font-medium">Please don't close this tab while real-time diagnostics are executing.</span>
        </div>

        </>
        )}
      </main>
    </div>
  );
}
