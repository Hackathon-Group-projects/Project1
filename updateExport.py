import sys
import re

with open('client/src/pages/Report.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_handle_export_pdf = """  const handleExportPdf = () => {
    if (!scanData) return;
    
    // Generate clean HTML for the PDF
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6;">
        <h1 style="color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
          Secura Audit Report
        </h1>
        
        <div style="margin-bottom: 30px;">
          <p style="margin: 5px 0;"><strong>Target URL:</strong> ${scanData.targetUrl}</p>
          <p style="margin: 5px 0;"><strong>Hostname:</strong> ${scanData.targetHostname}</p>
          <p style="margin: 5px 0;"><strong>Scan Date:</strong> ${new Date(scanData.scannedAt).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Risk Level:</strong> ${scanData.aiReport?.riskLevel || 'UNKNOWN'}</p>
          <p style="margin: 5px 0;"><strong>Overall Score:</strong> ${scanData.aiReport?.overallScore || score}/100</p>
        </div>

        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Executive Summary</h2>
        <p style="font-size: 14px;">${scanData.aiReport?.executiveSummary || 'No summary available.'}</p>

        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Identified Vulnerabilities</h2>
        ${scanData.aiReport?.vulnerabilities && scanData.aiReport.vulnerabilities.length > 0 ? 
          `<ul style="font-size: 14px;">
            ${scanData.aiReport.vulnerabilities.map(v => 
              `<li style="margin-bottom: 15px;">
                 <strong>[${v.severity}] ${v.title}</strong><br/>
                 <em>Impact:</em> ${v.impact}<br/>
                 <em>Remediation:</em> ${v.remediation}
               </li>`
            ).join('')}
          </ul>` : '<p>No critical vulnerabilities detected.</p>'
        }
        
        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">SSL / TLS</h2>
        <p style="font-size: 14px;">
          Valid: ${scanData.rawResults?.ssl?.valid ? 'Yes' : 'No'}<br/>
          Days Remaining: ${scanData.rawResults?.ssl?.daysRemaining || 'N/A'}
        </p>
        
        <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
          Generated automatically by Secura AI Engine
        </div>
      </div>
    `;

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opt = {
      margin: 0.5,
      filename: \`secura_report_${scanData.targetHostname || 'target'}.pdf\`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(container).save();
  };
"""

content = re.sub(
    r"  const handleExportPdf = \(\) => \{[\s\S]*?html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\);\n  \};",
    new_handle_export_pdf.strip(),
    content
)

with open('client/src/pages/Report.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Report.jsx updated with clean HTML export!")
