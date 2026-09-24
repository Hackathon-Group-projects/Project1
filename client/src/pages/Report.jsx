import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
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
import AiFixModal from '../components/AiFixModal';
import AiFixTab from '../report/AiFixTab';
import { AuthContext } from '../context/AuthContext';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userEmail, token } = React.useContext(AuthContext);
  
  // 1. Manage active tab state (defaults to 'overview')
  const [activeTab, setActiveTab] = useState('overview');
  const [globalIssue, setGlobalIssue] = useState(null);
  const [scanData, setScanData] = useState(null);

  React.useEffect(() => {
    const handleOpenModal = (e) => {
      if (e.detail && e.detail.keyword && scanData?.aiReport?.vulnerabilities) {
        const keyword = e.detail.keyword.toLowerCase();
        const issuesToSearch = scanData.aiReport.vulnerabilities;
        const matched = issuesToSearch.find(issue => 
          (issue.title && issue.title.toLowerCase().includes(keyword)) ||
          (issue.description && issue.description.toLowerCase().includes(keyword))
        );
        if (matched) {
          setGlobalIssue(matched);
        } else if (issuesToSearch.length > 0) {
          setGlobalIssue(issuesToSearch[0]);
        }
      } else if (e.detail && e.detail.issue) {
         setGlobalIssue(e.detail.issue);
      }
    };
    window.addEventListener('open-ai-modal', handleOpenModal);
    return () => window.removeEventListener('open-ai-modal', handleOpenModal);
  }, [scanData]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        if (userEmail) {
          // Logged in: fetch history and redirect to newest
          try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const histRes = await fetch(`http://${window.location.hostname}:4000/api/scan/history?userEmail=${encodeURIComponent(userEmail)}`, { headers });
            const histData = await histRes.json();
            if (histData && histData.length > 0) {
              const latestScan = histData[0].scanId;
              localStorage.setItem('lastScanId', latestScan);
              navigate(`/report/${latestScan}`, { replace: true });
              return;
            }
          } catch (e) {
            console.error("Failed to fetch history:", e);
          }
        } else {
          // Logged out: use localStorage fallback
          const lastScanId = localStorage.getItem('lastScanId');
          if (lastScanId) {
            navigate(`/report/${lastScanId}`, { replace: true });
            return;
          }
        }
        
        // No history or last scan found
        setScanData({ notFound: true });
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`http://${window.location.hostname}:4000/api/scan/result/${id}`);
        const data = await res.json();
        setScanData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, userEmail]);

  if (loading) {
    return <div className="text-center py-20">Loading report data...</div>;
  }

  if (!scanData || scanData.notFound || scanData.error || scanData.unauthorized) {
    return (
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
            No scan ID provided in URL.
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
    );
  }

  // 2. Function to render the correct component based on state
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={scanData} onSwitchTab={setActiveTab} />;
      case 'headers':
        return <HeadersTab data={scanData} onSwitchTab={setActiveTab} />;
      case 'ssl':
        return <SslTab data={scanData} onSwitchTab={setActiveTab} />;
      case 'cves':
        return <CvesTab data={scanData} onSwitchTab={setActiveTab} />;
      case 'nuclei':
        return <NucleiTab data={scanData} onSwitchTab={setActiveTab} />;
      case 'ai':
        return <AiFixTab data={scanData} />;
      default:
        return <OverviewTab data={scanData} onSwitchTab={setActiveTab} />;
    }
  };

  // Compute score
  let score = 100;
  const issues = { critical: 0, high: 0, medium: 0, low: 0 };
  let missingHeadersCount = 0;
  let cvesCount = 0;
  let nucleiCount = 0;
  let techStackName = 'Unknown';
  let sslGrade = 'N/A';

  if (scanData && scanData.rawResults) {
    if (scanData.rawResults.headers && scanData.rawResults.headers.missing) {
      missingHeadersCount = scanData.rawResults.headers.missing.length;
      issues.medium += missingHeadersCount;
    }
    if (scanData.rawResults.cves && scanData.rawResults.cves.length) {
      scanData.rawResults.cves.forEach(tech => {
        if (tech.vulnerabilities && tech.vulnerabilities.length) {
          cvesCount += tech.vulnerabilities.length;
          tech.vulnerabilities.forEach(vuln => {
            if (vuln.severity === 'CRITICAL') issues.critical += 1;
            else if (vuln.severity === 'HIGH') issues.high += 1;
            else if (vuln.severity === 'MEDIUM') issues.medium += 1;
            else issues.low += 1;
          });
        }
      });
    }
    if (scanData.rawResults.nuclei && scanData.rawResults.nuclei.length) {
       nucleiCount = scanData.rawResults.nuclei.length;
       scanData.rawResults.nuclei.forEach(n => {
         const sev = n.severity ? n.severity.toUpperCase() : 'LOW';
         if (sev === 'CRITICAL') issues.critical += 1;
         else if (sev === 'HIGH') issues.high += 1;
         else if (sev === 'MEDIUM') issues.medium += 1;
         else issues.low += 1;
       });
    }
    if (scanData.rawResults.ssl) {
       const daysLeft = scanData.rawResults.ssl.daysRemaining;
       if (daysLeft <= 0 || !scanData.rawResults.ssl.valid) {
         issues.critical += 1;
       }
       if (scanData.rawResults.ssl.grade) {
         sslGrade = scanData.rawResults.ssl.grade;
       }
    }
    if (scanData.rawResults.tech && scanData.rawResults.tech.length > 0) {
      techStackName = scanData.rawResults.tech[0].name;
    }
  }
  
  score = Math.max(0, 100 - (issues.critical * 25 + issues.high * 15 + issues.medium * 5 + issues.low * 2));
  const riskLevel = score > 80 ? 'LOW' : score > 50 ? 'MEDIUM' : 'HIGH';

  if (!scanData || scanData.error) {
    return (
      <div className="bg-[#f8fafc] text-zinc-800 font-sans min-h-screen flex items-center justify-center">
        <div className="p-8 text-center bg-white rounded-xl border border-red-100 shadow-sm max-w-md">
          <FiShield className="mx-auto text-4xl text-red-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Scan Report Not Found</h3>
          <p className="text-slate-500 mt-2 text-sm mb-6">
            {scanData?.error || 'No scan ID provided. Please run a new scan or select one from history.'}
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/scanning" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
              Run New Scan
            </Link>
            <Link to="/history" className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200">
              View History
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                  className={`${riskLevel === 'HIGH' ? 'text-red-500' : riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'} stroke-current transition-all duration-1000`}
                  strokeDasharray={`${score}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold font-mono text-zinc-950 leading-none">{score}</span>
                <span className="text-xs font-mono text-zinc-400 mt-1 font-semibold">/ 100</span>
              </div>
            </div>

            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono ${riskLevel === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} border`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${riskLevel === 'HIGH' ? 'bg-red-500' : riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>RISK LEVEL: {riskLevel}</span>
            </div>

            <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Target:</span>
                <span className="font-semibold text-zinc-800">{scanData?.targetHostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Scan Date:</span>
                <span className="text-zinc-700">{scanData?.scannedAt ? new Date(scanData.scannedAt).toLocaleDateString() : 'Invalid Date'}</span>
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
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${sslGrade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{sslGrade}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiFileText className="text-[#5B6475]" />
                  <span>HTTP Headers</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${missingHeadersCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{missingHeadersCount} Missing</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiCpu className="text-[#5B6475]" />
                  <span>Tech Stack</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200 text-slate-800 truncate max-w-[100px]">{techStackName}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiAlertCircle className="text-red-500" />
                  <span>CVE Registry</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${cvesCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{cvesCount} Found</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <FiCrosshair className="text-red-500" />
                  <span>Nuclei Engine</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${nucleiCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{nucleiCount} Issues</span>
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
          
          {/* Internal Tab Buttons (Replaced NavLinks with regular buttons + state handlers) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('headers')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'headers' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
              }`}
            >
              Headers ({missingHeadersCount})
            </button>

            <button
              onClick={() => setActiveTab('ssl')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ssl' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
              }`}
            >
              SSL / TLS
            </button>

            <button
              onClick={() => setActiveTab('cves')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cves' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
              }`}
            >
              CVEs ({cvesCount})
            </button>

            <button
              onClick={() => setActiveTab('nuclei')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'nuclei' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
              }`}
            >
              Nuclei ({nucleiCount})
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ai' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
              }`}
            >
              <HiSparkles className="text-[14px]" />
              <span>AI Remediation</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-cyan-100 text-cyan-800 font-mono font-bold">RAG</span>
            </button>
          </div>

          {/* Render Active Component Manually */}
          <div className="w-full">
            {renderTabContent()}
          </div>

        </section>

            </main>
      <AiFixModal issue={globalIssue} onClose={() => setGlobalIssue(null)} />
    </div>
  );
}
