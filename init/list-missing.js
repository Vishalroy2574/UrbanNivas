#!/usr/bin/env node
// init/list-missing.js
// Usage: node init/list-missing.js
// Prints out listings missing latitude or longitude so you can inspect why map doesn't show.

const mongoose = require('mongoose');
const Listing = require('../models/listing');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function listMissing() {
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const missing = await Listing.find({ $or: [ { latitude: { $exists: false } }, { longitude: { $exists: false } }, { latitude: null }, { longitude: null } ] });
  if (!missing.length) {
    console.log('✅ No listings missing coordinates — everything looks good.');
  } else {
    console.log(`Found ${missing.length} listings missing coordinates:\n`);
    missing.forEach((l) => {
      console.log(`- id: ${l._id}\n  title: ${l.title}\n  location: ${l.location}\n  country: ${l.country}\n  lat: ${l.latitude}\n  lng: ${l.longitude}\n`);
    });
  }

  await mongoose.disconnect();
}

listMissing().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
