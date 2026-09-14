const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;
const { v4: uuidv4 } = require('uuid');

const ScanSchema = new Schema({
  // Root Level Fields
  scanId: { type: String, unique: true, default: uuidv4 },
  userId: { type: ObjectId, ref: 'User', default: null },
  targetUrl: { type: String, required: true },
  targetHostname: { type: String, required: true },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'cached'],
    default: 'queued'
  },
  scannedAt: { type: Date, default: Date.now },

  // Section 2: Core Scanner Output Schema
  rawResults: {
    ssl: {
      valid: { type: Boolean },
      validFrom: { type: String },
      validTo: { type: String },
      daysRemaining: { type: Number },
      grade: { type: String },
      issuer: { type: String }
    },
    headers: {
      missing: [{ 
        header: { type: String }, 
        severity: { type: String } 
      }],
      present: [{ 
        header: { type: String }, 
        value: { type: String } 
      }]
    },
    tech: [{
      name: { type: String },
      version: { type: String },
      categories: [{ type: String }]
    }],
    cves: [{
      technology: { type: String },
      version: { type: String },
      vulnerabilities: [{
        id: { type: String },
        summary: { type: String },
        severity: { type: String }
      }]
    }],
    nuclei: [{
      templateId: { type: String },
      name: { type: String },
      severity: { type: String },
      description: { type: String },
      matched: { type: String }
    }]
  },

  // Section 3: Final AI Report Schema
  aiReport: {
    overallScore: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE'] },
    executiveSummary: { type: String },
    positives: [{ type: String }],
    vulnerabilities: [{
      id: { type: String },
      title: { type: String },
      category: { type: String },
      severity: { type: String },
      description: { type: String },
      impact: { type: String },
      recommendation: { type: String },
      fixes: [{
        platform: { type: String },
        language: { type: String },
        code: { type: String },
        instructions: { type: String }
      }],
      references: [{ type: String }]
    }]
  },

  // Expiration for 24-hour cache limit
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
});

// Indexes for caching and history queries
ScanSchema.index({ targetHostname: 1, scannedAt: -1 }); 
ScanSchema.index({ userId: 1, scannedAt: -1 });

module.exports = mongoose.model('Scan', ScanSchema);