// controllers/listings.js

const mongoose = require('mongoose');
const Listing    = require("../models/listing");
const Review     = require("../models/review");
const cloudinary = require("cloudinary").v2;
const geocodeLocation = require("../utils/geocode");

/* 1. GET /listings  -> list all */
module.exports.getAllListings = async (req, res, next) => {
  try {
    // Support optional search query (GET /listings?q=term)
    const q = (req.query.q || req.query.search || "").trim();
    let allListings;

    if (q) {
      // safe regex escaping
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const r = new RegExp(escapeRegex(q), "i");
      // search by title, location, country, or description
      allListings = await Listing.find({
        $or: [
          { title: r },
          { location: r },
          { country: r },
          { description: r },
        ],
      });
    } else {
      allListings = await Listing.find({});
    }

    res.render("listings/index", { title: "All Listings", allListings, q });
  } catch (err) {
    next(err);
  }
};

/* JSON: GET /listings/search?q=term -> typeahead/autocomplete */
module.exports.searchListings = async (req, res, next) => {
  try {
    const q = (req.query.q || req.query.term || '').trim();
    if (!q || q.length < 1) return res.json([]);

    // escape regex
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const r = new RegExp(escapeRegex(q), 'i');

    // return small set of matches (limit 8)
    const matches = await Listing.find({
      $or: [{ title: r }, { location: r }, { country: r }, { description: r }],
    })
      .limit(8)
      .select('title location country price');

    // Send JSON array for typeahead: include full url
    const results = matches.map((m) => ({
      id: m._id,
      title: m.title,
      location: m.location,
      country: m.country,
      price: m.price,
      url: `/listings/${m._id}`,
    }));

    res.json(results);
  } catch (err) {
    next(err);
  }
};

/* 2. GET /listings/new  -> show new listing form */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new", { title: "Add New Listing" });
};

/* 3. POST /listings  -> CREATE listing WITH geocode */
module.exports.createListing = async (req, res, next) => {
  try {
    // multer uses multipart/form-data and may not turn bracket-named fields
    // (e.g. listing[location]) into a nested object. Support either shape:
    // - req.body.listing (expected) OR
    // - req.body['listing[location]'] etc. (when multer keeps flat keys)
    const bodyListing = req.body.listing || {};
    // normalize flat keys like 'listing[location]'
    if (!req.body.listing) {
      for (const k of Object.keys(req.body)) {
        const m = k.match(/^listing\[(.+)\]$/);
        if (m) bodyListing[m[1]] = req.body[k];
      }
    }

    const { title, description, price, location, country } = bodyListing;

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      country,
      owner: req.user ? req.user._id : null,
    });


    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      newListing.image = {
        url: "http://dummyimage.com/193x100.png/cc0000/ffffff",
        filename: "Listingimage",
      };
    }

    // Attempt geocoding, with fallbacks. Save coords if any attempt succeeds.
    console.log("🔍 Geocoding attempt for:", { location, country });
    let coords = null;

    // try full query (location + country)
    coords = await geocodeLocation(location, country);
    if (!coords && location) {
      // try location only
      console.log("🔁 Geocoding fallback: trying location only");
      coords = await geocodeLocation(location);
    }
    if (!coords && country) {
      // last-resort try: country only
      console.log("🔁 Geocoding fallback: trying country only");
      coords = await geocodeLocation(country);
    }

    console.log("📍 Coords result:", coords && { latitude: coords.latitude, longitude: coords.longitude, display_name: coords.display_name });

    if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      newListing.latitude = coords.latitude;
      newListing.longitude = coords.longitude;
    } else {
      // Geocoding failed silently — map won't show but listing saves successfully
      console.warn("⚠️ Geocoding returned no coordinates for:", { location, country });
    }

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

/* 4. GET /listings/:id/edit  -> show edit form */
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid listing id.');
      return res.redirect('/listings');
    }
    const listing = await Listing.findById(id);
    console.log(`🔧 Rendering edit form for id=${id}`);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    res.render("listings/edit", { title: "Edit Listing", listing });
  } catch (err) {
    next(err);
  }
};

/* 5. PUT /listings/:id  -> UPDATE listing WITH geocode */
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid listing id.');
      return res.redirect('/listings');
    }
    // same normalization for update route (support multipart flat fields)
    const updateListingBody = req.body.listing || {};
    if (!req.body.listing) {
      for (const k of Object.keys(req.body)) {
        const m = k.match(/^listing\[(.+)\]$/);
        if (m) updateListingBody[m[1]] = req.body[k];
      }
    }
    const { title, description, price, location, country } = updateListingBody;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    // Only overwrite fields that were actually provided in the update payload.
    if (typeof title !== 'undefined') listing.title = title;
    if (typeof description !== 'undefined') listing.description = description;
    if (typeof price !== 'undefined') listing.price = price;
    if (typeof location !== 'undefined') listing.location = location;
    if (typeof country !== 'undefined') listing.country = country;

    if (req.file) {
      if (
        listing.image &&
        listing.image.filename &&
        listing.image.filename !== "Listingimage"
      ) {
        await cloudinary.uploader.destroy(listing.image.filename);
      }

      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    console.log("🔍 Re-Geocoding attempt for:", { location, country });
    let coords = await geocodeLocation(location, country);
    if (!coords && location) {
      console.log("🔁 Re-Geocoding fallback: trying location only");
      coords = await geocodeLocation(location);
    }
    if (!coords && country) {
      console.log("🔁 Re-Geocoding fallback: trying country only");
      coords = await geocodeLocation(country);
    }
    console.log("📍 Re-Geocode result:", coords && { latitude: coords.latitude, longitude: coords.longitude, display_name: coords.display_name });

    if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      listing.latitude = coords.latitude;
      listing.longitude = coords.longitude;
    } else {
      // Geocoding failed silently — map won't show but listing updates successfully
      console.warn("⚠️ Re-Geocoding returned no coordinates for:", { location, country });
    }

    await listing.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

