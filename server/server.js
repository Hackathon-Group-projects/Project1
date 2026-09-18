const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { exec } = require('child_process');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Register the main scan route (add this after app.use(express.json()))
app.use('/api/scan', require('./routes/scan'));

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