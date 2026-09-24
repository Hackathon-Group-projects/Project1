const fs = require('fs');
let code = fs.readFileSync('client/src/report/AiFixTab.jsx', 'utf8');

// Find the start of the modal block
const startIndex = code.indexOf('{selectedIssue && (');

if (startIndex !== -1) {
  // Find the closing brace of the modal block. 
  // We'll just cut off everything after {selectedIssue && ( and close the main div
  const beforeModal = code.substring(0, startIndex);
  
  // Close the main div cleanly
  code = beforeModal + '\n    </div>\n  );\n}\n';
  fs.writeFileSync('client/src/report/AiFixTab.jsx', code);
  console.log("Modal block removed cleanly.");
} else {
  console.log("Could not find selectedIssue block.");
}