/* 6. GET /listings/:id  -> show single listing + rating summary */
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid listing id.');
      return res.redirect('/listings');
    }

    const listing = await Listing.findById(id).populate({
      path: "reviews",
      populate: { path: "author", select: "username" },
    });

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Auto-populate coordinates if missing to keep legacy listings working
    if (
      (listing.latitude === undefined ||
        listing.latitude === null ||
        listing.longitude === undefined ||
        listing.longitude === null) &&
      (listing.location || listing.country)
    ) {
      try {
        let coords = await geocodeLocation(listing.location, listing.country);
        if (!coords && listing.location) coords = await geocodeLocation(listing.location);
        if (!coords && listing.country) coords = await geocodeLocation(listing.country);
        if (
          coords &&
          typeof coords.latitude === "number" &&
          typeof coords.longitude === "number"
        ) {
          listing.latitude = coords.latitude;
          listing.longitude = coords.longitude;
          await listing.save();
        }
      } catch (geoErr) {
        console.warn("Unable to auto-geocode listing", id, geoErr.message);
      }
    }

    const totalReviews = listing.reviews.length;
    let avgRating = 0;
    const ratingCounts = [0, 0, 0, 0, 0];

    if (totalReviews > 0) {
      let sum = 0;
      for (const r of listing.reviews) {
        sum += r.rating;
        ratingCounts[r.rating - 1] += 1;
      }
      avgRating = sum / totalReviews;
    }

    const isOwner =
      req.user &&
      listing.owner &&
      listing.owner.equals &&
      listing.owner.equals(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
    const canAdminister = !!(isOwner || isAdmin);
    res.render("listings/show", {
      title: listing.title,
      listing,
      avgRating,
      ratingCounts,
      totalReviews,
      canEdit: !!canAdminister,
    });
  } catch (err) {
    next(err);
  }
};

/* 7. POST /listings/:id/reviews  -> add review */
module.exports.createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid listing id.');
      return res.redirect('/listings');
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const { body, rating } = req.body.review;

    const review = new Review({
      body,
      rating,
      listing: listing._id,
      author: req.user ? req.user._id : null,
    });

    await review.save();
    listing.reviews.push(review._id);
    await listing.save();

    req.flash("success", "Review added!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

/* 8. DELETE /listings/:id  -> delete listing + its reviews + Cloudinary image */
module.exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid listing id.');
      return res.redirect('/listings');
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    if (
      listing.image &&
      listing.image.filename &&
      listing.image.filename !== "Listingimage"
    ) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    await Review.deleteMany({ _id: { $in: listing.reviews } });
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

/* 9. DELETE /listings/:id/reviews/:reviewId -> delete review (author or host) */
module.exports.deleteReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      req.flash('error', 'Invalid listing or review id.');
      return res.redirect('/listings');
    }

    const listing = await Listing.findById(id);
    const review  = await Review.findById(reviewId);

    if (!listing || !review) {
      req.flash("error", "Review or listing not found");
      return res.redirect(`/listings/${id}`);
    }

    const userId   = req.user ? req.user._id : null;
    const userRole = req.user ? (req.user.role || 'user') : 'user';
    const isAuthor = userId && review.author && review.author.equals(userId);
    const isOwner  = userId && listing.owner && listing.owner.equals(userId);
    const isPrivileged = userRole === 'owner' || userRole === 'admin';

    if (!isAuthor && !isOwner && !isPrivileged) {
      req.flash("error", "You are not allowed to delete this review.");
      return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted.");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

/* 10. POST /listings/:id/reviews/:reviewId/reply -> host replies */
module.exports.replyToReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      req.flash('error', 'Invalid listing or review id.');
      return res.redirect('/listings');
    }
    const listing = await Listing.findById(id);
    const review  = await Review.findById(reviewId);

    if (!listing || !review) {
      req.flash("error", "Review or listing not found");
      return res.redirect(`/listings/${id}`);
    }

    if (!req.user || !listing.owner || !listing.owner.equals(req.user._id)) {
      req.flash("error", "Only the host can reply to reviews.");
      return res.redirect(`/listings/${id}`);
    }

    const { body } = req.body.reply;
    review.hostReply = {
      body,
      author: req.user._id,
      createdAt: new Date(),
    };

    await review.save();
    req.flash("success", "Reply posted.");
    res.redirect(`/listings/${id}#review-${review._id}`);
  } catch (err) {
    next(err);
  }
};
