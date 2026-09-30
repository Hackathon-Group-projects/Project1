import re

# 1. Fix Report.jsx
with open('client/src/pages/Report.jsx', 'r') as f:
    report_content = f.read()

# Replace the CVE severity logic
old_cve_logic = """          tech.vulnerabilities.forEach(vuln => {
            if (vuln.severity === 'CRITICAL') issues.critical += 1;
            else if (vuln.severity === 'HIGH') issues.high += 1;
            else if (vuln.severity === 'MEDIUM') issues.medium += 1;
            else issues.low += 1;
          });"""

new_cve_logic = """          tech.vulnerabilities.forEach(vuln => {
            const sev = (vuln.severity || 'MEDIUM').toUpperCase();
            if (sev === 'CRITICAL') issues.critical += 1;
            else if (sev === 'HIGH') issues.high += 1;
            else if (sev === 'MEDIUM') issues.medium += 1;
            else issues.low += 1;
          });"""

report_content = report_content.replace(old_cve_logic, new_cve_logic)

with open('client/src/pages/Report.jsx', 'w') as f:
    f.write(report_content)


# 2. Fix HistoryPage.jsx
with open('client/src/pages/HistoryPage.jsx', 'r') as f:
    history_content = f.read()

# Replace calculateScore function completely
old_calc_score = """  const calculateScore = (scan) => {
    let score = 100;
    
    // Simple penalty logic for History view preview
    if (scan.rawResults && scan.rawResults.headers && scan.rawResults.headers.missing) {
      score -= scan.rawResults.headers.missing.length * 2;
    }
    
    if (scan.rawResults && scan.rawResults.cves) {
      let cvesCount = 0;
      scan.rawResults.cves.forEach(t => {
        if (t.vulnerabilities) cvesCount += t.vulnerabilities.length;
      });
      score -= cvesCount * 5;
    }

    if (scan.rawResults && scan.rawResults.nuclei) {
       score -= scan.rawResults.nuclei.length * 10;
    }

    return { 
      score: Math.max(0, score), 
      issues: { high: 0, medium: 0 }, // Simplified for history
      riskLevel: score > 80 ? 'LOW' : score > 50 ? 'MEDIUM' : 'HIGH'
    };
  };"""

new_calc_score = """  const calculateScore = (scan) => {
    let critical = 0, high = 0, medium = 0, low = 0;
    
    if (scan.rawResults?.headers?.missing) {
      scan.rawResults.headers.missing.forEach(h => {
        const s = (h.severity || 'MEDIUM').toUpperCase();
        if (s === 'CRITICAL') critical++;
        else if (s === 'HIGH') high++;
        else if (s === 'MEDIUM') medium++;
        else low++;
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

history_content = history_content.replace(old_calc_score, new_calc_score)

with open('client/src/pages/HistoryPage.jsx', 'w') as f:
    f.write(history_content)

print("Scores unified!")
