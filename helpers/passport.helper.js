const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const User = require("../models/User");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser((user, next) => {
  next(null, user.id); //"1247957"
});

passport.deserializeUser(async (id, next) => {
  try {
    let user = await User.findOne({ id });
    next(null, user);
  } catch (error) {
    return next(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://ecombe1.herokuapp.com/api/",
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, profile);
    }
  )
);
