// utils/middleware.js
const Listing = require('../models/listing');

// Must be logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You must be signed in to do that.');
  return res.redirect('/login');
};

// Must be owner of listing OR site owner/admin
module.exports.isListingOwnerOrSiteOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }

    const userId = req.user ? req.user._id : null;
    const userRole = req.user ? (req.user.role || 'user') : 'user';

    const isOwner = userId && listing.owner && listing.owner.equals(userId);
    const isPrivileged = userRole === 'owner' || userRole === 'admin';

    if (!isOwner && !isPrivileged) {
      req.flash('error', 'You do not have permission to perform that action.');
      return res.redirect(`/listings/${id}`);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

// Must be admin
module.exports.isAdmin = (req, res, next) => {
  const role = req.user ? (req.user.role || 'user') : 'user';
  if (role === 'admin') return next();

  req.flash('error', 'Administrator privileges are required to access that page.');
  return res.redirect('/');
};
