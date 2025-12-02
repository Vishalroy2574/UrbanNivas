const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isLoggedIn, isAdmin } = require('../utils/middleware');

// GET /admin/users - list all users for admin management
router.get('/users', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find({}).select('username email avatar role');
    res.render('admin/users', { title: 'User management', users });
  } catch (err) {
    next(err);
  }
});

// POST /admin/users/:id/role - update user's role
router.post('/users/:id/role', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'owner', 'admin'].includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('/admin/users');
    }

    // Prevent admin from accidentally removing their own admin role
    if (req.user && req.user._id && req.user._id.equals && req.user._id.equals(id) && role !== 'admin') {
      req.flash('error', 'You cannot remove your own admin privileges here.');
      return res.redirect('/admin/users');
    }

    await User.findByIdAndUpdate(id, { role });
    req.flash('success', 'User role updated.');
    res.redirect('/admin/users');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
