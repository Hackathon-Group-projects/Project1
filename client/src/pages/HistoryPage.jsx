import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGlobe, FiSearch, FiFileText } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { AuthContext } from '../context/AuthContext';

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalScanId, setDeleteModalScanId] = useState(null);
  const navigate = useNavigate();
  const { userEmail, token } = useContext(AuthContext);

  useEffect(() => {
    fetchHistory();
  }, [userEmail, token]);

  const fetchHistory = async () => {
    try {
      const queryParams = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`http://${window.location.hostname}:4000/api/scan/history${queryParams}`, { headers });
      
      if (!res.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await res.json();
      setScans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch history', error);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  
  const confirmDelete = async () => {
    const id = deleteModalScanId;
    if (!id) return;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      await fetch(`http://${window.location.hostname}:4000/api/scan/${id}`, { method: 'DELETE', headers });
      setScans(scans.filter(s => s._id !== id));
      setDeleteModalScanId(null);
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };


  const calculateScore = (scan) => {
    if (!scan.rawResults) return 100;
    let score = 100;
    const issues = { critical: 0, high: 0, medium: 0 };
    
    if (scan.rawResults.headers && scan.rawResults.headers.missing) {
      issues.medium += scan.rawResults.headers.missing.length;
      score -= scan.rawResults.headers.missing.length * 2;
    }
    if (scan.rawResults.cves && scan.rawResults.cves.length) {
      let cvesCount = 0;
      scan.rawResults.cves.forEach(tech => {
        if (tech.vulnerabilities && tech.vulnerabilities.length) {
          cvesCount += tech.vulnerabilities.length;
          tech.vulnerabilities.forEach(vuln => {
            if (vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH') issues.high += 1;
            else issues.medium += 1;
          });
        }
      });
      score -= cvesCount * 5;
    }
    if (scan.rawResults.nuclei && scan.rawResults.nuclei.length) {
       scan.rawResults.nuclei.forEach(n => {
         const sev = n.severity ? n.severity.toUpperCase() : 'INFO';
         if (sev === 'CRITICAL') issues.critical += 1;
         else if (sev === 'HIGH') issues.high += 1;
         else issues.medium += 1;
       });
       score -= scan.rawResults.nuclei.length * 10;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      riskLevel: score > 80 ? 'LOW' : score > 50 ? 'MEDIUM' : 'HIGH'
    };
  };

  const filteredScans = scans.filter(scan => 
    scan.targetHostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.targetUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='mt-[50px] mx-auto min-h-screen bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pb-12 px-4'>
      <div className="max-w-4xl mx-auto pt-10">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 font-sans uppercase">
            MY SCAN HISTORY
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Review cybersecurity & syntax evaluation reports with detailed scores, vulnerability analysis, and code fixes.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-sm mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search URL..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-lg text-sm text-slate-600 focus:outline-none focus:bg-white">
              <option>Date ▼</option>
            </select>
            <select className="px-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-lg text-sm text-slate-600 focus:outline-none focus:bg-white">
              <option>Risk Level ▼</option>
            </select>
          </div>
        </div>

        {/* Scan List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-10 text-slate-500 font-mono text-sm">Loading history...</div>
          ) : filteredScans.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-sm">No scans found.</div>
          ) : (
            filteredScans.map((scan) => {
              const { score, issues, riskLevel } = calculateScore(scan);
              
              const riskColor = 
                riskLevel === 'HIGH' ? 'text-red-600 bg-red-50 border-red-100' : 
                riskLevel === 'MEDIUM' ? 'text-amber-600 bg-amber-50 border-amber-100' : 
                'text-emerald-600 bg-emerald-50 border-emerald-100';

              const riskDot = 
                riskLevel === 'HIGH' ? 'bg-red-500' : 
                riskLevel === 'MEDIUM' ? 'bg-amber-500' : 
                'bg-emerald-500';

              return (
                <div key={scan._id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <FiGlobe className="text-[18px]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                          {scan.targetHostname || scan.targetUrl}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-semibold mb-0.5">SCORE</span>
                        <div className="text-xl font-bold font-sans tracking-tight text-slate-900">
                          {score}<span className="text-sm text-slate-500 font-medium">/100</span>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider ${riskColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${riskDot}`}></span>
                        {riskLevel}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs font-sans text-slate-500">
                      <span>Scanned: <span className="font-medium text-slate-700">{new Date(scan.scannedAt || scan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
                      <span>Duration: <span className="font-medium text-slate-700">18s</span></span>
                      <span>
                        Issues: 
                        {issues.critical > 0 && <span className="text-red-600 font-semibold ml-1">{issues.critical} Critical , </span>}
                        {issues.high > 0 && <span className="text-amber-600 font-semibold ml-1">{issues.high} High , </span>}
                        <span className="text-slate-600 font-medium ml-1">{issues.medium} Medium</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                      <Link 
                        to={`/report/${scan.scanId}`}
                        className="px-3 py-1.5 bg-[#0f1115] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <FiFileText className="text-[13px]" /> [View Report]
                      </Link>
                      <button 
                        onClick={() => setDeleteModalScanId(scan._id)}
                        className="px-2 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                      >
                        [Delete]
                      </button>
                      <button 
                        onClick={() => navigate(`/scanning?url=${encodeURIComponent(scan.targetUrl)}`)}
                        className="px-2 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-transparent hover:border-slate-200 rounded-lg transition-all"
                      >
                        [Re-scan]
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>



        {/* Custom Delete Modal */}
        {deleteModalScanId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Scan Report</h3>
              <p className="text-slate-500 text-sm mb-6">Are you sure you want to remove this report from your history? This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setDeleteModalScanId(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-all"
                >
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
