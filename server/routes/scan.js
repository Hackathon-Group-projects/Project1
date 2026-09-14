// server/routes/scan.js
const express = require('express');
const scanRouter = express.Router();

// Import our custom security scanning services
const { checkSSL } = require('../services/sslService');
const { checkHeaders } = require('../services/headerService');

// Handle POST requests sent to /api/scan/start from the frontend
scanRouter.post('/start', async (request, response) => {
  
  // Extract the website URL that the user wants to scan from the request body
  const targetWebsiteUrl = request.body.url;

  // Check if the frontend forgot to provide a URL, and stop the process if it is missing
  if (!targetWebsiteUrl) {
    return response.status(400).json({ error: 'Please provide a valid URL to scan.' });
  }

  try {
    // Log the start of the scan to the server console so we can monitor activity
    console.log(`Starting security scan for target: ${targetWebsiteUrl}`);

    // Run the SSL scanner to check the website's certificate validity and security grade
    const sslScannerOutput = await checkSSL(targetWebsiteUrl);
    
    // Run the HTTP headers scanner to check for missing security configurations
    const headerScannerOutput = await checkHeaders(targetWebsiteUrl);

    // Group all the individual scanner outputs into one unified results object
    const combinedScanResults = {
      ssl: sslScannerOutput,
      headers: headerScannerOutput
      // Future scanners (Wappalyzer, Nuclei) will be added here later
    };

    // Send a successful response back to the frontend containing the scanned data
    response.status(200).json({
      message: "Scan completed successfully",
      targetUrl: targetWebsiteUrl,
      rawResults: combinedScanResults
    });

  } catch (scanError) {
    // Log the exact error to the terminal if anything crashes during the scanning process
    console.error('An error occurred during the scan sequence:', scanError);
    
    // Send a safe 500 error back to the frontend so the user interface doesn't freeze
    response.status(500).json({ error: 'An internal server error occurred while scanning the target.' });
  }
});

// Export this router so it can be attached to the main Express application in server.js
module.exports = scanRouter;