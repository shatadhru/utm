const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require('mongoose');
require("dotenv").config();

const connectDb = async () => {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error("❌ MongoDB URI not found in .env");
    process.exit(1); // stop server
  }

  try {
    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // stop server if DB not connected
  }
};

module.exports = connectDb;