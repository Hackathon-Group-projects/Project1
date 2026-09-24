import sys

with open('client/src/pages/Report.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import html2pdf from 'html2pdf.js'
content = content.replace(
    "import { FiGlobe, FiShield, FiFileText, FiRefreshCw, FiRotateCw } from 'react-icons/fi';",
    "import { FiGlobe, FiShield, FiFileText, FiRefreshCw, FiRotateCw } from 'react-icons/fi';\nimport html2pdf from 'html2pdf.js';"
)

# 2. Add handleExportPdf
func_definition = """  };

  const handleExportPdf = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    const opt = {
      margin: 0.3,
      filename: `secura_report_${scanData.targetHostname || 'target'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {"""

content = content.replace(
    "  };\n\n  if (loading) {",
    func_definition
)

# 3. Add id="report-content" to main tag
content = content.replace(
    "<main className=\"flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6\">",
    "<main id=\"report-content\" className=\"flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6\">"
)

# 4. Add onClick to Export PDF button
content = content.replace(
    """<button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-zinc-700 hover:bg-slate-50 transition-colors">
                <FiFileText className="text-[13px]" />
                <span>Export PDF</span>
              </button>""",
    """<button onClick={handleExportPdf} className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-zinc-700 hover:bg-slate-50 transition-colors">
                <FiFileText className="text-[13px]" />
                <span>Export PDF</span>
              </button>"""
)

with open('client/src/pages/Report.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Report.jsx updated!")
