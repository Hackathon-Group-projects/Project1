const mongoose = require('mongoose');
const Scan = require('./server/models/Scan');

mongoose.connect('mongodb+srv://kashvi9112007_db_user:MPdyPPoRC9OhSm9n@cluster01.1i1zkos.mongodb.net/?appName=Cluster01')
  .then(async () => {
    const scan = await Scan.findOne();
    console.log("First scan userId:", scan.userId);
    
    // Attempt string lookup
    const userIdStr = scan.userId.toString();
    const result = await Scan.find({ userId: userIdStr, isDeleted: { $ne: true } }).limit(2);
    console.log("Lookup with string id found:", result.length);
    process.exit(0);
  });
