const fs = require('fs');

// Patch CVEs Tab
let cvesCode = fs.readFileSync('client/src/report/CvesTab.jsx', 'utf8');
if (!cvesCode.includes('HiSparkles')) {
    cvesCode = cvesCode.replace('import { FiDatabase', 'import { HiSparkles } from "react-icons/hi2";\nimport { FiDatabase');
}
cvesCode = cvesCode.replace('export default function CvesTab({ data }) {', 'export default function CvesTab({ data, onSwitchTab }) {');

const cveFixBtn = `
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommended Action: Upgrade software</span>
                <button 
                  onClick={() => {
                    if (onSwitchTab) onSwitchTab('ai');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-secura-chat', {
                        detail: { query: \`How do I fix \${cve.id} in \${cve.techName}?\` }
                      }));
                    }, 100);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#09090b] hover:bg-zinc-800 active:scale-95 text-white text-[10px] uppercase tracking-wider font-bold rounded-lg shadow-sm transition-all"
                >
                  <HiSparkles className="text-cyan-400 text-xs" />
                  Fix it
                </button>
              </div>
            </div>
`;
// Remove the old Recommended action block and replace with the new flex layout block
cvesCode = cvesCode.replace(/<div className="mt-auto bg-slate-50 p-3 rounded-lg border border-slate-100">[\s\S]*?<\/div>\n\s*<\/div>/, cveFixBtn);
fs.writeFileSync('client/src/report/CvesTab.jsx', cvesCode);

// Patch Nuclei Tab
let nucleiCode = fs.readFileSync('client/src/report/NucleiTab.jsx', 'utf8');
if (!nucleiCode.includes('HiSparkles')) {
    nucleiCode = nucleiCode.replace('import { FiActivity', 'import { HiSparkles } from "react-icons/hi2";\nimport { FiActivity');
}
nucleiCode = nucleiCode.replace('export default function NucleiTab({ data }) {', 'export default function NucleiTab({ data, onSwitchTab }) {');

const nucleiFixBtn = `
                {finding.description && (
                  <p className="text-[11px] text-zinc-500 mt-3 pt-3 border-t border-zinc-800/50 leading-relaxed">
                    {finding.description}
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={() => {
                    if (onSwitchTab) onSwitchTab('ai');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-secura-chat', {
                        detail: { query: \`How do I fix \${finding.name || finding.type} at \${finding.matched}?\` }
                      }));
                    }, 100);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#09090b] hover:bg-zinc-800 active:scale-95 text-white text-[10px] uppercase tracking-wider font-bold rounded-lg shadow-sm transition-all"
                >
                  <HiSparkles className="text-cyan-400 text-xs" />
                  Fix it
                </button>
              </div>
            </div>
`;
nucleiCode = nucleiCode.replace(/\{finding\.description && \([\s\S]*?\}\n\s*<\/div>\n\s*<\/div>/, nucleiFixBtn);
fs.writeFileSync('client/src/report/NucleiTab.jsx', nucleiCode);

console.log("Patched other tabs");
