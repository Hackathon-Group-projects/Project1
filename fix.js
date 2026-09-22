const fs = require('fs');
const files = [
  'client/src/auth/SlidingAuthCard.jsx',
  'client/src/pages/HistoryPage.jsx',
  'client/src/pages/Report.jsx',
  'client/src/pages/ScanningPage.jsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/'http:\/\/:5000(.*?)'/g, '`http://${window.location.hostname}:5000$1`');
  content = content.replace(/`http:\/\/:5000(.*?)`/g, '`http://${window.location.hostname}:5000$1`');
  fs.writeFileSync(file, content);
});
console.log('Fixed URLs');
