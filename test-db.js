const mongoose = require('mongoose');
const Scan = require('./server/models/Scan');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const scan = await Scan.findOne().sort({ scannedAt: -1 });
  console.log("Latest scan:");
  console.log("scanId:", scan.scanId);
  console.log("userId:", scan.userId);
  console.log("status:", scan.status);
  
  const user = await require('./server/models/User').findOne(); 
  if (user) {
     console.log("User in DB ID:", user._id);
     console.log("User Email:", user.email);
  }
  process.exit(0);
});
