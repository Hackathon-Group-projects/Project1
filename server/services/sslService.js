// server/services/sslService.js
const sslChecker = require('ssl-checker');

async function checkSSL(hostname) {
  try {
    // ssl-checker expects a pure hostname (e.g., "example.com" without "https://")
    const cleanHostname = new URL(hostname).hostname;

    //Add custom grading logic
    const result = await sslChecker(cleanHostname, { method: 'GET', port: 443 });
    
    return {
      valid: result.valid,
      validFrom: result.validFrom,
      validTo: result.validTo,
      daysRemaining: result.daysRemaining,
      grade: calculateSSLGrade(result),
      issuer: "Detected from cert" // ssl-checker might not return issuer directly without native TLS, but you can leave this placeholder or parse it later
    };
  } catch (error) {
    console.error('SSL Check failed:', error.message);
    return { valid: false, grade: 'F', daysRemaining: 0, error: 'Could not resolve SSL' };
  }
}

function calculateSSLGrade(ssl) {
  if (!ssl.valid) return 'F';
  if (ssl.daysRemaining < 30) return 'C';
  if (ssl.daysRemaining < 90) return 'B';
  return 'A+';
}

module.exports = { checkSSL };