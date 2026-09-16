// server/services/cveService.js
const fetch = require('node-fetch');

// Map technologies to their correct package ecosystems for OSV database
// OSV needs to know WHERE to look (e.g., npm for React, Packagist for PHP stuff)
const ECOSYSTEM_MAP = {
  'React': 'npm',
  'Vue.js': 'npm',
  'Angular': 'npm',
  'Next.js': 'npm',
  'jQuery': 'npm',
  'WordPress': 'Packagist', // Many WP vulnerabilities are tracked via PHP ecosystem
  'Bootstrap': 'npm',
  'Tailwind CSS': 'npm',
  // Note: System-level software like Nginx/Apache are sometimes harder to find in OSV without exact C/C++ Git commits, 
  // but we can try generic mapping or leave ecosystem blank if the API supports it.
};

/**
 * Check the OSV.dev database for known vulnerabilities (CVEs) for the detected technologies.
 * @param {Array} detectedTechList - List of { name, version, categories } from techService
 * @returns {Promise<Array>} - Array of found vulnerabilities
 */
async function lookupCvesForTechStack(detectedTechList) {
  
  // Create an empty array to store the final vulnerability reports
  const techWithVulnerabilities = [];

  // Loop through every single technology we detected
  for (const currentTech of detectedTechList) {

    // 1. Skip if we couldn't find a real version number
    // OSV database cannot search for vulnerabilities without knowing the exact version!
    if (!currentTech.version || currentTech.version === 'Unknown' || currentTech.version === 'Detected') {
      continue;
    }

    try {
      // 2. Find the right ecosystem (default to npm if we aren't sure)
      const mappedEcosystem = ECOSYSTEM_MAP[currentTech.name] || 'npm';

      // 3. Build the request body exactly how the OSV API wants it
      const osvRequestBody = {
        version: currentTech.version,
        package: {
          name: currentTech.name.toLowerCase(), // OSV prefers lowercase package names
          ecosystem: mappedEcosystem
        }
      };

      // 4. Send the search query to OSV.dev
      const osvResponse = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(osvRequestBody)
      });

      // Parse the JSON response
      const osvData = await osvResponse.json();

      // 5. If vulnerabilities ('vulns') were found, process and save them
      if (osvData.vulns && osvData.vulns.length > 0) {
        
        techWithVulnerabilities.push({
          technology: currentTech.name,
          version: currentTech.version,
          
           // Extract just the important fields from each vulnerability entry
          vulnerabilities: osvData.vulns.map(vuln => {
            
            // OSV sometimes hides severity deep inside the object, let's extract it safely
            let detectedSeverity = 'MEDIUM'; // Default to medium if we can't find it
            
            if (vuln.database_specific && vuln.database_specific.severity) {
              detectedSeverity = vuln.database_specific.severity.toUpperCase();
            } else if (vuln.severity && vuln.severity.length > 0) {
              // Sometimes it's stored as a CVSS score array
              detectedSeverity = vuln.severity[0].type || 'MEDIUM'; 
            }
            return {
              id: vuln.id, // e.g., "CVE-2021-44228"
              summary: vuln.summary || vuln.details?.substring(0, 100) + '...' || 'No summary available',
              severity: detectedSeverity
            };
          })
        });
      }

    } catch (lookupError) {
      // If the API crashes for one tech, just log it and move to the next one
      console.error(`CVE lookup failed for ${currentTech.name}:`, lookupError.message);
    }
  }

  // Return the final list back to scan.js
  return techWithVulnerabilities;
}

module.exports = { lookupCvesForTechStack };  