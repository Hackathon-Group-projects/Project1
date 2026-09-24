const fs = require('fs');

let reportCode = fs.readFileSync('client/src/pages/Report.jsx', 'utf8');

const oldLogic = `  if (scanData && scanData.rawResults) {
    if (scanData.rawResults.headers && scanData.rawResults.headers.missing) {
      missingHeadersCount = scanData.rawResults.headers.missing.length;
      issues.medium += missingHeadersCount;
      score -= missingHeadersCount * 2;
    }
    if (scanData.rawResults.cves && scanData.rawResults.cves.length) {
      scanData.rawResults.cves.forEach(tech => {
        if (tech.vulnerabilities && tech.vulnerabilities.length) {
          cvesCount += tech.vulnerabilities.length;
          tech.vulnerabilities.forEach(vuln => {
            if (vuln.severity === 'CRITICAL') issues.critical += 1;
            else if (vuln.severity === 'HIGH') issues.high += 1;
            else if (vuln.severity === 'MEDIUM') issues.medium += 1;
            else issues.low += 1;
          });
        }
      });
      score -= cvesCount * 5;
    }
    if (scanData.rawResults.nuclei && scanData.rawResults.nuclei.length) {
       nucleiCount = scanData.rawResults.nuclei.length;
       scanData.rawResults.nuclei.forEach(n => {
         const sev = n.severity ? n.severity.toUpperCase() : 'INFO';
         if (sev === 'CRITICAL') issues.critical += 1;
         else if (sev === 'HIGH') issues.high += 1;
         else if (sev === 'MEDIUM') issues.medium += 1;
         else issues.low += 1;
       });
       score -= nucleiCount * 10;
    }
    if (scanData.rawResults.tech && scanData.rawResults.tech.length > 0) {
      techStackName = scanData.rawResults.tech[0].name;
    }
    if (scanData.rawResults.ssl && scanData.rawResults.ssl.grade) {
      sslGrade = scanData.rawResults.ssl.grade;
    }
  }
  
  score = Math.max(0, score);`;

const newLogic = `  if (scanData && scanData.rawResults) {
    if (scanData.rawResults.headers && scanData.rawResults.headers.missing) {
      missingHeadersCount = scanData.rawResults.headers.missing.length;
      issues.medium += missingHeadersCount;
    }
    if (scanData.rawResults.cves && scanData.rawResults.cves.length) {
      scanData.rawResults.cves.forEach(tech => {
        if (tech.vulnerabilities && tech.vulnerabilities.length) {
          cvesCount += tech.vulnerabilities.length;
          tech.vulnerabilities.forEach(vuln => {
            if (vuln.severity === 'CRITICAL') issues.critical += 1;
            else if (vuln.severity === 'HIGH') issues.high += 1;
            else if (vuln.severity === 'MEDIUM') issues.medium += 1;
            else issues.low += 1;
          });
        }
      });
    }
    if (scanData.rawResults.nuclei && scanData.rawResults.nuclei.length) {
       nucleiCount = scanData.rawResults.nuclei.length;
       scanData.rawResults.nuclei.forEach(n => {
         const sev = n.severity ? n.severity.toUpperCase() : 'LOW';
         if (sev === 'CRITICAL') issues.critical += 1;
         else if (sev === 'HIGH') issues.high += 1;
         else if (sev === 'MEDIUM') issues.medium += 1;
         else issues.low += 1;
       });
    }
    if (scanData.rawResults.ssl) {
       const daysLeft = scanData.rawResults.ssl.daysRemaining;
       if (daysLeft <= 0 || !scanData.rawResults.ssl.valid) {
         issues.critical += 1;
       }
       if (scanData.rawResults.ssl.grade) {
         sslGrade = scanData.rawResults.ssl.grade;
       }
    }
    if (scanData.rawResults.tech && scanData.rawResults.tech.length > 0) {
      techStackName = scanData.rawResults.tech[0].name;
    }
  }
  
  score = Math.max(0, 100 - (issues.critical * 25 + issues.high * 15 + issues.medium * 5 + issues.low * 2));`;

reportCode = reportCode.replace(oldLogic, newLogic);
fs.writeFileSync('client/src/pages/Report.jsx', reportCode);
console.log("Report.jsx score synchronized.");
