import React, { useState } from 'react';
import { FiBook, FiCpu, FiShield, FiCode, FiTerminal, FiZap } from 'react-icons/fi';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('intro');

  const tabs = [
    { id: 'intro', label: 'Introduction', icon: <FiBook /> },
    { id: 'engine', label: 'Scanning Engine', icon: <FiCpu /> },
    { id: 'ai', label: 'AI Integration', icon: <FiZap /> },
    { id: 'api', label: 'API Reference', icon: <FiCode /> },
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
              <h3 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">Core Features</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <FiShield className="mt-1 text-emerald-500" />
                  <span><strong>Non-Intrusive Scanning:</strong> Operates entirely passively, respecting target infrastructure while gathering deep intelligence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiTerminal className="mt-1 text-indigo-500" />
                  <span><strong>Multi-Stage Pipeline:</strong> Analyzes SSL certificates, HTTP headers, technology stacks, and CVE databases in sequence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiZap className="mt-1 text-amber-500" />
                  <span><strong>AI-Powered Insights:</strong> Utilizes Gemini AI to process raw technical findings into actionable, executive-ready reports and code fixes.</span>
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
              <p className="text-slate-600 mb-6 leading-relaxed">
                Our scanning engine uses a modular pipeline to extract maximum intelligence from public-facing assets.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-2">1. SSL/TLS Inspector</h4>
                  <p className="text-sm text-slate-600">Evaluates certificate validity, expiration, CA chains, and protocol configurations (TLS 1.2/1.3).</p>
                </div>
                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-2">2. Headers Analysis</h4>
                  <p className="text-sm text-slate-600">Checks for security flags like CSP, HSTS, X-Frame-Options, and identifies dangerous information leaks.</p>
                </div>
                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-2">3. Tech Stack Fingerprinting</h4>
                  <p className="text-sm text-slate-600">Identifies frameworks, libraries, servers, and CMS versions powering the target application.</p>
                </div>
                <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-2">4. OSV/CVE Lookup</h4>
                  <p className="text-sm text-slate-600">Cross-references the identified technology stack against global vulnerability databases to find known exploits.</p>
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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Integration</h1>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Secura is powered by a custom AI-service running on Python & FastAPI, utilizing the <strong>Gemini 1.5 Flash</strong> model for rapid, intelligent vulnerability assessment.
              </p>
              <div className="bg-slate-900 text-slate-300 p-5 rounded-xl text-sm font-mono leading-relaxed shadow-inner">
                <p className="text-emerald-400 mb-2">// How it works</p>
                <p>1. Raw JSON from the Node.js scanner is dispatched to the Python AI microservice.</p>
                <p>2. The RAG system searches local OWASP guidelines via ChromaDB.</p>
                <p>3. Gemini 1.5 synthesizes a structured JSON report.</p>
                <p>4. The frontend renders actionable fixes tailored to the exact framework used.</p>
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
              <p className="text-slate-600 mb-6 leading-relaxed">
                Integrate Secura into your CI/CD pipelines or custom dashboards using our REST APIs.
              </p>
              
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded uppercase">POST</span>
                    <code className="text-sm font-bold text-slate-700">/api/scan/start</code>
                  </div>
                  <div className="p-4 text-sm text-slate-600">
                    <p className="mb-2">Initiates a new passive scan sequence and returns a Queue ID.</p>
                    <p className="font-mono text-xs bg-slate-100 p-2 rounded text-slate-800">Body: {`{ "url": "https://example.com" }`}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded uppercase">GET</span>
                    <code className="text-sm font-bold text-slate-700">/api/scan/progress?scanId=...</code>
                  </div>
                  <div className="p-4 text-sm text-slate-600">
                    <p>Server-Sent Events (SSE) endpoint to receive real-time terminal logs and progress percentage.</p>
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
