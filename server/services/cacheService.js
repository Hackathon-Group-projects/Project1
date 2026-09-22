const Scan = require('../models/Scan');

/**
 * Checks if a scan for a given URL already exists within the last 24 hours.
 * @param {string} targetUrl URL to check cache for
 * @returns {object|null} The cached scan object or null
 */
async function checkCache(targetUrl) {
    try {
        const targetHostname = new URL(targetUrl).hostname;

        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const cutoffTime = new Date(Date.now() - ONE_DAY_MS);

        // Look for a successful scan of the same hostname within the last 24h
        const cachedScan = await Scan.findOne({
            targetHostname: targetHostname,
            scannedAt: { $gte: cutoffTime },
            status: 'completed'
        }).sort({ scannedAt: -1 });

        return cachedScan || null;
    } catch (error) {
        console.error('Error during cache check:', error.message);
        return null;
    }
}

module.exports = {
    checkCache
};
