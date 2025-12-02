const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email:    { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar:   { type: String, default: "/uploads/userProfile.png.avif" }, 
  // role controls elevated permissions. 'owner' is a site-owner role
  // that was added previously; 'admin' can now also be used to allow
  // administrative users to edit/delete any listing.
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameUnique: false,
});

module.exports = mongoose.model("User", userSchema);
