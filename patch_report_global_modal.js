const fs = require('fs');

let reportCode = fs.readFileSync('client/src/pages/Report.jsx', 'utf8');

// Add AiFixModal import
if (!reportCode.includes('AiFixModal')) {
    reportCode = reportCode.replace(
        "import NucleiTab from '../report/NucleiTab';", 
        "import NucleiTab from '../report/NucleiTab';\nimport AiFixModal from '../components/AiFixModal';"
    );
}

// Add state and effect
const hookRegex = /const \[activeTab, setActiveTab\] = useState\('overview'\);/;
const newHooks = `const [activeTab, setActiveTab] = useState('overview');
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
  }, [scanData]);`;

reportCode = reportCode.replace(hookRegex, newHooks);

// Add modal render
const renderRegex = /<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);\n\}/;
const newRender = `
        </div>
      </div>
      <AiFixModal issue={globalIssue} onClose={() => setGlobalIssue(null)} />
    </div>
  );
}`;
reportCode = reportCode.replace(renderRegex, newRender);

fs.writeFileSync('client/src/pages/Report.jsx', reportCode);
console.log("Report.jsx patched for global modal.");
