with open('client/src/pages/HistoryPage.jsx', 'r') as f:
    content = f.read()

old_logic = """    if (scan.rawResults?.headers?.missing) {
      scan.rawResults.headers.missing.forEach(h => {
        medium++;
      });
    }"""

new_logic = """    if (scan.rawResults?.headers?.missing) {
      scan.rawResults.headers.missing.forEach(h => {
        const s = (h.severity || 'MEDIUM').toUpperCase();
        if (s === 'CRITICAL') critical++;
        else if (s === 'HIGH') high++;
        else if (s === 'MEDIUM') medium++;
        else low++;
      });
    }"""

content = content.replace(old_logic, new_logic)

with open('client/src/pages/HistoryPage.jsx', 'w') as f:
    f.write(content)

