const mongoose = require('mongoose');
const Scan = require('./server/models/Scan');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const scan = await Scan.findOne().sort({ scannedAt: -1 });
  console.log("aiReport:", JSON.stringify(scan.aiReport, null, 2));
  process.exit(0);
});
