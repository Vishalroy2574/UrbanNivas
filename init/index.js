// init/index.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing.js");

// Use Atlas if ATLASDB_URL is set, otherwise local UrbanNivas
const dbUrl =
  process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/UrbanNivas";

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

async function initDB() {
  try {
    const count = await Listing.countDocuments();

    if (count > 0) {
      console.log("⚠️ Listings already exist, skipping seeding.");
      return;
    }

    await Listing.insertMany(initData.data);
    console.log("✅ Sample data successfully inserted!");
  } catch (err) {
    console.error("❌ Error inserting sample data:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

main().then(initDB);
