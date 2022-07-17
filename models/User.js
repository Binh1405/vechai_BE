const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_MY_SECRET = process.env.JWT_MY_SECRET;
console.log("JWT", JWT_MY_SECRET);
const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    role: { type: String, enum: ["admin", "guest"], default: "guest" },
    currentBalance: { type: Number, default: 0 },
    avatar: String,
    emailVerificationCode: String,
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateToken = async function () {
  const acessToken = await jwt.sign({ _id: this._id }, JWT_MY_SECRET);
  return acessToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
