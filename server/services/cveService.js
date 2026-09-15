// server/services/cveService.js
const fetch = require('node-fetch');

/**
 * For each technology found by Wappalyzer, check the OSV database for known CVEs.
 * OSV.dev is a free, public vulnerability database — no API key needed!
 * @param {Array} detectedTechList - Array of { name, version, categories } objects from techService
 * @returns {Promise<Array>} - Array of technologies that have known vulnerabilities
 */
async function lookupCvesForTechStack(detectedTechList) {

  // Array to store only the technologies that have known vulnerabilities
  const techWithVulnerabilities = [];

  // Loop through each technology one by one
  for (const currentTech of detectedTechList) {

    // Skip if version is missing or a placeholder — OSV needs a real version number to search
    const isVersionUnknown = !currentTech.version || currentTech.version === 'Unknown' || currentTech.version === 'Detected';
    if (isVersionUnknown) continue;

    try {
      // Build the request body in the format OSV.dev expects
      const osvRequestBody = {
        version: currentTech.version,
        package: {
          name: currentTech.name.toLowerCase(), // OSV expects lowercase names
          ecosystem: 'npm'                       // Assume npm for now (can improve later)
        }
      };

      // Send the request to the free OSV vulnerability database
      const osvResponse = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(osvRequestBody)
      });

      // Parse the response from OSV into a JavaScript object
      const osvData = await osvResponse.json();

      // Only add to our list if OSV found actual vulnerabilities
      if (osvData.vulns && osvData.vulns.length > 0) {

        techWithVulnerabilities.push({
          technology: currentTech.name,
          version: currentTech.version,

          // Extract just the important fields from each vulnerability entry
          vulnerabilities: osvData.vulns.map(vuln => ({
            id: vuln.id,                                            // e.g., "CVE-2021-44228"
            summary: vuln.summary || 'No summary available',
            severity: vuln.database_specific?.severity || 'UNKNOWN' // e.g., "HIGH"
          }))
        });
      }

    } catch (lookupError) {
      // If OSV fails for one tech, skip it and keep scanning the others
      console.error(`CVE lookup failed for ${currentTech.name}:`, lookupError.message);
    }
  }

  return techWithVulnerabilities;
}

// Export so scan.js can use it
module.exports = { lookupCvesForTechStack };