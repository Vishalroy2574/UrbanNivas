// routes/bookings.js
const express = require('express');
const router = express.Router();

const bookingsController = require('../controllers/bookings');
const { isLoggedIn } = require('../utils/middleware');

// Create a booking  -> POST /listings/:id/book
router.post('/listings/:id/book', isLoggedIn, bookingsController.createBooking);

// Show bookings for current logged-in user -> GET /bookings/mine
router.get('/bookings/mine', isLoggedIn, bookingsController.getUserBookings);

// Show bookings for a specific listing (for listing owner/admin) -> GET /listings/:id/bookings
router.get('/listings/:id/bookings', isLoggedIn, bookingsController.getListingBookings);

module.exports = router;
