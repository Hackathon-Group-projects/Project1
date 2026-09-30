import re

with open('client/src/pages/Report.jsx', 'r') as f:
    content = f.read()

# Replace missing headers counting in Report.jsx
old_header_logic = """    if (scanData.rawResults.headers && scanData.rawResults.headers.missing) {
      missingHeadersCount = scanData.rawResults.headers.missing.length;
      issues.medium += missingHeadersCount;
    }"""

new_header_logic = """    if (scanData.rawResults.headers && scanData.rawResults.headers.missing) {
      missingHeadersCount = scanData.rawResults.headers.missing.length;
      scanData.rawResults.headers.missing.forEach(h => {
        const s = (h.severity || 'MEDIUM').toUpperCase();
        if (s === 'CRITICAL') issues.critical += 1;
        else if (s === 'HIGH') issues.high += 1;
        else if (s === 'MEDIUM') issues.medium += 1;
        else issues.low += 1;
      });
    }"""

content = content.replace(old_header_logic, new_header_logic)

with open('client/src/pages/Report.jsx', 'w') as f:
    f.write(content)

