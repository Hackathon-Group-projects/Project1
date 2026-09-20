const express = require('express');
const scanRouter = express.Router();
const Scan = require('../models/Scan');

// Import core security scanning services
const { checkSSL } = require('../services/sslService');
const { checkHeaders } = require('../services/headerService');
const { checkTechStack } = require('../services/techService');
const { lookupCvesForTechStack } = require('../services/cveService');
const { runNucleiScan } = require('../services/nucleiService');
const { validateAndCleanUrl } = require('../utils/validator');

// Setup event emitter for SSE background progress streaming
const EventEmitter = require('events');
class ScanEmitter extends EventEmitter { }
const scanEmitter = new ScanEmitter();
const { v4: uuidv4 } = require('uuid');

// Initiates the scan sequence and immediately returns a queue ID
scanRouter.post('/start', async (req, res) => {

  // URL with proper validation
  const { isValid, cleanedUrl, error } = validateAndCleanUrl(req.body.url);
  if (!isValid) return res.status(400).json({ error: error });

  const targetUrl = cleanedUrl; // Use the cleaned, validated URL

  const scanId = uuidv4();

  res.status(200).json({
    scanId: scanId,
    status: 'queued',
    message: 'Scan initialized successfully'
  });

  // Run the sequence in the background
  runScanSequenceSSE(scanId, targetUrl).catch(err => {
    console.error(`Background scan error for ${scanId}:`, err);
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

async function runScanSequenceSSE(scanId, targetWebsiteUrl) {
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
    scanEmitter.emit(scanId, { type: 'progress', step: 'Finalizing', progress: 95, log: 'Saving results to database...', scanId });
    // Persist final report to MongoDB
    const newScanRecord = new Scan({
      scanId : scanId,
      targetUrl: targetWebsiteUrl,
      targetHostname: new URL(targetWebsiteUrl).hostname,
      status: 'completed',
      rawResults: combinedScanResults
    });
    await newScanRecord.save();
    scanEmitter.emit(scanId, { type: 'done', scanId: scanId, log: 'Finished.' });
  } catch (error) {
    console.error(`Scan failed for ${scanId}:`, error);
    scanEmitter.emit(scanId, { type: 'error', scanId: scanId, message: error.message || 'Internal Server Error' });
  }
}

// Fetch all previous scans for the history page
scanRouter.get('/history', async (req, res) => {
  try {
    const scans = await Scan.find().sort({ createdAt: -1 });
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

// Delete a scan history record
scanRouter.delete('/:id', async (req, res) => {
  try {
    await Scan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

// GET /api/scan/history
// Returns the last 10 completed scans (most recent first)
scanRouter.get('/history', async (req, res) => {
  try {
    // Fetch last 10 scans from MongoDB, sorted by newest first
    // .select() avoids sending heavy rawResults in the list view
    const recentScans = await Scan.find({ status: 'completed' })
      .sort({ createdAt: -1 })       // Newest scan first
      .limit(10)                      // Only last 10 scans
      .select('scanId targetUrl targetHostname status createdAt'); // Only send lightweight fields
    res.status(200).json({
      totalScans: recentScans.length,
      scans: recentScans
    });
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
    const scanRecord = await Scan.findOne({ scanId : scanId });
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