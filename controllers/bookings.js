// controllers/bookings.js
const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Listing = require('../models/listing');

// Create a booking (POST /listings/:id/book)
module.exports.createBooking = async (req, res, next) => {
  try {
    const { id } = req.params; // listing id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid listing id');
      return res.redirect('/listings');
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }

    // logged-in user check assumed by middleware
    const userId = req.user._id;

    // Owner shouldn't book their own listing
    if (listing.owner && listing.owner.equals(userId)) {
      req.flash('error', 'You cannot book your own listing.');
      return res.redirect(`/listings/${id}`);
    }

    const { startDate, endDate, guests } = req.body;
    if (!startDate || !endDate) {
      req.flash('error', 'Please provide start and end dates');
      return res.redirect(`/listings/${id}`);
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e) || s > e) {
      req.flash('error', 'Invalid date range');
      return res.redirect(`/listings/${id}`);
    }

    // OPTION A: allow multiple bookings for same dates (no conflict check)

    const booking = new Booking({
      listing: id,
      user: userId,
      startDate: s,
      endDate: e,
      guests: Math.max(1, Number(guests) || 1),
    });
    await booking.save();

    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.round((e - s) / msPerDay) + 1;
    const sFormatted = s.toLocaleDateString();

    req.flash(
      'success',
      `🎉 Booking confirmed! "${listing.title}" for ${days} night(s) starting ${sFormatted}.`
    );

    return res.redirect(`/users/${userId}`);
  } catch (err) {
    next(err);
  }
};

// Show bookings for listing (for listing owner)
module.exports.getListingBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid listing id');
      return res.redirect('/listings');
    }
    const bookings = await Booking.find({ listing: id }).populate(
      'user',
      'username email'
    );
    res.render('bookings/listing', { title: 'Bookings', bookings });
  } catch (err) {
    next(err);
  }
};

// Get bookings of current user
module.exports.getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate(
      'listing',
      'title location price'
    );
    res.render('bookings/user', { title: 'My bookings', bookings });
  } catch (err) {
    next(err);
  }
};
