const express = require('express');
const scanRouter = express.Router();
const Scan = require('../models/Scan');

const { checkSSL } = require('../services/sslService');
const { checkHeaders } = require('../services/headerService');
const { checkTechStack } = require('../services/techService');
const { lookupCvesForTechStack } = require('../services/cveService');
const { runNucleiScan } = require('../services/nucleiService');
const { validateAndCleanUrl } = require('../utils/validator');
const { generateAiReport } = require('../services/aiService');
const { checkCache } = require('../services/cacheService');
const jwt = require('jsonwebtoken');

const EventEmitter = require('events');
class ScanEmitter extends EventEmitter { }
const scanEmitter = new ScanEmitter();
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');

// Initiates the scan sequence and immediately returns a queue ID
scanRouter.post('/start', async (req, res) => {
  const { url, userId, userEmail } = req.body; 

  let actualUserId = userId || null;
  if (!actualUserId && userEmail) {
    const User = require('../models/User');
    const user = await User.findOne({ email: userEmail });
    if (user) {
      actualUserId = user._id;
    }
  }

  // URL with proper validation
  const { isValid, cleanedUrl, error } = validateAndCleanUrl(url);
  if (!isValid) return res.status(400).json({ error: error });

  const targetUrl = cleanedUrl; // Use the cleaned, validated URL

  try {
    const targetHostname = new URL(targetUrl).hostname;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL provided.' });
  }

  const scanId = uuidv4();

  res.status(200).json({
    scanId: scanId,
    status: 'queued',
    message: 'Scan initialized successfully'
  });

  // Run the sequence in the background, passing userId to bind to account
  runScanSequenceSSE(scanId, targetUrl, actualUserId).catch(err => {
    console.error(`Background scan error for ${scanId}:`, err);
  });
});

// GET /api/scan/cache-check
// Endpoint to verify if a site was already scanned in the last 24h
scanRouter.get('/cache-check', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query parameter is required.' });

  const cachedScan = await checkCache(url);

  if (cachedScan) {
    return res.status(200).json({
      cached: true,
      scanId: cachedScan.scanId
    });
  }

  return res.status(200).json({
    cached: false,
    scanId: null
  });
});

// SSE Endpoint. Frontend subscribes to this to receive live log updates.

scanRouter.get('/progress', (req, res) => {
  const { scanId } = req.query;
  if (!scanId) return res.status(400).json({ error: 'scanId query parameter is required.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const progressListener = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);

    if (data.type === 'done' || data.type === 'error') {
      res.end();
      scanEmitter.removeListener(scanId, progressListener);
    }
  };

  scanEmitter.on(scanId, progressListener);

  req.on('close', () => {
    scanEmitter.removeListener(scanId, progressListener);
  });
});

async function runScanSequenceSSE(scanId, targetWebsiteUrl, userId = null) {
  try {
    scanEmitter.emit(scanId, { type: 'progress', step: 'Initializing', progress: 10, log: 'Starting parallel engines...', scanId });
    // 1. Start independent scanners simultaneously (Parallel Execution)
    const sslPromise = checkSSL(targetWebsiteUrl).then(res => {
      scanEmitter.emit(scanId, { type: 'progress', step: 'SSL', progress: 30, log: 'SSL analysis complete', scanId });
      return res;
    });
    const headersPromise = checkHeaders(targetWebsiteUrl).then(res => {
      scanEmitter.emit(scanId, { type: 'progress', step: 'Headers', progress: 50, log: 'Header analysis complete', scanId });
      return res;
    });
    const nucleiPromise = runNucleiScan(targetWebsiteUrl).then(res => {
      scanEmitter.emit(scanId, { type: 'progress', step: 'Nuclei', progress: 70, log: 'Vulnerability scan complete', scanId });
      return res;
    });
    // 2. Tech and CVE are linked (CVE needs Tech output first), so we chain them
    const techAndCvePromise = checkTechStack(targetWebsiteUrl).then(async (techResult) => {
      const cveResult = await lookupCvesForTechStack(techResult);
      scanEmitter.emit(scanId, { type: 'progress', step: 'Tech & CVE', progress: 90, log: 'Tech stack & CVE lookup complete', scanId });
      return { tech: techResult, cves: cveResult };
    });
    // 3. WAIT FOR ALL SCANNERS TO FINISH AT THE SAME TIME 🚀
    const [sslScannerOutput, headerScannerOutput, nucleiScannerOutput, techAndCveOutput] = await Promise.all([
      sslPromise,
      headersPromise,
      nucleiPromise,
      techAndCvePromise
    ]);
    // 4. Combine results
    const combinedScanResults = {
      ssl: sslScannerOutput,
      headers: headerScannerOutput,
      tech: techAndCveOutput.tech,
      cves: techAndCveOutput.cves,
      nuclei: nucleiScannerOutput
    };

    // Send to Python AI Service for Analysis!
    scanEmitter.emit(scanId, { type: 'progress', step: 'AI Analysis', progress: 95, log: 'Gemini AI is generating the audit report...', scanId });

    const finalAiReport = await generateAiReport(combinedScanResults);
    scanEmitter.emit(scanId, { type: 'progress', step: 'Finalizing', progress: 98, log: 'Saving results to database...', scanId });
    // Persist final report to MongoDB
    const newScanRecord = new Scan({
      scanId: scanId,
      userId: userId, // Bind the scan to the user's account if authenticated
      targetUrl: targetWebsiteUrl,
      targetHostname: new URL(targetWebsiteUrl).hostname,
      status: 'completed',
      rawResults: combinedScanResults,
      aiReport: finalAiReport  // <-- AI report Database me save ho raha hai
    });

    await newScanRecord.save();
    scanEmitter.emit(scanId, { type: 'done', scanId: scanId, log: 'Finished.' });
  } catch (error) {
    console.error(`Scan failed for ${scanId}:`, error);
    scanEmitter.emit(scanId, { type: 'error', scanId: scanId, message: error.message || 'Internal Server Error' });
  }
}

// 🛡️ JWT Authorization Middleware
function auth(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-dev');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}

// Delete a scan history record (Protected)
scanRouter.delete('/:id', auth, async (req, res) => {
  try {
    // Only allow deletion if it belongs to the logged-in user
    await Scan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

// GET /api/scan/history
// Returns the last 50 completed scans ONLY for the logged-in user
scanRouter.get('/history', auth, async (req, res) => {
  try {
    // Fetch last 50 scans from MongoDB tied to the authenticated user ID
    // .select() avoids sending heavy rawResults in the list view
    const recentScans = await Scan.find({ status: 'completed', userId: req.user.id })
      .sort({ scannedAt: -1 })       // Newest scan first
      .limit(50)                      // Limit to last 50 scans
      .select('scanId targetUrl targetHostname status scannedAt rawResults.ssl rawResults.headers rawResults.cves'); // Exclude heavy nuclei data
    res.status(200).json(recentScans);
  } catch (error) {
    console.error('Failed to fetch scan history:', error.message);
    res.status(500).json({ error: 'Could not retrieve scan history.' });
  }
});


// GET /api/scan/result/:scanId
// Returns the full detailed result of one specific scan
scanRouter.get('/result/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    // Find the scan in MongoDB using the scanId from the URL
    const scanRecord = await Scan.findOne({ scanId: scanId });
    if (!scanRecord) {
      return res.status(404).json({ error: 'Scan not found. It may have expired or never existed.' });
    }
    res.status(200).json(scanRecord);
  } catch (error) {
    console.error('Failed to fetch scan result:', error.message);
    res.status(500).json({ error: 'Could not retrieve scan result.' });
  }
});

module.exports = scanRouter;