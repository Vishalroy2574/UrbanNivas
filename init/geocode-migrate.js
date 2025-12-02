#!/usr/bin/env node
// init/geocode-migrate.js
// Usage: node init/geocode-migrate.js
// This script finds listings with missing latitude/longitude and attempts to geocode them.

const mongoose = require('mongoose');
const Listing = require('../models/listing');
const geocodeLocation = require('../utils/geocode');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function migrate() {
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const listings = await Listing.find({ $or: [ { latitude: { $exists: false } }, { longitude: { $exists: false } }, { latitude: null }, { longitude: null } ] });
  console.log(`Found ${listings.length} listings missing coordinates`);

  let success = 0;

  function looksLikeMatch(displayName, location, country) {
    if (!displayName) return false;
    const d = displayName.toLowerCase();
    if (location && d.includes(location.toLowerCase())) return true;
    if (country && d.includes(country.toLowerCase())) return true;
    return false;
  }
  for (const l of listings) {
    try {
      const queryParts = [];
      if (l.location) queryParts.push(l.location);
      if (l.country) queryParts.push(l.country);
      const query = queryParts.join(', ');
      console.log('\nAttempting geocode for listing:', l._id.toString(), query);
      let coords = null;
      if (query) coords = await geocodeLocation(l.location, l.country);
      if (!coords && l.location) coords = await geocodeLocation(l.location);
      if (!coords && l.country) coords = await geocodeLocation(l.country);

      if (coords && looksLikeMatch(coords.display_name, l.location, l.country)) {
        l.latitude = coords.latitude;
        l.longitude = coords.longitude;
        await l.save();
        console.log('  Updated:', { latitude: coords.latitude, longitude: coords.longitude, display_name: coords.display_name });
        success++;
      } else if (coords) {
        console.warn('  Found coords but display_name did not match expected place ->', coords.display_name);
      } else {
        console.warn('  No coords found for:', l._id.toString());
      }

      // Small delay to avoid hitting remote API rate limits
      await new Promise(r => setTimeout(r, 1200));
    } catch (err) {
      console.error('  Error geocoding', l._id.toString(), err.message);
    }
  }

  console.log(`\nMigration complete — updated ${success}/${listings.length} documents`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed', err);
});
