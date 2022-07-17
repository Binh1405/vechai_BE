require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sendResponse = require("./helpers/sendResponse");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/login/googleok",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log("success", accessToken, profile);
      return cb(null, profile);
    }
  )
);
app.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/login/googleOK",
  passport.authenticate("google", { failureRedirect: "/notFound" })
);

require("./mongoose");
require("./helpers/passport.helper");
app.use("/api", indexRouter);

// when req match no route, create error
app.use(function (req, res, next) {
  const error = new Error("Wrong url");
  error.statusCode = 404;
  next(error);
});

// when next(error) called, this func will send error message
app.use(function (err, req, res, next) {
  if (err.statusCode) {
    return sendResponse(
      res,
      err.statusCode,
      false,
      null,
      true,
      "Url not found"
    );
  } else {
    return sendResponse(
      res,
      500,
      false,
      null,
      err.message,
      "Internal server error"
    );
  }
});

module.exports = app;
