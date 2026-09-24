const fs = require('fs');

let code = fs.readFileSync('client/src/report/OverviewTab.jsx', 'utf8');

const oldAgg = `  if (data.rawResults.headers && data.rawResults.headers.missing) {
    data.rawResults.headers.missing.forEach(h => {
      const s = (h.severity || 'MEDIUM').toUpperCase();
      if (s === 'CRITICAL') criticalCount++;
      else if (s === 'HIGH') highCount++;
      else if (s === 'MEDIUM') mediumCount++;
      else lowCount++;
    });
  }

  if (data.rawResults.cves && data.rawResults.cves.length > 0) {
    data.rawResults.cves.forEach(cve => {
      const cvss = cve.cvssScore || 0;
      if (cvss >= 9.0) criticalCount++;
      else if (cvss >= 7.0) highCount++;
      else if (cvss >= 4.0) mediumCount++;
      else lowCount++;
    });
  }`;

const newAgg = `  // 1. Headers
  if (data.rawResults?.headers?.missing) {
    data.rawResults.headers.missing.forEach(h => {
      const s = (h.severity || 'MEDIUM').toUpperCase();
      if (s === 'CRITICAL') criticalCount++;
      else if (s === 'HIGH') highCount++;
      else if (s === 'MEDIUM') mediumCount++;
      else lowCount++;
    });
  }

  // 2. CVEs
  if (data.rawResults?.cves?.length > 0) {
    data.rawResults.cves.forEach(cve => {
      const cvss = cve.cvssScore || 0;
      if (cvss >= 9.0) criticalCount++;
      else if (cvss >= 7.0) highCount++;
      else if (cvss >= 4.0) mediumCount++;
      else lowCount++;
    });
  }

  // 3. Nuclei
  if (data.rawResults?.nuclei?.length > 0) {
    data.rawResults.nuclei.forEach(finding => {
      const s = (finding.severity || 'low').toLowerCase();
      if (s === 'critical') criticalCount++;
      else if (s === 'high') highCount++;
      else if (s === 'medium') mediumCount++;
      else lowCount++;
    });
  }

  // 4. SSL (Expired = Critical)
  if (data.rawResults?.ssl) {
    const validTo = new Date(data.rawResults.ssl.valid_to || Date.now() + 86400000 * 30);
    const now = new Date();
    if (validTo <= now) {
      criticalCount++;
    }
  }`;

code = code.replace(oldAgg, newAgg);
fs.writeFileSync('client/src/report/OverviewTab.jsx', code);
