#!/usr/bin/env node
// init/geocode-verify.js
// Scans all listings and tries to verify/fix suspicious coordinates.
// It will re-geocode each listing and update coordinates only if the geocoded
// "display_name" contains the provided location or country (a simple validation).

const mongoose = require('mongoose');
const Listing = require('../models/listing');
const geocodeLocation = require('../utils/geocode');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

function looksLikeMatch(displayName, location, country) {
  if (!displayName) return false;
  const d = displayName.toLowerCase();
  if (location && d.includes(location.toLowerCase())) return true;
  if (country && d.includes(country.toLowerCase())) return true;
  return false;
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to DB');

  const listings = await Listing.find({});
  console.log(`Found ${listings.length} listings, verifying..`);

  let updated = 0;
  let suspicious = 0;

  for (const l of listings) {
    const { location, country } = l;
    const q = [location, country].filter(Boolean).join(', ');
    if (!q) continue;

    try {
      console.log('\nChecking:', l._id.toString(), q);
      // Re-run geocode with best-effort attempts
      let res = await geocodeLocation(location, country);

      // If result doesn't look like our place, try fallbacks
      if (!res || !looksLikeMatch(res.display_name, location, country)) {
        console.log('  First result did not match display_name -> trying location only');
        res = await geocodeLocation(location);
      }
      if (!res || !looksLikeMatch(res.display_name, location, country)) {
        console.log('  Location-only result did not match -> trying country only');
        res = await geocodeLocation(country);
      }

      if (res && looksLikeMatch(res.display_name, location, country)) {
        // If listing has missing coords or coords differ considerably, update
        const lat = res.latitude;
        const lng = res.longitude;

        // Only update when coordinates are missing or different
        const needUpdate = (!l.latitude && !l.longitude) || l.latitude !== lat || l.longitude !== lng;
        if (needUpdate) {
          console.log('  Updating listing with coords:', lat, lng, 'found as ->', res.display_name);
          l.latitude = lat;
          l.longitude = lng;
          await l.save();
          updated++;
        } else {
          console.log('  Coordinates already accurate — skipping');
        }
      } else {
        console.warn('  No validated geocode found for:', q, 'display_name:', res && res.display_name);
        suspicious++;
      }

      // Throttle slightly
      await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
      console.error('  Error while verifying:', err.message);
    }
  }

  console.log('\nVerification complete — updated', updated, 'listings,', suspicious, 'suspicious entries');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Verification failed', err);
});
