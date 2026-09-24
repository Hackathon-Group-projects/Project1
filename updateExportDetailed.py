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
          <p style="margin: 5px 0;"><strong>Overall Score:</strong> ${scanData.aiReport?.overallScore || 'N/A'}/100</p>
        </div>

        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Executive Summary (AI)</h2>
        <p style="font-size: 14px;">${scanData.aiReport?.executiveSummary || 'No summary available.'}</p>

        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">AI Remediation Plan</h2>
        ${scanData.aiReport?.vulnerabilities && scanData.aiReport.vulnerabilities.length > 0 ? 
          `<ul style="font-size: 14px;">
            ${scanData.aiReport.vulnerabilities.map(v => 
              `<li style="margin-bottom: 15px;">
                 <strong>[${v.severity}] ${v.title}</strong><br/>
                 <em>Impact:</em> ${v.impact}<br/>
                 <em>Remediation:</em> ${v.remediation}
               </li>`
            ).join('')}
          </ul>` : '<p style="font-size: 14px;">No critical vulnerabilities required AI remediation.</p>'
        }
        
        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Nuclei Diagnostic Engine</h2>
        ${scanData.rawResults?.nuclei && scanData.rawResults.nuclei.length > 0 ? 
          `<ul style="font-size: 14px;">
            ${scanData.rawResults.nuclei.map(n => 
              `<li style="margin-bottom: 10px;">
                 <strong>[${n.severity ? n.severity.toUpperCase() : 'INFO'}]</strong> ${n.name || n.info?.name || 'Vulnerability'}<br/>
                 <span style="color: #666; font-size: 13px;">${n.description || n.info?.description || ''}</span>
               </li>`
            ).join('')}
          </ul>` : '<p style="font-size: 14px;">No Nuclei issues detected.</p>'
        }

        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">CVE & Tech Stack Analysis</h2>
        ${scanData.rawResults?.cves && scanData.rawResults.cves.length > 0 ? 
          `<div style="font-size: 14px;">
            ${scanData.rawResults.cves.map(tech => 
              `<div style="margin-bottom: 15px;">
                 <strong>${tech.name} ${tech.version ? `(v${tech.version})` : ''}</strong>
                 ${tech.vulnerabilities && tech.vulnerabilities.length > 0 ? 
                   `<ul style="margin-top: 5px;">
                      ${tech.vulnerabilities.map(vuln => 
                        `<li><strong>${vuln.cve}</strong> [${vuln.severity}] - ${vuln.description}</li>`
                      ).join('')}
                    </ul>` : '<p style="margin-top: 5px; color: #666;">No known CVEs for this technology.</p>'
                 }
               </div>`
            ).join('')}
          </div>` : '<p style="font-size: 14px;">No significant tech stack CVEs found.</p>'
        }

        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Security Headers</h2>
        ${scanData.rawResults?.headers?.missing && scanData.rawResults.headers.missing.length > 0 ? 
          `<p style="font-size: 14px;"><strong>Missing Headers:</strong> ${scanData.rawResults.headers.missing.join(', ')}</p>` 
          : '<p style="font-size: 14px;">All required security headers are present.</p>'
        }

        <h2 style="color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">SSL / TLS Configuration</h2>
        <div style="font-size: 14px;">
          <p style="margin: 5px 0;"><strong>Valid Certificate:</strong> ${scanData.rawResults?.ssl?.valid ? 'Yes' : 'No'}</p>
          <p style="margin: 5px 0;"><strong>Days Remaining:</strong> ${scanData.rawResults?.ssl?.daysRemaining || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Grade:</strong> ${scanData.rawResults?.ssl?.grade || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Issuer:</strong> ${scanData.rawResults?.ssl?.issuer || 'N/A'}</p>
        </div>
        
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
      filename: `secura_report_${scanData.targetHostname || 'target'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(container).save();
  };"""

content = re.sub(
    r"  const handleExportPdf = \(\) => \{[\s\S]*?html2pdf\(\)\.set\(opt\)\.from\(container\)\.save\(\);\n  \};",
    new_handle_export_pdf.strip(),
    content
)

# Since I used backticks for string literals inside the script, I need to make sure python didn't escape them improperly.
# I used raw strings? No, I just used regular strings. But they are correct. Wait, the filename line has \` which Python will treat as \` and then regex will output it correctly. But I forgot to escape backticks in filename!

content = content.replace("`secura_report_${scanData.targetHostname || 'target'}.pdf`", "`secura_report_${scanData.targetHostname || 'target'}.pdf`")

with open('client/src/pages/Report.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Report.jsx updated with extensive HTML export!")
