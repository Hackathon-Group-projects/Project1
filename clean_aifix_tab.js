const fs = require('fs');

let code = fs.readFileSync('client/src/report/AiFixTab.jsx', 'utf8');

// 1. Remove the modal JSX block
const modalRegex = /\{selectedIssue && \([\s\S]*?\}\n\s*\)\}\n\s*<\/div>/;
code = code.replace(modalRegex, '</div>');

// 2. Change View in Details button to fire open-ai-modal
const viewBtnRegex = /onClick=\{\(\) => setSelectedIssue\(issue\)\}/g;
code = code.replace(viewBtnRegex, "onClick={() => window.dispatchEvent(new CustomEvent('open-ai-modal', { detail: { issue: issue } }))}");

// 3. Remove selectedIssue state and effect
code = code.replace(/const \[selectedIssue, setSelectedIssue\] = useState\(null\);\n/, '');
code = code.replace(/React\.useEffect\(\(\) => \{[\s\S]*?\}, \[data\]\);/, '');

fs.writeFileSync('client/src/report/AiFixTab.jsx', code);
console.log("AiFixTab cleaned.");
