const mongoose = require('mongoose');
const Scan = require('./server/models/Scan');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: 'aryanborse13@gmail.com' });
  if (user) {
    await Scan.updateMany({ userId: null }, { $set: { userId: user._id } });
    console.log("Updated null scans to belong to user:", user.email);
  }
  process.exit(0);
});
