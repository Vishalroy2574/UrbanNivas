// controllers/reviews.js
const Listing = require("../models/listing");
const Review = require("../models/review");

/* POST /listings/:id/reviews  -> add a new review */
module.exports.createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
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

/* DELETE /listings/:id/reviews/:reviewId -> delete review */
module.exports.deleteReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};
