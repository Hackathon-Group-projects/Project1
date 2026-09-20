const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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