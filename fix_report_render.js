const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Report.jsx', 'utf8');

// The end of the file looks like:
//       </main>
//     </div>
//   );
// }
code = code.replace(
  /<\/main>\n\s*<\/div>\n\s*\);\n\}/,
  '      </main>\n      <AiFixModal issue={globalIssue} onClose={() => setGlobalIssue(null)} />\n    </div>\n  );\n}'
);

fs.writeFileSync('client/src/pages/Report.jsx', code);
console.log("AiFixModal render added!");
