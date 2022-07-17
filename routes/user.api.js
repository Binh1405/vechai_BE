const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const imageUploadMiddleware = require("../middlewares/imageUpload.middleware");
const passport = require("passport");

const {
  getAll,
  createByEmailPassword,
  updateById,
  deleteById,
  loginWithEmailPassword,
  createWithGoogle,
  verifyEmail,
} = require("../controllers/user.controller");

/* GET users listing. */
router.get("/", authenticationMiddleware, isAdmin, getAll); //admin
router.post("/register", createByEmailPassword); //public
router.post("/login", loginWithEmailPassword); //public
router.put(
  "/update-me",
  authenticationMiddleware,
  imageUploadMiddleware.single("image"),
  updateById
); //authenticated
router.get("/emailverification/:code", verifyEmail);
router.delete("/delete-me", authenticationMiddleware, deleteById); //authenticated
router.get(
  "/loginwithgoogle",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/login/googleok",
  passport.authenticate("google", { failureRedirect: "/notFound" }),
  createWithGoogle
);

module.exports = router;
