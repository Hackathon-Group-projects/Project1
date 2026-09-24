const fs = require('fs');

let code = fs.readFileSync('client/src/pages/Report.jsx', 'utf8');

// 1. Remove the misplaced useEffect block
const oldHooks = `const [activeTab, setActiveTab] = useState('overview');
  const [globalIssue, setGlobalIssue] = useState(null);

  useEffect(() => {
    const handleOpenModal = (e) => {
      if (e.detail && e.detail.keyword && scanData?.aiReport?.vulnerabilities) {
        const keyword = e.detail.keyword.toLowerCase();
        const issuesToSearch = scanData.aiReport.vulnerabilities;
        const matched = issuesToSearch.find(issue => 
          (issue.title && issue.title.toLowerCase().includes(keyword)) ||
          (issue.description && issue.description.toLowerCase().includes(keyword))
        );
        if (matched) {
          setGlobalIssue(matched);
        } else if (issuesToSearch.length > 0) {
          setGlobalIssue(issuesToSearch[0]);
        }
      } else if (e.detail && e.detail.issue) {
         // Direct issue passing for AiFixTab
         setGlobalIssue(e.detail.issue);
      }
    };
    window.addEventListener('open-ai-modal', handleOpenModal);
    return () => window.removeEventListener('open-ai-modal', handleOpenModal);
  }, [scanData]);
  const [scanData, setScanData] = useState(null);`;

const newHooks = `const [activeTab, setActiveTab] = useState('overview');
  const [globalIssue, setGlobalIssue] = useState(null);
  const [scanData, setScanData] = useState(null);

  React.useEffect(() => {
    const handleOpenModal = (e) => {
      if (e.detail && e.detail.keyword && scanData?.aiReport?.vulnerabilities) {
        const keyword = e.detail.keyword.toLowerCase();
        const issuesToSearch = scanData.aiReport.vulnerabilities;
        const matched = issuesToSearch.find(issue => 
          (issue.title && issue.title.toLowerCase().includes(keyword)) ||
          (issue.description && issue.description.toLowerCase().includes(keyword))
        );
        if (matched) {
          setGlobalIssue(matched);
        } else if (issuesToSearch.length > 0) {
          setGlobalIssue(issuesToSearch[0]);
        }
      } else if (e.detail && e.detail.issue) {
         setGlobalIssue(e.detail.issue);
      }
    };
    window.addEventListener('open-ai-modal', handleOpenModal);
    return () => window.removeEventListener('open-ai-modal', handleOpenModal);
  }, [scanData]);`;

code = code.replace(oldHooks, newHooks);

// Also need to check if I missed useState import, although React.useState might be needed.
if (!code.includes('import React, { useState')) {
  // It's already there probably.
}

fs.writeFileSync('client/src/pages/Report.jsx', code);
console.log("Fixed Report.jsx hook order");
