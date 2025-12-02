// app.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

const listingsRouter = require("./routes/listing");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const bookingsRouter = require("./routes/bookings");

const User = require("./models/user.js");

const PORT = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// ----- DB CONNECTION -----
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ----- VIEW ENGINE -----
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----- BUILT-IN MIDDLEWARE -----
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ----- SESSION + FLASH -----
const sessionOptions = {
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ----- PASSPORT CONFIGURATION -----
app.use(passport.initialize());
app.use(passport.session());

// use helper from passport-local-mongoose
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ----- GLOBAL LOCALS -----
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ----- DEMO USER (optional) -----
app.get("/demouser", async (req, res, next) => {
  try {
    let user = await User.findOne({ username: "student123" });

    if (!user) {
      const fakeUser = new User({
        email: "student123@gmail.com",
        username: "student123",
      });
      user = await User.register(fakeUser, "helloWorld123");
    }

    res.json({
      username: user.username,
      email: user.email,
      salt: user.salt,
      hash: user.hash,
    });
  } catch (err) {
    next(err);
  }
});

// ----- ROUTES -----
app.use("/listings", listingsRouter);   // /listings/...
app.use("/", userRouter);               // /login, /signup, etc.
app.use("/admin", adminRouter);         // /admin/...
app.use("/", bookingsRouter);           // /listings/:id/book , /bookings/mine, etc.

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ----- BASIC ERROR HANDLER -----
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send("Something went wrong");
});

// ----- SERVER START -----
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
