import re

with open('client/src/pages/HistoryPage.jsx', 'r') as f:
    content = f.read()

# find calculateScore function
start_str = "  const calculateScore = (scan) => {"
end_str = "  };"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

new_func = """  const calculateScore = (scan) => {
    let critical = 0, high = 0, medium = 0, low = 0;
    
    if (scan.rawResults?.headers?.missing) {
      scan.rawResults.headers.missing.forEach(h => {
        medium++;
      });
    }
    
    if (scan.rawResults?.cves?.length > 0) {
      scan.rawResults.cves.forEach(techGroup => {
        if (techGroup.vulnerabilities) {
          techGroup.vulnerabilities.forEach(vuln => {
            const s = (vuln.severity || 'MEDIUM').toUpperCase();
            if (s === 'CRITICAL') critical++;
            else if (s === 'HIGH') high++;
            else if (s === 'MEDIUM') medium++;
            else low++;
          });
        }
      });
    }
    
    if (scan.rawResults?.nuclei?.length > 0) {
      scan.rawResults.nuclei.forEach(finding => {
        const s = (finding.severity || 'LOW').toUpperCase();
        if (s === 'CRITICAL') critical++;
        else if (s === 'HIGH') high++;
        else if (s === 'MEDIUM') medium++;
        else low++;
      });
    }
    
    if (scan.rawResults?.ssl) {
      const daysLeft = scan.rawResults.ssl.daysRemaining;
      if (daysLeft <= 0 || !scan.rawResults.ssl.valid) {
        critical++;
      }
    }
    
    const score = Math.max(0, 100 - (critical * 25 + high * 15 + medium * 5 + low * 2));
    
    return { 
      score, 
      issues: { high: critical + high, medium: medium + low },
      riskLevel: score > 80 ? 'LOW' : score > 50 ? 'MEDIUM' : 'HIGH'
    };
  };"""

content = content[:start_idx] + new_func + content[end_idx:]

with open('client/src/pages/HistoryPage.jsx', 'w') as f:
    f.write(content)
