const fs = require('fs');

// 1. Patch AiFixTab.jsx to listen to the new event
let aiFix = fs.readFileSync('client/src/report/AiFixTab.jsx', 'utf8');

const useEffectCode = `  const [selectedIssue, setSelectedIssue] = useState(null);
  const [chatInput, setChatInput] = useState('');

  React.useEffect(() => {
    const handleOpenModal = (e) => {
      if (e.detail && e.detail.keyword) {
        const keyword = e.detail.keyword.toLowerCase();
        // Find best match in AI generated issues
        const issuesToSearch = data?.aiReport?.vulnerabilities || [];
        const matched = issuesToSearch.find(issue => 
          (issue.title && issue.title.toLowerCase().includes(keyword)) ||
          (issue.description && issue.description.toLowerCase().includes(keyword))
        );
        if (matched) {
          setSelectedIssue(matched);
        } else if (issuesToSearch.length > 0) {
          // Fallback: If AI named it weirdly and we can't strict match, just open the first one for UX
          setSelectedIssue(issuesToSearch[0]);
        }
      }
    };
    window.addEventListener('open-ai-modal', handleOpenModal);
    return () => window.removeEventListener('open-ai-modal', handleOpenModal);
  }, [data]);`;

aiFix = aiFix.replace(/const \[selectedIssue, setSelectedIssue\] = useState\(null\);\n\s*const \[chatInput, setChatInput\] = useState\(''\);/, useEffectCode);
fs.writeFileSync('client/src/report/AiFixTab.jsx', aiFix);

// 2. Patch HeadersTab.jsx
let headers = fs.readFileSync('client/src/report/HeadersTab.jsx', 'utf8');
headers = headers.replace(/window\.dispatchEvent\(new CustomEvent\('open-secura-chat'[\s\S]*?\}\)\);/g, "window.dispatchEvent(new CustomEvent('open-ai-modal', {\n                          detail: { keyword: h.header }\n                        }));");
fs.writeFileSync('client/src/report/HeadersTab.jsx', headers);

// 3. Patch CvesTab.jsx
let cves = fs.readFileSync('client/src/report/CvesTab.jsx', 'utf8');
cves = cves.replace(/window\.dispatchEvent\(new CustomEvent\('open-secura-chat'[\s\S]*?\}\)\);/g, "window.dispatchEvent(new CustomEvent('open-ai-modal', {\n                        detail: { keyword: cve.id }\n                      }));");
fs.writeFileSync('client/src/report/CvesTab.jsx', cves);

// 4. Patch NucleiTab.jsx
let nuclei = fs.readFileSync('client/src/report/NucleiTab.jsx', 'utf8');
nuclei = nuclei.replace(/window\.dispatchEvent\(new CustomEvent\('open-secura-chat'[\s\S]*?\}\)\);/g, "window.dispatchEvent(new CustomEvent('open-ai-modal', {\n                        detail: { keyword: finding.name || finding.type }\n                      }));");
fs.writeFileSync('client/src/report/NucleiTab.jsx', nuclei);

console.log("Patched all tabs to open modal instead of chat.");
