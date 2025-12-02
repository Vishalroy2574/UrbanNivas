// models/review.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    hostReply: {
      body: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
    },
  },
  { timestamps: true }
);

// ✅ correct: model name is "Review"
module.exports = mongoose.model("Review", reviewSchema);
