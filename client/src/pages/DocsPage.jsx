import React, { useState } from 'react';
import { 
  FiBook, 
  FiCpu, 
  FiShield, 
  FiCode, 
  FiTerminal, 
  FiZap, 
  FiGitPullRequest, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiCopy, 
  FiCheck,
  FiExternalLink,
  FiAlertCircle
} from 'react-icons/fi';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('intro');
  const [copiedCmd, setCopiedCmd] = useState('');

  const copyToClipboard = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  const tabs = [ 
    { id: 'intro', label: 'Introduction', icon: <FiBook /> },
    { id: 'engine', label: 'Scanning Engine', icon: <FiCpu /> },
    { id: 'ai', label: 'AI Integration', icon: <FiZap /> },
    { id: 'cicd', label: 'CI/CD (DevSecOps)', icon: <FiGitPullRequest /> },
    { id: 'api', label: 'API Reference', icon: <FiCode /> },
  ];

  const rulesList = [
    { id: "SEC-001", name: "Hardcoded Secret / API Key", sev: "CRITICAL", cwe: "CWE-798", owasp: "A07:2021" },
    { id: "SEC-002", name: "SQL Injection (String Concat)", sev: "CRITICAL", cwe: "CWE-89", owasp: "A03:2021" },
    { id: "SEC-003", name: "DOM-Based XSS (innerHTML)", sev: "CRITICAL", cwe: "CWE-79", owasp: "A03:2021" },
    { id: "SEC-004", name: "Code Injection (eval / Function)", sev: "HIGH", cwe: "CWE-94", owasp: "A03:2021" },
    { id: "SEC-005", name: "Command Injection (child_process)", sev: "HIGH", cwe: "CWE-78", owasp: "A03:2021" },
    { id: "SEC-006", name: "Missing Security Headers (Helmet)", sev: "HIGH", cwe: "CWE-693", owasp: "A05:2021" },
    { id: "SEC-007", name: "Insecure Crypto (MD5 / SHA-1)", sev: "HIGH", cwe: "CWE-327", owasp: "A02:2021" },
    { id: "SEC-008", name: "Path Traversal (File System)", sev: "MEDIUM", cwe: "CWE-22", owasp: "A01:2021" },
    { id: "SEC-009", name: "Server-Side Request Forgery (SSRF)", sev: "MEDIUM", cwe: "CWE-918", owasp: "A10:2021" },
    { id: "SEC-010", name: "Sensitive Data Exposed in Logs", sev: "MEDIUM", cwe: "CWE-532", owasp: "A09:2021" },
    { id: "SEC-011", name: "Insecure Cookie Flags (No HttpOnly)", sev: "LOW", cwe: "CWE-614", owasp: "A07:2021" },
    { id: "SEC-012", name: "Hardcoded JWT Secret String", sev: "HIGH", cwe: "CWE-321", owasp: "A02:2021" },
    { id: "SEC-013", name: "Open CORS Wildcard Origin (*)", sev: "MEDIUM", cwe: "CWE-942", owasp: "A05:2021" },
  ];

  return (
    <div className="mt-[60px] min-h-screen bg-[#fbfbfc] text-slate-800 font-sans flex justify-center pb-12">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8 px-6 py-10">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-[100px]">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 ml-2">Documentation</h2>
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-black border border-slate-200/80'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {tab.id === 'cicd' && (
                    <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      New
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 min-h-[70vh]">
          {activeTab === 'intro' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <FiBook className="text-xl" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Introduction to Secura</h1>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Secura is an advanced passive surface diagnostic and cybersecurity evaluation platform. 
                It safely audits web targets without intrusive active scanning, providing a comprehensive 
                overview of a target's security posture. 
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
                <h3 className="font-bold text-slate-900 mb-2">Why Secura?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Traditional security scanners bombard servers with thousands of intrusive payloads, often causing 
                  unintended downtime and triggering Web Application Firewalls (WAFs). Secura operates 100% passively.
                  We gather deep intelligence using OSINT, public registries, and non-intrusive metadata analysis to map 
                  your attack surface silently and safely.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-md font-semibold">OWASP Compliance</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-md font-semibold">Zero-Impact Audits</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-md font-semibold">Continuous Monitoring</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">Core Features</h3>
              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start gap-3">
                  <FiShield className="mt-1 text-emerald-500 text-lg shrink-0" />
                  <div>
                    <strong className="block text-slate-900 mb-1">Non-Intrusive Scanning</strong>
                    <span className="text-sm">Operates entirely passively, respecting target infrastructure while gathering deep intelligence without triggering alarms.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FiTerminal className="mt-1 text-indigo-500 text-lg shrink-0" />
                  <div>
                    <strong className="block text-slate-900 mb-1">Multi-Stage Pipeline</strong>
                    <span className="text-sm">Analyzes SSL certificates, HTTP headers, technology stacks, and CVE databases in sequence, finishing with a lightweight Nuclei exposure check.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FiZap className="mt-1 text-amber-500 text-lg shrink-0" />
                  <div>
                    <strong className="block text-slate-900 mb-1">AI-Powered Insights</strong>
                    <span className="text-sm">Utilizes Gemini AI to process raw technical findings into actionable, executive-ready reports and code fixes specific to your framework.</span>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'engine' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FiCpu className="text-xl" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Scanning Engine</h1>
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Our scanning engine uses a modular pipeline to extract maximum intelligence from public-facing assets. 
                Each stage feeds into the next, building a complete profile of the target's security posture.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">1. SSL/TLS Inspector</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Node</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Evaluates certificate validity, expiration, CA chains, and protocol configurations.</p>
                  <div className="text-xs font-mono text-slate-500 bg-white p-2 rounded border border-slate-100">
                    Example: Detects expiring certs &gt; 15 days, checks for outdated TLS 1.0/1.1 usage.
                  </div>
                </div>

                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">2. Headers Analysis</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Node</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Checks for missing security flags and identifies dangerous information leaks.</p>
                  <div className="text-xs font-mono text-slate-500 bg-white p-2 rounded border border-slate-100">
                    Flags: Content-Security-Policy, Strict-Transport-Security, X-Powered-By leak.
                  </div>
                </div>

                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">3. Tech Fingerprinting</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Wappalyzer</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Identifies frameworks, libraries, servers, and CMS versions powering the target application.</p>
                  <div className="text-xs font-mono text-slate-500 bg-white p-2 rounded border border-slate-100">
                    Detects: React, Next.js, Express, Nginx, WordPress, jQuery.
                  </div>
                </div>

                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">4. OSV/CVE Lookup</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">OSV.dev</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Cross-references the identified technology stack against global vulnerability databases.</p>
                  <div className="text-xs font-mono text-slate-500 bg-white p-2 rounded border border-slate-100">
                    Maps exact versions (e.g., Express 4.16.0) to known CVE IDs.
                  </div>
                </div>

                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-md transition-shadow md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">5. Nuclei Exposure Check (Passive)</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Go</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Runs a highly restricted, rate-limited subset of Nuclei templates focused strictly on misconfigurations and exposures (no fuzzing or exploitation).</p>
                  <div className="text-xs font-mono text-slate-500 bg-white p-2 rounded border border-slate-100">
                    Template Tags: misconfiguration, exposures (e.g. exposed .env, .git folders, open directory listings).
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <FiZap className="text-xl" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Integration (Gemini)</h1>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Secura is powered by a custom AI-service running on Python & FastAPI, utilizing the <strong>Gemini 1.5 Flash</strong> model for rapid, intelligent vulnerability assessment and remediation generation.
              </p>
              
              <div className="bg-[#0f1115] text-slate-300 p-6 rounded-xl text-sm font-mono leading-relaxed shadow-xl mb-8">
                <p className="text-emerald-400 mb-4">// RAG Pipeline Execution</p>
                <div className="space-y-3">
                  <p className="flex items-center gap-2"><span className="text-blue-400">1.</span> Raw JSON from Node.js scanner is dispatched to Python AI microservice.</p>
                  <p className="flex items-center gap-2"><span className="text-blue-400">2.</span> ChromaDB retrieves relevant OWASP guidelines based on found vulnerabilities.</p>
                  <p className="flex items-center gap-2"><span className="text-blue-400">3.</span> Gemini 1.5 synthesizes a structured JSON report matching the schema.</p>
                  <p className="flex items-center gap-2"><span className="text-blue-400">4.</span> Frontend renders actionable, framework-specific code fixes.</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">Why Gemini 1.5 Flash?</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Security reports require synthesizing large amounts of technical metadata (often 5000+ tokens of raw header, SSL, and CVE data). 
                Gemini 1.5 Flash offers a massive context window, low latency, and highly reliable JSON schema adherence, making it the perfect engine 
                for converting raw scan logs into human-readable executive summaries and developer fixes in seconds.
              </p>
            </div>
          )}

          {/* 🛡️ Member 4: DevSecOps & CI/CD Pipeline Tab */}
          {activeTab === 'cicd' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <FiGitPullRequest className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">CI/CD Pipeline (DevSecOps)</h1>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">
                      Pre-Deploy Guard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">SecAudit Engine & GitHub Actions Integration</p>
                </div>
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Secura is more than a dashboard. Our <strong>DevSecOps CI/CD Integration</strong> ensures vulnerable code never reaches production. 
                Whenever a developer opens a Pull Request, our automated pipeline runs static analysis, blocks vulnerable merges, and auto-comments 
                <strong> Gemini AI-generated fixes</strong> directly on the PR code lines.
              </p>

              {/* Workflow Diagram */}
              <div className="bg-[#0f1115] text-slate-200 p-6 rounded-2xl shadow-lg border border-slate-800 mb-8">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">CI/CD Pipeline Architecture</span>
                  <span className="text-xs font-mono text-emerald-400">● Live Gatekeeper</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs font-mono">
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-center items-center">
                    <span className="text-blue-400 text-lg mb-1">1. Push / PR</span>
                    <span className="text-slate-400">Developer creates PR on GitHub</span>
                  </div>
                  <div className="hidden md:flex items-center justify-center text-slate-600 font-bold">➔</div>
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-center items-center">
                    <span className="text-indigo-400 text-lg mb-1">2. SecAudit Scan</span>
                    <span className="text-slate-400">Runs 13 static analysis rules</span>
                  </div>
                  <div className="hidden md:flex items-center justify-center text-slate-600 font-bold">➔</div>
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-center items-center">
                    <span className="text-rose-400 text-lg mb-1">3. PR Gate & AI Fix</span>
                    <span className="text-slate-400">Blocks merge & comments code fix</span>
                  </div>
                </div>
              </div>

              {/* Three Value Pillars */}
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-rose-600 font-bold text-sm">
                    <FiAlertCircle /> 
                    <span>Zero-Leak Merging</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Exits with code 1 and requests changes on any PR with CRITICAL or HIGH vulnerabilities, preventing vulnerable code from ever reaching Vercel.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm">
                    <FiZap /> 
                    <span>Gemini AI Auto-Fix</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Instead of just warning developers, Gemini 1.5 Flash outputs copy-paste-ready suggestions directly in GitHub review comments.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold text-sm">
                    <FiTerminal /> 
                    <span>Standalone CLI</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Engineers can run <code className="bg-white px-1 py-0.5 rounded border text-[11px]">secaudit scan</code> locally before committing, catching security bugs early.
                  </p>
                </div>
              </div>

              {/* CLI Command Center */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>SecAudit CLI Commands</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">Located at ./cli/secaudit.js</span>
                </h3>

                <div className="space-y-2">
                  {[
                    { cmd: 'node cli/secaudit.js scan', desc: 'Scan current repository for security vulnerabilities' },
                    { cmd: 'node cli/secaudit.js scan --files "src/**/*.js" --severity HIGH', desc: 'Scan specific path and only block on HIGH/CRITICAL issues' },
                    { cmd: 'node cli/secaudit.js scan --files cli/examples/vulnerable-demo.js', desc: 'Scan the built-in vulnerable demo file' },
                    { cmd: 'node cli/secaudit.js rules', desc: 'List all 13 OWASP & CWE security detection rules' },
                    { cmd: 'node cli/secaudit.js scan --format json', desc: 'Emit structured JSON payload for CI/CD runners' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono group">
                      <div className="overflow-x-auto mr-3">
                        <span className="text-emerald-400 mr-2">$</span>
                        <span className="text-slate-200">{item.cmd}</span>
                        <span className="block text-[11px] text-slate-400 mt-1 font-sans">{item.desc}</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(item.cmd)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        {copiedCmd === item.cmd ? (
                          <>
                            <FiCheck className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <FiCopy />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated GitHub PR Comment Mockup */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Live Pull Request Bot Simulation</h3>
                <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm font-sans">
                  {/* PR Header */}
                  <div className="bg-[#f6f8fa] border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="font-bold text-xs text-slate-800 font-mono">SecAudit-CI-Bot requested changes</span>
                    </div>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">Merge Blocked</span>
                  </div>

                  {/* Comment Body */}
                  <div className="p-4 text-xs text-slate-700 bg-white space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        🔴 CRITICAL
                      </span>
                      <span className="font-bold text-slate-900">SQL Injection via String Concatenation [SEC-002]</span>
                      <span className="text-slate-400 font-mono">CWE-89 • OWASP A03:2021</span>
                    </div>

                    <p className="text-slate-600">
                      Raw SQL query constructed via string concatenation with dynamic parameter. This allows arbitrary SQL execution and database compromise.
                    </p>

                    {/* Code Suggestion Block */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden font-mono text-[11px]">
                      <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-slate-500 flex justify-between items-center">
                        <span>Suggested change (Gemini AI)</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">1-Click Apply</span>
                      </div>
                      <div className="bg-rose-50/70 text-rose-800 px-3 py-1 border-b border-rose-100">
                        - const result = db.query("SELECT * FROM users WHERE name = '" + username + "'");
                      </div>
                      <div className="bg-emerald-50 text-emerald-800 px-3 py-1">
                        + const result = await db.query('SELECT * FROM users WHERE name = $1', [username]);
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 13 Rules Matrix */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Enforced Security Rules (13 Standards)</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="p-3">Rule ID</th>
                        <th className="p-3">Vulnerability Category</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Standard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {rulesList.map((rule) => (
                        <tr key={rule.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">{rule.id}</td>
                          <td className="p-3 font-sans text-slate-700">{rule.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rule.sev === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                              rule.sev === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              rule.sev === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {rule.sev}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{rule.cwe} • {rule.owasp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'api' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <FiCode className="text-xl" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">API Reference</h1>
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Integrate Secura into your CI/CD pipelines or custom dashboards using our REST APIs. 
                All endpoints are hosted at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-600">http://localhost:4000</code>.
              </p>
              
              <div className="space-y-6">
                {/* Endpoint 1 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold text-[10px] rounded uppercase tracking-wider">POST</span>
                    <code className="text-sm font-bold text-slate-700">/api/scan/start</code>
                  </div>
                  <div className="p-5 text-sm text-slate-600">
                    <p className="mb-4">Initiates a new passive scan sequence and returns a Queue/Scan ID immediately.</p>
                    <div className="bg-slate-800 text-slate-300 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      <div className="text-slate-500 mb-1">// Request Body</div>
                      {`{ "url": "https://example.com" }`}
                    </div>
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded uppercase tracking-wider">GET</span>
                    <code className="text-sm font-bold text-slate-700">/api/scan/progress?scanId=...</code>
                  </div>
                  <div className="p-5 text-sm text-slate-600">
                    <p className="mb-4">Server-Sent Events (SSE) endpoint to receive real-time terminal logs and progress percentage.</p>
                    <div className="bg-slate-800 text-slate-300 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      <div className="text-slate-500 mb-1">// Event Stream Output</div>
                      {`data: {"type":"progress","step":"SSL Scan","progress":20,"log":"Checking SSL..."}\n\ndata: {"type":"done","scanId":"uuid","log":"Finished."}`}
                    </div>
                  </div>
                </div>

                {/* Endpoint 3 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded uppercase tracking-wider">GET</span>
                    <code className="text-sm font-bold text-slate-700">/api/scan/history</code>
                  </div>
                  <div className="p-5 text-sm text-slate-600">
                    <p>Fetches a list of all previously completed scans from MongoDB, sorted by newest first.</p>
                  </div>
                </div>

                {/* Endpoint 4 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-red-100 text-red-700 font-bold text-[10px] rounded uppercase tracking-wider">DELETE</span>
                    <code className="text-sm font-bold text-slate-700">/api/scan/:id</code>
                  </div>
                  <div className="p-5 text-sm text-slate-600">
                    <p>Deletes a specific scan record from the database by its MongoDB ObjectID.</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
