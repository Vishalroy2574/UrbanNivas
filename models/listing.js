// models/listing.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    location: String,
    country: String,

    // 🌍 coordinates for map
    latitude: Number,
    longitude: Number,

    // Cloudinary image (or similar)
    image: {
      url: String,
      filename: String,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // owner / user who created this listing

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

// ✅ export the *model* directly
module.exports = mongoose.model("Listing", listingSchema);
