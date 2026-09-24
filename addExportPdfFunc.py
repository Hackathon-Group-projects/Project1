import sys

with open('client/src/pages/Report.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

func_definition = """  }, [id, navigate, userEmail]);

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
    "  }, [id, navigate, userEmail]);\n\n  if (loading) {",
    func_definition
)

with open('client/src/pages/Report.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Report.jsx updated for function!")
