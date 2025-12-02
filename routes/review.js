const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");

// Parser for forms that may be multipart but contain no files
const multer = require("multer");
const parseFieldsOnly = multer().none();

/* ------------------------
   CREATE REVIEW
--------------------------- */
router.post("/", parseFieldsOnly, async (req, res, next) => {
  try {
    let reviewData = req.body.review || null;

    // fallback for flat inputs
    if (!reviewData) {
      reviewData = {
        body: req.body["review[body]"] || req.body.body || "",
        rating: req.body["review[rating]"] || req.body.rating || "",
      };
    }

    const body = String(reviewData.body || "").trim();
    const rating = Number(reviewData.rating || 0);

    if (!body || rating < 1 || rating > 5) {
      return res.status(400).send("Invalid review");
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");

    const newReview = new Review({
      body,
      rating,
      listing: listing._id
    });

    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    next(err);
  }
});

/* ------------------------
   DELETE REVIEW
--------------------------- */
router.delete("/:reviewId", async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    const expectsJSON =
      req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"));

    if (expectsJSON) return res.json({ success: true, reviewId });

    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
