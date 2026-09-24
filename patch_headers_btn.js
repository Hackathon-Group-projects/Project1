const fs = require('fs');

let code = fs.readFileSync('client/src/report/HeadersTab.jsx', 'utf8');

// Update props
code = code.replace('export default function HeadersTab({ data }) {', 'export default function HeadersTab({ data, onSwitchTab }) {');

// Add HiSparkles import if missing
if (!code.includes('HiSparkles')) {
    code = code.replace('import { FiShield', 'import { HiSparkles } from "react-icons/hi2";\nimport { FiShield');
}

// Add Fix It button logic
const fixBtn = `
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => {
                      if (onSwitchTab) onSwitchTab('ai');
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-secura-chat', {
                          detail: { query: \`How do I fix the missing \${h.header} security header?\` }
                        }));
                      }, 100);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold rounded-md shadow-sm transition-all"
                  >
                    <HiSparkles className="text-cyan-400 text-sm" />
                    Fix it
                  </button>
                </div>
              </div>
            );
`;

code = code.replace(/<\/div>\n\s*<\/div>\n\s*\);\n\s*\}\)/g, fixBtn + '          })');

fs.writeFileSync('client/src/report/HeadersTab.jsx', code);
console.log("Headers patched");
