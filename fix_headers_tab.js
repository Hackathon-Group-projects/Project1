const fs = require('fs');
let code = fs.readFileSync('client/src/report/HeadersTab.jsx', 'utf8');

// I'll rewrite the whole map for 'secure' to remove the 'Fix it' button.
const secureRegex = /\{secure && secure\.map\(\(h, i\) => \{([\s\S]*?)Fix it([\s\S]*?)<\/button>[\s\S]*?<\/div>\n\s*<\/div>\n\s*\);\n\s*\}\)\}/g;

code = code.replace(secureRegex, \`{secure && secure.map((h, i) => {
             const explain = HEADER_EXPLANATIONS[h.header] || { what: 'Provides additional security enforcement.', risk: 'Mitigated.' };
             return (
              <div key={i} className="bg-white border-l-4 border-l-emerald-500 border border-slate-200 rounded-r-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-mono text-sm font-bold text-zinc-900">{h.header}</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-700">SECURE</span>
                </div>
                <div className="text-xs text-zinc-600 bg-slate-50 p-3 rounded-lg space-y-2">
                  <p><span className="font-bold text-zinc-800">What it does:</span> {explain.what}</p>
                  <div>
                    <span className="font-bold text-zinc-800 block mb-1">Detected Value:</span>
                    <div className="max-h-24 overflow-y-auto bg-[#0B0D13] p-2 rounded text-[10px] font-mono text-emerald-400 break-all border border-zinc-800 shadow-inner">
                      {h.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}\`);
fs.writeFileSync('client/src/report/HeadersTab.jsx', code);
