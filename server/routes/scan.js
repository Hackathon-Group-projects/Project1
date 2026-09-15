// server/routes/scan.js
// At the top, import the new CVE service
const { lookupCvesForTechStack } = require('../services/cveService');
const Scan = require('../models/Scan');
const express = require('express');
const scanRouter = express.Router();
const { checkTechStack } = require('../services/techService');

// Import our custom security scanning services
const { checkSSL } = require('../services/sslService');
const { checkHeaders } = require('../services/headerService');

// Handle POST requests sent to /api/scan from the frontend (matches shared team schema)
scanRouter.post('/', async (request, response) => {
  
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

    // Run the Wappalyzer scanner to detect frameworks, CMS, and servers
    const techScannerOutput = await checkTechStack(targetWebsiteUrl);

    // Use the tech list from Wappalyzer to look up known CVEs from OSV.dev
    const cveScannerOutput = await lookupCvesForTechStack(techScannerOutput);

    // Group all scanner outputs — key names match the shared team schema exactly
    const combinedScanResults = {
      ssl: sslScannerOutput,
      headers: headerScannerOutput,
      tech: techScannerOutput,   // ← 'tech' matches shared schema (not 'techStack')
      cves: cveScannerOutput
    };

    // Inside try block, save the result to the database
    const newScanRecord = new Scan({
      targetUrl: targetWebsiteUrl,
      targetHostname: new URL(targetWebsiteUrl).hostname,
      status: 'completed',
      rawResults: combinedScanResults
    });
    await newScanRecord.save(); // Persist to MongoDB

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