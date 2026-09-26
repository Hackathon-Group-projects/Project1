// server/services/aiService.js
const fetch = require('node-fetch');

async function generateAiReport(rawScanData) {
  try {
    const PYTHON_SERVICE_URL = 'http://localhost:8000/analyze';

    // 1. PYTHON KO USKI PASAND KA FORMAT BHEJO (Match Python's ScanInput schema)
    const pythonFriendlyPayload = {
      id: "scan_123",
      timestamp: new Date().toISOString(),
      source: "web_scanner",
      type: "scan",
      data: {
        content: JSON.stringify(rawScanData), 
        mimeType: "application/json",
        fileType: "JSON"
      },
      metadata: { userId: "system" },
      result: { 
        extractedText: "Scan results attached in data.content", 
        entities: [] 
      },
      status: "completed"
    };

    const response = await fetch(PYTHON_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pythonFriendlyPayload)
    });

    if (!response.ok) {
      throw new Error(`Python AI service returned status: ${response.status}`);
    }

    const aiReport = await response.json();
    
    // 2. PYTHON KE RESPONSE KO MONGOOSE KE FORMAT MEIN BADLO
    return {
      overallScore: aiReport.summary ? aiReport.summary.riskScore : 50,
      
      // Convert Python's "Grade (A,B,C,D,F)" to Mongoose's "CRITICAL, HIGH..."
      riskLevel: aiReport.grade === 'F' ? 'CRITICAL' : 
                 aiReport.grade === 'D' ? 'HIGH' : 
                 aiReport.grade === 'C' ? 'MEDIUM' : 
                 aiReport.grade === 'B' ? 'LOW' : 'SAFE',
                 
      executiveSummary: aiReport.findings ? 
        aiReport.findings.map(f => f.description).join(' ') : 'No summary provided by AI.',
      positives: [], // Currently not sent by Python schema
      vulnerabilities: aiReport.recommendations ? aiReport.recommendations.map(r => ({
        id: r.id,
        title: r.title,
        category: 'AI Recommendation',
        severity: 'MEDIUM',
        description: r.description
      })) : [],
      corrections: aiReport.corrections || []
    };

  } catch (error) {
    console.error('Failed to generate AI report:', error.message);
    
    // 3. SAFE FALLBACK (No 'UNKNOWN' which crashes Mongoose)
    return {
      overallScore: 0,
      riskLevel: 'SAFE', // Changed from UNKNOWN to a valid enum
      executiveSummary: 'AI analysis failed. The AI microservice might be offline or returned invalid data.',
      positives: [],
      vulnerabilities: []
    };
  }
}

module.exports = { generateAiReport };