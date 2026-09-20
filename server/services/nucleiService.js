// server/services/nucleiService.js
const { exec } = require('child_process');
const { promisify } = require('util');

// Promisify 'exec' so we can use async/await
const executeTerminalCommand = promisify(exec);

async function runNucleiScan(targetUrl) {
  // CRITICAL: Sirf safe, passive templates use kar rahe hain (no active attacking)
  const safeTemplates = [
    'misconfiguration', // Checks for bad server configs
    'exposures'         // Checks for leaked sensitive files (e.g., .env)
  ];

  const templateFlags = safeTemplates.map(t => `-tags ${t}`).join(' ');

  try {
    // Construct command: nuclei -u https://example.com -t misconfiguration -t exposures -json -silent
    // Adding -rl 10 and -c 5 to keep the scan polite and avoid IP bans
    const commandToRun = `nuclei -u ${targetUrl} ${templateFlags} -rl 10 -c 5 -jsonl -silent`;
    
    // Execute command with a 30-second hard timeout
    const { stdout } = await executeTerminalCommand(commandToRun, { timeout: 30000 });
    
    if (!stdout.trim()) {
      return []; // Koi issue nahi mila
    }

    // Nuclei prints one JSON object per line, hum unhe split aur parse kar rahe hain
    //NAYA CODE (non-JSON lines ko silently skip karo):
    const rawFindings = stdout
    .trim()
    .split('\n')
    .filter(line => line !== '')
    .reduce((validFindings, line) => {
        try {
        // Try to parse this line as JSON
        validFindings.push(JSON.parse(line));
        } catch (parseError) {
        // If this line is not valid JSON (e.g., a Nuclei info message), just skip it
        console.warn('Skipping non-JSON Nuclei output line:', line.substring(0, 50));
        }
        return validFindings;
    }, []);
      
    // Humare MongoDB schema ke hisaab se data ko format kar rahe hain
    const formattedFindings = rawFindings.map(finding => ({
      templateId: finding.templateID || 'unknown',
      name: finding.info?.name || 'Unknown Issue',
      severity: finding.info?.severity?.toUpperCase() || 'INFO',
      description: finding.info?.description || 'No description available',
      matched: finding.matched || finding['matched-at'] || ''
    }));
    
    //Remove duplicate findings based on templateId
    const uniqueFindingsMap = new Map();
    
    formattedFindings.forEach(finding => {
      // Agar ye vulnerability pehle nahi mili hai, tabhi map mein dalo
      if (!uniqueFindingsMap.has(finding.templateId)) {
        uniqueFindingsMap.set(finding.templateId, finding);
      }
    });
    // Convert map back to array
    const deduplicatedFindings = Array.from(uniqueFindingsMap.values());
    
    return deduplicatedFindings;

  } catch (error) {
    console.error('Nuclei scan failed or timed out:', error.message);
    return []; // Agar error aaye toh array khali return karo taaki server crash na ho
  }
}

module.exports = { runNucleiScan };