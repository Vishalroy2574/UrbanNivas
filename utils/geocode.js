// utils/geocode.js
const axios = require("axios");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryNominatim(query, userAgent) {
  const url = "https://nominatim.openstreetmap.org/search";
  const res = await axios.get(url, {
    params: { q: query, format: "json", limit: 1 },
    headers: { "User-Agent": userAgent },
    timeout: 10000,
  });
  if (!res.data || res.data.length === 0) return null;
  const place = res.data[0];
  return {
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
    display_name: place.display_name,
    raw: place,
  };
}

async function tryMapbox(query, token) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    const res = await axios.get(url, { params: { access_token: token, limit: 1 }, timeout: 10000 });
    if (!res.data || !Array.isArray(res.data.features) || res.data.features.length === 0) return null;
    const f = res.data.features[0];
    // Mapbox center is [lon, lat]
    return {
      latitude: f.center[1],
      longitude: f.center[0],
      display_name: f.place_name,
      raw: f,
    };
  } catch (err) {
    return null;
  }
}

async function tryOpenCage(query, key) {
  try {
    const url = "https://api.opencagedata.com/geocode/v1/json";
    const res = await axios.get(url, { params: { q: query, key, limit: 1 }, timeout: 10000 });
    if (!res.data || !Array.isArray(res.data.results) || res.data.results.length === 0) return null;
    const r = res.data.results[0];
    return {
      latitude: r.geometry.lat,
      longitude: r.geometry.lng,
      display_name: r.formatted,
      raw: r,
    };
  } catch (err) {
    return null;
  }
}

async function geocodeLocation(location, country) {
  if (!location && !country) return null;

  const query = [location, country].filter(Boolean).join(", ");

  // Use a proper contactable User-Agent per Nominatim policy if provided
  const contact = process.env.GEOCODE_CONTACT || process.env.GEOCODER_CONTACT || process.env.EMAIL || "your-email@example.com";
  const userAgent = `wanderlust-app/1.0 (${contact})`;

  // Try Nominatim with polite retries for 429/403
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await tryNominatim(query, userAgent);
      if (result) return result;
      // if we got an empty array, no reason to keep retrying other than potential rate-limit, so continue
    } catch (err) {
      // Only retry for specific HTTP codes where a retry might help
      if (err && err.response && (err.response.status === 429 || err.response.status === 403)) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Nominatim rate limit or blocked (status=${err.response.status}), retrying in ${delay}ms`);
        await sleep(delay);
        continue;
      }
      console.error("Nominatim geocoding error:", err && err.message);
      break;
    }
  }

  // If Nominatim did not return results or was blocked, try a paid/alternate provider if provided
  if (process.env.MAPBOX_TOKEN) {
    const mb = await tryMapbox(query, process.env.MAPBOX_TOKEN);
    if (mb) return mb;
  }

  if (process.env.OPENCAGE_KEY) {
    const oc = await tryOpenCage(query, process.env.OPENCAGE_KEY);
    if (oc) return oc;
  }

  // No provider returned coordinates
  console.warn("Geocoding returned no coordinates for query:", query);
  return null;
}

module.exports = geocodeLocation;
