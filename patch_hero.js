const fs = require('fs');
const file = 'client/src/pages/Hero.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!url || !confirmed) return;
    window.location.href = \`/scanning?url=\${encodeURIComponent(url)}\`;
  };`;

const newCode = `  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!url || !confirmed) return;
    
    let target = url.trim();
    if (!/^https?:\\/\\//i.test(target)) {
      target = 'https://' + target;
    }
    
    try {
      new URL(target);
      // Extra validation to prevent things like 'https://www.npmjs' (missing TLD)
      if (!target.includes('.')) {
         alert("Please enter a complete domain with an extension (e.g., domain.com)");
         return;
      }
      window.location.href = \`/scanning?url=\${encodeURIComponent(target)}\`;
    } catch(err) {
      alert("Please enter a valid URL (e.g., example.com)");
    }
  };`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
