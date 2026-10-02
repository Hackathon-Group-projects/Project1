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
  FiRotateCw,
  FiActivity
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

import OverviewTab from '../report/OverviewTab';
import HeadersTab from '../report/HeadersTab';
import SslTab from '../report/SslTab';
import CvesTab from '../report/CvesTab';
import AttackPathTab from '../report/AttackPathTab';
import NucleiTab from '../report/NucleiTab';
import AiFixModal from '../components/AiFixModal';
import AiFixTab from '../report/AiFixTab';
import { AuthContext } from '../context/AuthContext';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userEmail, token, logout } = React.useContext(AuthContext);
  
  // 1. Manage active tab state (defaults to 'overview')
  const [activeTab, setActiveTab] = useState('overview');
  const [globalIssue, setGlobalIssue] = useState(null);
  const [scanData, setScanData] = useState(null);

  React.useEffect(() => {
    const handleOpenModal = (e) => {
      let matched = null;
      if (e.detail && e.detail.keyword && scanData?.aiReport?.vulnerabilities) {
        const keyword = e.detail.keyword.toLowerCase();
        const issuesToSearch = scanData.aiReport.vulnerabilities;
        matched = issuesToSearch.find(issue => 
          (issue.title && issue.title.toLowerCase().includes(keyword)) ||
          (issue.description && issue.description.toLowerCase().includes(keyword))
        );
        if (!matched && issuesToSearch.length > 0) {
          matched = issuesToSearch[0];
        }
      }
      
      if (matched) {
        setGlobalIssue(matched);
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
            const histRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/scan/history?userEmail=${encodeURIComponent(userEmail)}`, { headers });
            
            if (histRes.status === 401) {
              console.warn("Session expired. Logging out.");
              logout(); // This will clear context and cause a re-render/re-fetch without userEmail
              return;
            }

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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/scan/result/${id}`);
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
      scanData.rawResults.headers.missing.forEach(h => {
        const s = (h.severity || 'MEDIUM').toUpperCase();
        if (s === 'CRITICAL') issues.critical += 1;
        else if (s === 'HIGH') issues.high += 1;
        else if (s === 'MEDIUM') issues.medium += 1;
        else issues.low += 1;
      });
    }
    if (scanData.rawResults.cves && scanData.rawResults.cves.length) {
      scanData.rawResults.cves.forEach(tech => {
        if (tech.vulnerabilities && tech.vulnerabilities.length) {
          cvesCount += tech.vulnerabilities.length;
          tech.vulnerabilities.forEach(vuln => {
            const sev = (vuln.severity || 'MEDIUM').toUpperCase();
            if (sev === 'CRITICAL') issues.critical += 1;
            else if (sev === 'HIGH') issues.high += 1;
            else if (sev === 'MEDIUM') issues.medium += 1;
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

const handleExportPdf = () => {
    if (!scanData) return;
    
    const htmlContent = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f3f4f6; color: #333; max-width: 800px; margin: 0 auto; height: 1000px; position: relative;">
  <div style="background: #0B192C; color: white; display: flex; justify-content: space-between; align-items: center; padding: 20px 40px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg style="width: 28px; height: 28px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
         <path d="M255.565 30.643c-81.598 0-152.721 46.707-189.777 115.92h50.29l16.74-33.481h115.865c2.055-4.234 5.416-7.771 9.246-10.324 6.302-4.201 14.192-6.414 22.748-6.414 8.555 0 16.446 2.213 22.748 6.414 6.302 4.2 11.361 11.054 11.361 19.324 0 8.27-5.06 15.123-11.361 19.324-6.302 4.201-14.193 6.414-22.748 6.414-8.556 0-16.446-2.213-22.748-6.414-3.83-2.553-7.193-6.09-9.248-10.326H143.94l-7.74 15.482h52.402v17.999H57.143a228.822 228.822 0 0 0-5.96 15.48h36.974v17.998H45.802c-4.006 15.707-6.415 32.092-7.051 48.963h109.883l16.742-50.22h39.967v17.997h-26.996l-10.743 32.223h47.594c2.056-4.235 5.418-7.773 9.248-10.326 6.302-4.201 14.193-6.414 22.748-6.414 8.556 0 16.446 2.213 22.748 6.414 6.302 4.2 11.364 11.054 11.364 19.324 0 8.27-5.062 15.123-11.364 19.324-6.302 4.201-14.192 6.414-22.748 6.414-8.555 0-16.446-2.213-22.748-6.414-3.83-2.553-7.192-6.09-9.248-10.326h-95.74l24.482 48.963h78.143v17.998h-89.266l-33.482-66.961H38.751c1.614 42.826 14.69 82.527 36.129 115.922h90.096c2.055-4.235 5.42-7.773 9.25-10.326 6.302-4.201 14.19-6.414 22.746-6.414 8.555 0 16.446 2.213 22.748 6.414 6.302 4.2 11.363 11.054 11.363 19.324 0 8.27-5.061 15.123-11.363 19.324-6.302 4.201-14.193 6.414-22.748 6.414-8.556 0-16.444-2.213-22.746-6.414-3.83-2.553-7.193-6.09-9.248-10.324h-9.784l21.483 32.22h73.328l16.74-33.48h39.043v17.998h-27.92l-7.742 15.483h52.402v17.998H167.046l-33.483-50.219H87.716c39.81 50.37 100.234 82.44 167.85 82.44 92.336 0 171.262-59.806 202.581-144.358-4.882 10.507-10.77 19.344-17.916 25.893-7.212 6.609-16.06 10.914-25.628 10.914-9.569 0-18.417-4.305-25.63-10.914-7.212-6.61-13.145-15.546-18.054-26.182-9.818-21.272-15.537-49.542-15.537-80.711 0-31.169 5.719-59.44 15.537-80.71 4.91-10.637 10.842-19.573 18.055-26.183 7.212-6.609 16.06-10.914 25.629-10.914 9.568 0 18.416 4.305 25.628 10.914 7.146 6.549 13.034 15.386 17.916 25.893C426.828 90.448 347.902 30.643 255.565 30.643zm25.112 83.699c-5.313 0-9.98 1.533-12.766 3.39-2.786 1.858-3.348 3.375-3.348 4.35 0 .975.562 2.492 3.348 4.35 2.787 1.857 7.453 3.39 12.766 3.39s9.979-1.533 12.765-3.39c2.787-1.858 3.346-3.375 3.346-4.35 0-.975-.56-2.492-3.346-4.35-2.786-1.857-7.452-3.39-12.765-3.39zm159.037 83.44c-11.598 0-20.097 8.806-25.37 19.35-5.272 10.545-8.163 24.04-8.163 38.868 0 14.829 2.891 28.323 8.164 38.867 5.272 10.545 13.77 19.352 25.369 19.352 11.598 0 20.098-8.807 25.371-19.352 5.273-10.544 8.164-24.038 8.164-38.867 0-14.829-2.891-28.323-8.164-38.867-5.273-10.545-13.773-19.352-25.371-19.352zm4.613 20.157c1.556 1.497 3.261 3.769 4.93 7.106 3.662 7.324 6.299 18.517 6.299 30.955 0 12.438-2.637 23.63-6.3 30.955-3.662 7.324-7.506 9.57-9.542 9.57-2.036 0-5.88-2.246-9.543-9.57-3.663-7.324-6.297-18.517-6.297-30.955 0-.253.008-.502.01-.754a16.458 24.686 0 0 0 7.604 2.81 16.458 24.686 0 0 0 16.457-24.685 16.458 24.686 0 0 0-3.618-15.432zm-197.133 30.32c-5.313 0-9.977 1.534-12.763 3.391-2.787 1.858-3.348 3.375-3.348 4.35 0 .975.561 2.492 3.348 4.35 2.786 1.857 7.45 3.39 12.763 3.39 5.314 0 9.98-1.533 12.766-3.39 2.786-1.858 3.348-3.375 3.348-4.35 0-.975-.562-2.492-3.348-4.35-2.786-1.857-7.452-3.39-12.766-3.39zm-50.222 133.919c-5.314 0-9.978 1.533-12.764 3.39-2.786 1.858-3.348 3.375-3.348 4.35 0 .975.562 2.492 3.348 4.35 2.786 1.857 7.45 3.39 12.764 3.39 5.313 0 9.979-1.533 12.765-3.39 2.787-1.858 3.348-3.375 3.348-4.35 0-.975-.561-2.492-3.348-4.35-2.786-1.857-7.452-3.39-12.765-3.39z"/>
      </svg>
      <span style="font-size: 24px; font-weight: bold;">Secura</span>
    </div>
    <div style="font-size: 24px; font-weight: 500;">Audit Report</div>
  </div>

  <div style="padding: 20px 40px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 10px; font-size: 14px; font-weight: bold;">
      <div>Target: ${scanData.targetUrl || scanData.targetHostname}</div>
      <div>Assessment Date: ${new Date(scanData.scannedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 30px;">
      Overall summary: <span style="font-weight: normal;">${scanData.aiReport?.executiveSummary ? scanData.aiReport.executiveSummary.substring(0, 150) + '...' : 'Moderate risk level identified requiring prompt remediation. Business continuity is at risk.'}</span>
    </div>

    <div style="display: flex; gap: 30px; margin-bottom: 40px;">
       <div style="flex: 1; text-align: center;">
          <div style="position: relative; width: 200px; height: 100px; margin: 0 auto; overflow: hidden;">
             <div style="width: 200px; height: 200px; border-radius: 50%; border: 20px solid #eee; border-top-color: #ef4444; border-right-color: #eab308; border-left-color: #22c55e; border-bottom-color: transparent; transform: rotate(45deg); box-sizing: border-box;"></div>
             <div style="position: absolute; bottom: 0; left: 50%; width: 4px; height: 80px; background: #0B192C; transform-origin: bottom center; transform: rotate(${score ? (score / 100) * 180 - 90 : -20}deg); margin-left: -2px; border-radius: 4px;"></div>
             <div style="position: absolute; bottom: -8px; left: 50%; width: 16px; height: 16px; background: #0B192C; border-radius: 50%; margin-left: -8px;"></div>
          </div>
          <div style="margin-top: 15px; font-size: 28px; font-weight: bold;">${score}/100</div>
          <div style="color: ${riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? '#ef4444' : riskLevel === 'LOW' ? '#22c55e' : '#eab308'}; font-weight: bold; font-size: 14px; text-transform: uppercase;">${riskLevel} RISK</div>
          
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 20px; font-size: 12px; font-weight: bold;">
            <div style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span> Critical: ${scanData.rawResults?.nuclei?.filter(n => n.severity === 'critical').length || 1}</div>
            <div style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #f97316;"></span> High: ${scanData.rawResults?.nuclei?.filter(n => n.severity === 'high').length || 4}</div>
            <div style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #eab308;"></span> Medium: ${scanData.rawResults?.nuclei?.filter(n => n.severity === 'medium').length || 9}</div>
            <div style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #22c55e;"></span> Low: ${scanData.rawResults?.nuclei?.filter(n => n.severity === 'low').length || 15}</div>
          </div>
          <p style="font-weight: bold; font-size: 14px; margin-top: 20px;">Moderate risk level identified requiring prompt remediation. Business continuity is at risk.</p>
       </div>
       <div style="flex: 1;">
          <div style="border: 2px solid #94a3b8; border-radius: 8px; padding: 20px; background: white; height: 100%; box-sizing: border-box;">
             <h3 style="margin: 0 0 10px 0; font-size: 16px; display: flex; align-items: center; gap: 10px; text-transform: uppercase;">
               <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               EXECUTIVE SUMMARY
             </h3>
             <p style="font-size: 13px; margin-bottom: 10px;">Secura Audit Report is a prepared overview of the system's security posture and compliance status.</p>
             <ul style="font-size: 13px; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Key findings:</strong> Potential vulnerabilities identified that require remediation.</li>
                <li><strong>Compliance violations:</strong> Configuration and protocol standard checks performed.</li>
                <li><strong>Reputational Damage:</strong> AI overview provided to mitigate business risks.</li>
             </ul>
          </div>
       </div>
    </div>

    <h3 style="font-size: 16px; text-transform: uppercase; margin-bottom: 15px;">DIAGNOSTICS SUMMARY</h3>
    <div style="display: flex; gap: 20px;">
       <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #0B192C; color: white; padding: 10px 15px; font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
             <div style="display: flex; align-items: center; gap: 8px;">
               <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               SSL/TLS
             </div>
             <span style="background: ${scanData.rawResults?.ssl?.valid ? '#22c55e' : '#ef4444'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${scanData.rawResults?.ssl?.valid ? 'Valid' : 'Invalid'}</span>
          </div>
          <div style="padding: 15px; display: flex; justify-content: space-between; text-align: center;">
             <div><div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Protocol</div><div style="font-size: 14px; font-weight: bold;">TLS</div></div>
             <div><div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Score</div><div style="font-size: 14px; font-weight: bold; color: ${scanData.rawResults?.ssl?.grade === 'A' ? '#22c55e' : '#eab308'};">${scanData.rawResults?.ssl?.grade || 'N/A'}</div></div>
             <div><div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Strength</div><div style="font-size: 14px; font-weight: bold; color: #22c55e;">${scanData.rawResults?.ssl?.valid ? 'Strong' : 'Weak'}</div></div>
          </div>
       </div>
       <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #0B192C; color: white; padding: 10px 15px; font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
             <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
             Nuclei Scanning
          </div>
          <div style="padding: 15px; display: flex; justify-content: space-between; text-align: center;">
             <div><div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Findings</div><div style="font-size: 14px; font-weight: bold;">${scanData.rawResults?.nuclei?.length || 0} <br><span style="font-size:10px; font-weight:normal">Total</span></div></div>
             <div><div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Critical</div><div style="font-size: 14px; font-weight: bold; color: #ef4444;">${scanData.rawResults?.nuclei?.filter(n => n.severity === 'critical').length || 0}</div></div>
             <div><div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Medium</div><div style="font-size: 14px; font-weight: bold; color: #eab308;">${scanData.rawResults?.nuclei?.filter(n => n.severity === 'medium').length || 0}</div></div>
          </div>
       </div>
    </div>
  </div>

  <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #0B192C; color: white; text-align: right; padding: 10px 40px; font-size: 12px; font-weight: bold;">
    PAGE 1 | 2
  </div>
</div>

<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f3f4f6; color: #333; max-width: 800px; margin: 0 auto; height: 1000px; position: relative; page-break-before: always; padding-top: 40px; overflow: hidden;">
  <div style="padding: 0 40px; height: 900px; overflow: hidden;">
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 30px; margin-top: 0;">Vulnerabilities & AI Remediation</h2>
    
    ${scanData.aiReport?.vulnerabilities && scanData.aiReport.vulnerabilities.length > 0 ? scanData.aiReport.vulnerabilities.slice(0, 2).map((v, idx) => `
    <div style="margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: white;">
       <div style="background: #0B192C; color: white; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
         <div>
            <div style="font-size: 12px; color: #94a3b8;">Finding ${idx + 1}:</div>
            <div style="font-size: 16px; font-weight: bold;">${v.title}</div>
         </div>
         <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
            <span style="background: ${v.severity === 'HIGH' || v.severity === 'CRITICAL' ? '#ef4444' : v.severity === 'MEDIUM' ? '#f97316' : '#eab308'}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">${v.severity} Risk</span>
         </div>
       </div>
       <div style="padding: 15px;">
         <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 14px; margin-bottom: 5px;">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Description
         </div>
         <p style="font-size: 13px; margin-top: 0; margin-bottom: 15px; padding-left: 22px;">${v.title} exposure is identified. Please apply compliance steps.</p>

         <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 14px; margin-bottom: 5px;">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Business impact
         </div>
         <p style="font-size: 13px; margin-top: 0; margin-bottom: 15px; padding-left: 22px;">${v.impact}</p>

         ${v.remediation ? `
         <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 14px; margin-bottom: 5px;">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            AI-generated solution:
         </div>
         <div style="background: #1f2937; color: #a7f3d0; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; white-space: pre-wrap; margin-left: 22px;">${v.remediation}</div>
         ` : ''}
       </div>
    </div>
    `).join('') : '<p>No vulnerabilities found.</p>'}
  </div>

  <div style="position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: flex-end; padding: 10px 40px; border-top: 2px solid #cbd5e1; background: #f3f4f6;">
     <div style="font-size: 10px; color: #64748b; max-width: 80%; padding-bottom: 10px;">
       <strong>Auditor Disclaimer</strong><br>
       ©️ 2023 Secura Solutions. Confidential report. The findings of the assessment reflect the state of the system at the time of scanning. We do not guarantee all vulnerabilities have been identified.
     </div>
     <div style="background: #0B192C; color: white; padding: 10px 20px; font-size: 12px; font-weight: bold; border-top-left-radius: 8px;">
       PAGE 2 | 2
     </div>
  </div>
</div>
`;

    const container = document.createElement('div');
    container.innerHTML = `${htmlContent}`;

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
      case 'attack-path':
        return <AttackPathTab data={scanData} onSwitchTab={setActiveTab} />;
      case 'nuclei':
        return <NucleiTab data={scanData} onSwitchTab={setActiveTab} />;
      case 'ai':
        return <AiFixTab data={scanData} />;
      default:
        return <OverviewTab data={scanData} onSwitchTab={setActiveTab} />;
    }
  };


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
              onClick={() => setActiveTab('attack-path')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'attack-path' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-slate-50'
              }`}
            >
              <FiActivity className="text-[13px] text-cyan-400" />
              <span>Attack Path</span>
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
