import re

with open('client/src/pages/Report.jsx', 'r') as f:
    content = f.read()

# Replace the score
content = content.replace(
    "${scanData.aiReport?.overallScore ? (scanData.aiReport.overallScore / 100) * 180 - 90 : -20}",
    "${score ? (score / 100) * 180 - 90 : -20}"
)

content = content.replace(
    "${scanData.aiReport?.overallScore || '69'}",
    "${score}"
)

content = content.replace(
    "${scanData.aiReport?.riskLevel === 'HIGH' || scanData.aiReport?.riskLevel === 'CRITICAL' ? '#ef4444' : scanData.aiReport?.riskLevel === 'LOW' ? '#22c55e' : '#eab308'}",
    "${riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? '#ef4444' : riskLevel === 'LOW' ? '#22c55e' : '#eab308'}"
)

content = content.replace(
    "${scanData.aiReport?.riskLevel || 'MEDIUM'}",
    "${riskLevel}"
)

with open('client/src/pages/Report.jsx', 'w') as f:
    f.write(content)
