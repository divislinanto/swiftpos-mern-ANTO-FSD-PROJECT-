const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\x1b[32m✔ MongoDB Connected Successfully!\x1b[0m`);
    console.log(`  Database Host: ${conn.connection.host}`);
    console.log(`  Database Name: ${conn.connection.name}`);
    console.log(`  MongoDB Compass URI: \x1b[36m${uri}\x1b[0m`);
    return conn;
  } catch (error) {
    console.error(`\x1b[31m✖ MongoDB Connection Error:\x1b[0m ${error.message}`);
    console.log(`\x1b[33mℹ TIP FOR MONGODB COMPASS:\x1b[0m`);
    console.log(`  1. Ensure MongoDB service is running (or start via: mongod --dbpath ./data/db)`);
    console.log(`  2. Open MongoDB Compass and paste: ${uri}`);
    console.log(`  3. Or set MONGO_URI in your .env file to a cloud MongoDB Atlas URI`);
    // Do not terminate process immediately so health/mock modes or graceful retries can be presented
    return null;
  }
};

module.exports = connectDB;
