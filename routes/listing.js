// routes/listing.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const listings = require("../controllers/listings");
const {
  isLoggedIn,
  isAdmin,
  isListingOwnerOrSiteOwner,
} = require("../utils/middleware");

// Cloudinary + Multer setup
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "listings",
    allowed_formats: ["jpeg", "png", "jpg", "webp", "avif"],
  },
});

const upload = multer({ storage });   // 👈 THIS was missing

/* ROUTES */

// main listings page (will handle search with ?q=)
router.get("/", listings.getAllListings);

// optional JSON endpoint for autocomplete / search
router.get("/search", listings.searchListings);

// new listing form – only logged-in users
router.get("/new", isLoggedIn, listings.renderNewForm);

// create listing – only logged-in users; expects field name "image"
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  listings.createListing
);

// edit form – must be logged in and owner/admin
router.get(
  "/:id/edit",
  isLoggedIn,
  isListingOwnerOrSiteOwner,
  listings.renderEditForm
);

// update listing – must be logged in and owner/admin
router.put(
  "/:id",
  isLoggedIn,
  isListingOwnerOrSiteOwner,
  upload.single("image"),
  listings.updateListing
);

// delete listing – must be logged in and owner/admin
router.delete(
  "/:id",
  isLoggedIn,
  isListingOwnerOrSiteOwner,
  listings.deleteListing
);

// delete review
router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  listings.deleteReview
);

// host reply to review
router.post(
  "/:id/reviews/:reviewId/reply",
  isLoggedIn,
  listings.replyToReview
);

// show single listing
router.get("/:id", listings.showListing);

// create review
router.post("/:id/reviews", isLoggedIn, listings.createReview);

module.exports = router;
