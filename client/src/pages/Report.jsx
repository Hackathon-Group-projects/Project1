import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
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

const handleExportPdf = () => {
    if (!scanData) return;
    
    // Generate massive comprehensive HTML for the PDF
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        
        <!-- COVER PAGE -->
        <div style="height: 1000px; padding: 60px; display: flex; flex-direction: column; justify-content: center; text-align: center; border-bottom: 5px solid #000;">
          <h4 style="color: #666; letter-spacing: 2px; text-transform: uppercase;">Confidential Document</h4>
          <h1 style="font-size: 48px; color: #111; margin: 20px 0;">Secura Audit Report</h1>
          <h2 style="font-size: 24px; color: #444; font-weight: 300;">Comprehensive Security Analysis</h2>
          <div style="margin-top: 80px; text-align: left; background: #f9fafb; padding: 40px; border-radius: 12px; border: 1px solid #eee;">
            <p style="margin: 10px 0; font-size: 18px;"><strong>Target Scope:</strong> ${scanData.targetUrl}</p>
            <p style="margin: 10px 0; font-size: 18px;"><strong>Resolved Hostname:</strong> ${scanData.targetHostname}</p>
            <p style="margin: 10px 0; font-size: 18px;"><strong>Date of Assessment:</strong> ${new Date(scanData.scannedAt).toLocaleString()}</p>
            <p style="margin: 10px 0; font-size: 18px;"><strong>Overall Risk Level:</strong> <span style="color: ${scanData.aiReport?.riskLevel === 'HIGH' ? '#dc2626' : scanData.aiReport?.riskLevel === 'MEDIUM' ? '#d97706' : '#16a34a'}">${scanData.aiReport?.riskLevel || 'UNKNOWN'}</span></p>
            <p style="margin: 10px 0; font-size: 18px;"><strong>Security Score:</strong> ${scanData.aiReport?.overallScore || 'N/A'}/100</p>
          </div>
          <p style="margin-top: 100px; font-size: 12px; color: #999;">Generated by Secura Automated Engine v2.0<br/>Do not distribute without authorization.</p>
        </div>

        <!-- PAGE BREAK -->
        <div style="page-break-before: always; padding: 40px;">
          <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; font-size: 28px;">1. Assessment Methodology</h2>
          <p style="font-size: 14px; text-align: justify; margin-bottom: 20px;">
            This security audit was conducted using the Secura AI-powered automated scanning engine. The methodology encompasses a non-intrusive, passive reconnaissance approach designed to identify misconfigurations, outdated software, missing security headers, and known Common Vulnerabilities and Exposures (CVEs) without actively exploiting the target infrastructure.
          </p>
          <p style="font-size: 14px; text-align: justify; margin-bottom: 20px;">
            The assessment phases include:
          </p>
          <ul style="font-size: 14px; margin-bottom: 40px; line-height: 1.8;">
            <li><strong>Surface Diagnostics:</strong> Identification of the technology stack, frameworks, and content management systems.</li>
            <li><strong>Transport Security (SSL/TLS):</strong> Evaluation of cryptographic protocols, certificate validity, and potential deprecation of legacy cipher suites.</li>
            <li><strong>HTTP Security Headers:</strong> Analysis of browser-side security enforcement mechanisms (e.g., CSP, HSTS, X-Frame-Options).</li>
            <li><strong>Nuclei Threat Engine:</strong> Template-based vulnerability scanning against known misconfigurations and exposed sensitive files.</li>
            <li><strong>AI Remediation Engine:</strong> Generative AI analysis of aggregated telemetry to formulate precise, context-aware remediation strategies.</li>
          </ul>

          <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; font-size: 28px;">2. Executive Summary</h2>
          <div style="background: #fff5f5; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 40px;">
            <p style="font-size: 15px; margin: 0;">${scanData.aiReport?.executiveSummary || 'No summary available.'}</p>
          </div>
        </div>

        <!-- PAGE BREAK -->
        <div style="page-break-before: always; padding: 40px;">
          <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; font-size: 28px;">3. AI Remediation Plan</h2>
          <p style="font-size: 14px; margin-bottom: 20px;">The following vulnerabilities were identified as high priority. The AI engine has provided specific instructions to remediate these risks.</p>
          
          ${scanData.aiReport?.vulnerabilities && scanData.aiReport.vulnerabilities.length > 0 ? 
            scanData.aiReport.vulnerabilities.map(v => 
              `<div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                 <div style="background: #f3f4f6; padding: 15px; border-bottom: 1px solid #e5e7eb;">
                   <h3 style="margin: 0; font-size: 18px;">[${v.severity}] ${v.title}</h3>
                 </div>
                 <div style="padding: 15px;">
                   <h4 style="margin: 0 0 5px 0; color: #4b5563; font-size: 14px;">Business Impact:</h4>
                   <p style="margin: 0 0 15px 0; font-size: 14px; color: #111;">${v.impact}</p>
                   <h4 style="margin: 0 0 5px 0; color: #4b5563; font-size: 14px;">Remediation Steps:</h4>
                   <div style="background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; white-space: pre-wrap;">${v.remediation}</div>
                 </div>
               </div>`
            ).join('')
            : '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px;"><p style="margin:0; color: #166534;">No critical vulnerabilities required AI remediation.</p></div>'
          }
        </div>

        <!-- PAGE BREAK -->
        <div style="page-break-before: always; padding: 40px;">
          <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; font-size: 28px;">4. Nuclei Diagnostic Findings</h2>
          <p style="font-size: 14px; margin-bottom: 20px;">Detailed findings from the Nuclei vulnerability scanner detecting misconfigurations and default credentials.</p>
          
          ${scanData.rawResults?.nuclei && scanData.rawResults.nuclei.length > 0 ? 
            `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 40px;">
              <thead>
                <tr style="background: #f8fafc; text-align: left;">
                  <th style="padding: 12px; border: 1px solid #e2e8f0;">Severity</th>
                  <th style="padding: 12px; border: 1px solid #e2e8f0;">Finding Name</th>
                  <th style="padding: 12px; border: 1px solid #e2e8f0;">Description</th>
                </tr>
              </thead>
              <tbody>
                ${scanData.rawResults.nuclei.map(n => 
                  `<tr>
                     <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${n.severity === 'critical' ? '#dc2626' : n.severity === 'high' ? '#ea580c' : '#000'}">${n.severity ? n.severity.toUpperCase() : 'INFO'}</td>
                     <td style="padding: 12px; border: 1px solid #e2e8f0;">${n.name || n.info?.name || 'Vulnerability'}</td>
                     <td style="padding: 12px; border: 1px solid #e2e8f0;">${n.description || n.info?.description || 'N/A'}</td>
                   </tr>`
                ).join('')}
              </tbody>
            </table>` 
            : '<p style="font-size: 14px;">No specific Nuclei issues detected during this scan.</p>'
          }

          <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; font-size: 28px; margin-top: 40px;">5. Technology Stack & CVEs</h2>
          ${scanData.rawResults?.cves && scanData.rawResults.cves.length > 0 ? 
            `<div style="font-size: 14px;">
              ${scanData.rawResults.cves.map(tech => 
                `<div style="margin-bottom: 25px;">
                   <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2563eb;">${tech.name} ${tech.version ? `(Version ${tech.version})` : ''}</h3>
                   ${tech.vulnerabilities && tech.vulnerabilities.length > 0 ? 
                     `<ul style="margin: 0; padding-left: 20px;">
                        ${tech.vulnerabilities.map(vuln => 
                          `<li style="margin-bottom: 8px;"><strong>${vuln.cve}</strong> <span style="background:#fee2e2; color:#991b1b; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 5px;">${vuln.severity}</span><br/><span style="color: #555;">${vuln.description}</span></li>`
                        ).join('')}
                      </ul>` : '<p style="margin: 0; color: #16a34a; font-weight: 500;">No known CVEs for this technology version.</p>'
                   }
                 </div>`
              ).join('')}
            </div>` : '<p style="font-size: 14px;">No significant tech stack components identified.</p>'
          }
        </div>

        <!-- PAGE BREAK -->
        <div style="page-break-before: always; padding: 40px;">
          <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; font-size: 28px;">6. Protocol & Header Security</h2>
          
          <h3 style="font-size: 20px; color: #333; margin-top: 30px;">SSL / TLS Configuration</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px;">
            <tbody>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; width: 30%;">Certificate Status</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: ${scanData.rawResults?.ssl?.valid ? '#16a34a' : '#dc2626'}">${scanData.rawResults?.ssl?.valid ? 'Valid & Trusted' : 'Invalid / Untrusted'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Days Remaining</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${scanData.rawResults?.ssl?.daysRemaining || 'N/A'} days</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">SSL Grade</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${scanData.rawResults?.ssl?.grade || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Certificate Issuer</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${scanData.rawResults?.ssl?.issuer || 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="font-size: 20px; color: #333; margin-top: 30px;">Missing Security Headers</h3>
          ${scanData.rawResults?.headers?.missing && scanData.rawResults.headers.missing.length > 0 ? 
            `<div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${scanData.rawResults.headers.missing.map(header => 
                `<span style="background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 13px;">${header}</span>`
              ).join('')}
            </div>
            <p style="font-size: 13px; color: #666; margin-top: 15px;">It is recommended to implement these headers to mitigate XSS, clickjacking, and content-sniffing attacks.</p>` 
            : '<p style="font-size: 14px; color: #16a34a; font-weight: 500;">All required security headers are properly implemented.</p>'
          }

          <div style="margin-top: 80px; padding: 30px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b; text-align: justify;">
            <strong>Disclaimer:</strong> This automated report is generated for informational purposes only. The findings reflect the state of the target system at the exact time of the scan. Secura does not guarantee that all vulnerabilities have been identified. It is the responsibility of the system owner to manually verify and patch the vulnerabilities before they can be exploited. 
          </div>
        </div>
      </div>
    `;

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opt = {
      margin: 0,
      filename: `secura_report_${scanData.targetHostname || 'target'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(container).save();
  };

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
      <main id="report-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">

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
              <button onClick={handleExportPdf} className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-zinc-700 hover:bg-slate-50 transition-colors">
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
