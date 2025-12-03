// routes/user.js
const express  = require("express");
const router   = express.Router();
const passport = require("passport");
const path     = require("path");
const multer   = require("multer");

const User     = require("../models/user");
const Listing  = require("../models/listing");
const Review   = require("../models/review");
const Booking  = require('../models/booking');

// ========== MULTER CONFIG FOR AVATAR UPLOAD ==========

const upload = multer({
  dest: path.join(__dirname, "..", "public", "uploads"),
});

// ========== SIGNUP ==========

// GET /signup  -> show signup form
router.get("/signup", (req, res) => {
  res.render("users/signup", { title: "Sign Up" });
});

// POST /signup -> create user and log them in
router.post("/signup", upload.single("avatar"), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // create user object
    const user = new User({ username, email });

    // if a file was uploaded, override default avatar
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    // register with passport-local-mongoose (hash + salt password)
    const registeredUser = await User.register(user, password);

    // log them in immediately after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome! Account created successfully.");
      res.redirect("/listings");
    });
  } catch (e) {
    // duplicate email case
    if (e.code === 11000 && e.keyPattern && e.keyPattern.email) {
      req.flash(
        "error",
        "This email is already registered. Please log in or use another one."
      );
      return res.redirect("/signup");
    }
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

// ========== LOGIN ==========

// GET /login  -> show login form
router.get("/login", (req, res) => {
  res.render("users/login", { title: "Log In" });
});

// POST /login -> log the user in
// user model uses usernameField: "email"
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

// ========== ADMIN LOGIN ==========

// GET /admin/login -> show admin login form
router.get("/admin/login", (req, res) => {
  res.render("users/admin-login", { title: "Admin Login" });
});

// POST /admin/login -> admin auth only
router.post("/admin/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", (info && info.message) || "Invalid credentials.");
      return res.redirect("/admin/login");
    }
    if (user.role !== "admin") {
      req.flash("error", "Administrator access only.");
      return res.redirect("/admin/login");
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      req.flash("success", "Welcome, admin!");
      return res.redirect("/admin/users");
    });
  })(req, res, next);
});

// ========== PROFILE ==========

// GET /profile -> current logged in user's profile
router.get("/profile", (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to see your profile.");
    return res.redirect("/login");
  }
  res.redirect(`/users/${req.user._id}`);
});

// GET /users/:id -> profile by id
router.get("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const profileUser = await User.findById(id);
    if (!profileUser) {
      req.flash("error", "User not found.");
      return res.redirect("/listings");
    }

    const listings = await Listing.find({ owner: id });
    const reviews  = await Review.find({ author: id }).populate("listing", "title");
    // show bookings if viewing own profile or optionally when viewing others (we'll show bookings made by this user)
    const bookings = await Booking.find({ user: id }).populate('listing', 'title price location');

    res.render("users/profile", {
      title: profileUser.username,
      profileUser,
      listings,
      reviews,
      bookings,
    });
  } catch (err) {
    next(err);
  }
});

// ========== LOGOUT ==========

// POST /logout -> log the user out
router.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "You have logged out.");
    res.redirect("/login");
  });
});

module.exports = router;
