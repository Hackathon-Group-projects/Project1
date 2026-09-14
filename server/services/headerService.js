// server/services/headerService.js
const fetch = require('node-fetch');

// A checklist of important security headers we want to look for, mapped to their risk level if missing
const SECURITY_HEADERS_TO_CHECK = {
  'content-security-policy': 'CRITICAL',
  'strict-transport-security': 'HIGH',
  'x-frame-options': 'HIGH',
  'x-content-type-options': 'MEDIUM',
  'referrer-policy': 'MEDIUM'
};

async function checkHeaders(websiteUrl) {
  try {
    // Send a lightweight "HEAD" request just to get the headers without downloading the whole website body
    const websiteResponse = await fetch(websiteUrl, { method: 'HEAD', redirect: 'follow', timeout: 5000 });
    
    // Convert the raw headers from the response into a simple, searchable JavaScript object
    const websiteHeaders = Object.fromEntries(websiteResponse.headers.entries());

    // Create empty arrays to store the results of our scan
    const missingSecurityHeaders = [];
    const foundSecurityHeaders = [];

    // Loop through our checklist one by one
    for (const [headerName, riskSeverity] of Object.entries(SECURITY_HEADERS_TO_CHECK)) {
      
      // Check if the website's headers contain the current header from our checklist
      if (websiteHeaders[headerName]) {
        
        // If the website has it, save it to the 'found' list along with its configuration value
        foundSecurityHeaders.push({ header: headerName, value: websiteHeaders[headerName] });
      
      } else {
        
        // If the website is missing it, save it to the 'missing' list along with how severe the risk is
        missingSecurityHeaders.push({ header: headerName, severity: riskSeverity });
      
      }
    }

    // Return the final categorized lists back to the main scan route
    return { 
      missing: missingSecurityHeaders, 
      present: foundSecurityHeaders 
    };

  } catch (error) {
    // If the website is down or the request fails, log the error and safely return empty arrays
    console.error('Header Check failed for', websiteUrl, ':', error.message);
    return { missing: [], present: [], error: 'Failed to fetch headers' };
  }
}

// Export the function so it can be used in routes/scan.js
module.exports = { checkHeaders };