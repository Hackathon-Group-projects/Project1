const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const rateLimit = require('express-rate-limit');
const events = require('events');

// Anti-Memory Leak: Allow scaling EventEmitter during heavy load testing (SSE streams)
events.EventEmitter.defaultMaxListeners = 150;

const app = express();

// Advanced API Hardening via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));

// Strict CORS implementation
const allowedOrigins = ['http://localhost:5173', 'http://localhost:4000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400
}));

app.use(express.json({ limit: '10kb' })); // Payload size limit for hardening

// Implementation of Rate Limiting 
const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 24 hours.'
});

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Register API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scan', require('./routes/scan'));


// Global error handler - catches any unhandled errors in the entire app
// Without this, Express returns ugly HTML errors instead of clean JSON
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on our end.'
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Background Template Updater
  // Jaise hi server on hoga, ye background mein Nuclei ke rules update kar dega
  // Isse app start hone mein time nahi lagega aur scanner humesha latest rahega!
  console.log('⏳ Checking for Nuclei template updates in the background...');

  exec('nuclei -update-templates', (error, stdout, stderr) => {
    if (error) {
      console.warn('Could not update Nuclei templates. Will use existing ones.');
    } else {
      console.log('Nuclei security templates are successfully up to date!');
    }
  });
});