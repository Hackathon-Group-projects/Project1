const fs = require('fs');

let code = fs.readFileSync('client/src/report/AiFixTab.jsx', 'utf8');

const oldParser = `function getParsedContent(description) {
  if (!description) return { explanation: '', fixCode: '' };
  const lowerDesc = description.toLowerCase();
  let splitIndex = -1;
  const fixKeywords = ['to fix this', 'remediation', 'how to fix', 'solution:', 'fix:', 'step-by-step', 'here is how to'];
  for (const kw of fixKeywords) {
    const idx = lowerDesc.indexOf(kw);
    if (idx !== -1) {
      if (splitIndex === -1 || idx < splitIndex) {
        splitIndex = idx;
      }
    }
  }
  if (splitIndex === -1) {
    return { explanation: description, fixCode: '' };
  }
  return {
    explanation: description.substring(0, splitIndex).trim(),
    fixCode: description.substring(splitIndex).trim()
  };
}`;

const newParser = `function getParsedContent(description) {
  if (!description) return { explanation: 'No details provided.', fixCode: '' };
  
  const codeIdx = description.indexOf('\`\`\`');
  
  if (codeIdx === -1) {
    // If no code blocks exist, just put the whole text in explanation
    return { explanation: description, fixCode: 'No code patch provided. Review configuration manually.' };
  }
  
  // Find the last paragraph break BEFORE the code block
  let splitIdx = description.lastIndexOf('\\n\\n', codeIdx);
  
  // If there's no double newline, try a single newline
  if (splitIdx === -1) {
    splitIdx = description.lastIndexOf('\\n', codeIdx);
  }
  
  // If still no newline, just split exactly at the code block
  if (splitIdx === -1 || splitIdx === 0) {
    splitIdx = codeIdx;
  }

  const explanation = description.substring(0, splitIdx).trim();
  const fixCode = description.substring(splitIdx).trim();

  return { 
    explanation: explanation || 'Security configuration issue detected.', 
    fixCode: fixCode 
  };
}`;

if (code.includes('function getParsedContent')) {
  // Try to replace the exact function block. 
  // We'll use a regex to grab the whole function getParsedContent(description) { ... }
  code = code.replace(/function getParsedContent\(description\) \{[\s\S]*?\n\}/, newParser);
  fs.writeFileSync('client/src/report/AiFixTab.jsx', code);
  console.log("Patched getParsedContent successfully");
} else {
  console.log("Could not find getParsedContent function");
}
