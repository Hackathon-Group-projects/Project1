
const express = require('express');
const scanRouter = express.Router();
const Scan = require('../models/Scan');

// Import core security scanning services
const { checkSSL } = require('../services/sslService');
const { checkHeaders } = require('../services/headerService');
const { checkTechStack } = require('../services/techService');
const { lookupCvesForTechStack } = require('../services/cveService');

// Setup event emitter for SSE background progress streaming
const EventEmitter = require('events');
class ScanEmitter extends EventEmitter { }
const scanEmitter = new ScanEmitter();
const { v4: uuidv4 } = require('uuid');

// Initiates the scan sequence and immediately returns a queue ID
scanRouter.post('/start', async (req, res) => {
  const targetUrl = req.body.url;
  if (!targetUrl) return res.status(400).json({ error: 'Please provide a valid URL to scan.' });

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
    scanEmitter.emit(scanId, { type: 'progress', step: 'SSL Scan', progress: 20, log: 'Checking SSL...', scanId });
    const sslScannerOutput = await checkSSL(targetWebsiteUrl);

    scanEmitter.emit(scanId, { type: 'progress', step: 'Headers Scan', progress: 40, log: 'Analyzing HTTP headers...', scanId });
    const headerScannerOutput = await checkHeaders(targetWebsiteUrl);

    scanEmitter.emit(scanId, { type: 'progress', step: 'Tech Fingerprint', progress: 60, log: 'Fingerprinting tech stack...', scanId });
    const techScannerOutput = await checkTechStack(targetWebsiteUrl);

    scanEmitter.emit(scanId, { type: 'progress', step: 'CVE Lookup', progress: 80, log: 'Checking CVEs...', scanId });
    const cveScannerOutput = await lookupCvesForTechStack(techScannerOutput);

    const combinedScanResults = {
      ssl: sslScannerOutput,
      headers: headerScannerOutput,
      tech: techScannerOutput,
      cves: cveScannerOutput
    };

    scanEmitter.emit(scanId, { type: 'progress', step: 'Finalizing', progress: 95, log: 'Saving results...', scanId });

    // Persist final report
    const newScanRecord = new Scan({
      targetUrl: targetWebsiteUrl,
      targetHostname: new URL(targetWebsiteUrl).hostname,
      status: 'completed',
      rawResults: combinedScanResults
    });

    await newScanRecord.save();
    scanEmitter.emit(scanId, { type: 'done', scanId: scanId, log: 'Finished.' });

  } catch (error) {
    scanEmitter.emit(scanId, { type: 'error', scanId: scanId, message: error.message });
  }
}

module.exports = scanRouter;