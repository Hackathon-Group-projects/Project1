// server/services/threatIntelService.js
const fetch = require('node-fetch');

let kevCache = new Set();
let lastKevFetch = 0;
const KEV_CACHE_DURATION = 24 * 60 * 60 * 1000;

async function refreshKevCache() {
  try {
    console.log('[Threat Intel] Fetching latest CISA KEV list...');
    const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
    if (!response.ok) throw new Error(`KEV fetch failed with status: ${response.status}`);
    
    const data = await response.json();
    const newCache = new Set();
    if (data && data.vulnerabilities) {
      data.vulnerabilities.forEach(vuln => {
        if (vuln.cveID) newCache.add(vuln.cveID);
      });
    }
    kevCache = newCache;
    lastKevFetch = Date.now();
    console.log(`[Threat Intel] Successfully cached ${kevCache.size} actively exploited CVEs.`);
  } catch (error) {
    console.error('[Threat Intel] Error fetching CISA KEV list:', error.message);
  }
}

async function isCveInKev(cveId) {
  if (kevCache.size === 0 || (Date.now() - lastKevFetch > KEV_CACHE_DURATION)) {
    await refreshKevCache();
  }
  return kevCache.has(cveId);
}

async function fetchEpssScore(cveId) {
  try {
    const response = await fetch(`https://api.first.org/data/v1/epss?cve=${cveId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`EPSS API failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.data && data.data.length > 0) {
      return parseFloat(data.data[0].epss);
    }
    return null;
  } catch (error) {
    console.error(`[Threat Intel] Error fetching EPSS for ${cveId}:`, error.message);
    return null;
  }
}

module.exports = { isCveInKev, fetchEpssScore, refreshKevCache };
