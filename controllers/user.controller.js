const dotenv = require("dotenv");
dotenv.config();
const sendResponse = require("../helpers/sendResponse");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { uploader } = require("../helpers/cloudinaryConfig");
const {
  createSingleEmailFromTemplate,
  send,
} = require("../helpers/email.helper");
const generateHex = require("../helpers/generateHex");
const userController = {};

userController.getAll = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let result;
  let count = 0;
  console.log("currentUser", req.currentUser);
  try {
    result = await User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));
    count = result.length;
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    { result, count },
    false,
    "Successfully get all users"
  );
};
userController.createByEmailPassword = async (req, res, next) => {
  const { name, email } = req.body;
  let { password } = req.body;
  console.log("input", name, email, password);
  let result;
  try {
    if (!name || !email || !password) throw new Error("missing input");
    const found = await User.findOne({ email });
    console.log("found", found)
    if (found) {throw new Error("email already registered")};
    //encrypting password
    const salt = await bcrypt.genSalt(10);
    console.log("salt", salt);
    password = await bcrypt.hash(password, salt);
    console.log("password", password);
    let code = generateHex(12);
    let link = `https://ecombe1.herokuapp.com/api/users/emailverification/${code}`;
    console.log("email", link);
    result = await User.create({
      name,
      email,
      password,
      emailVerificationCode: code,
    });
    console.log("result", result);
    //send Email verification
    const content = { name, link };
    console.log("content", content)
    let toEmail = email;
    let template_key = "verify_email";
    const info = await createSingleEmailFromTemplate(
      template_key,
      content,
      toEmail
    );
    console.log("info", info);
    await send(info);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create user and send verification email"
  );
};

userController.loginWithEmailPassword = async (req, res, next) => {
  const { email, password } = req.body;
  let token;
  let userName;
  let role
  try {
    if (!email || !password) throw new Error("Please input email and password");
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) throw new Error("User with that email is not found");
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      token = await user.generateToken();
      userName = user.name;
      role = user.role
    } else {
      throw new Error("password not match");
    }
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    { token, userName, role },
    false,
    "Successfully login"
  );
};

userController.updateById = async (req, res, next) => {
  let result;
  const allowOptions = ["name", "email", "password"];
  const updateObject = {};
  const imagePath = req.file.path;
  try {
    allowOptions.forEach((option) => {
      if ((req.body[option] = !undefined)) {
        updateObject[option] = req.body[option];
      }
    });
    if (imagePath) {
      const cloudinaryResponse = await uploader.upload(imagePath);
      updateObject.avatar = cloudinaryResponse.secure_url;
    }
    result = await User.findByIdAndUpdate(req.currentUser._id, updateObject, {
      new: true,
    });
  } catch (error) {
    return next(error);
  }
};
userController.deleteById = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.currentUser._id, { isDeleted: true });
  } catch (error) {
    return next(error);
  }
  return sendResponse(res, 200, true, null, false, "Successfully delete user");
};
userController.createWithGoogle = async (req, res, next) => {
  console.log("input", req.user);
  const userInfo = req.user;
  let result;
  //allow user to create account
  //from userInfo input, create an account in my database
  try {
    const found = await User.findOne({ email: userInfo.emails[0].value });
    if (found) throw new Error("this email is already registered");
    const salt = await bcrypt.genSalt(SALT_ROUND);
    let password = await bcrypt.hash("abc", salt);
    const newUser = {
      name: userInfo.displayName,
      avatar: userInfo.photos[0].value,
      email: userInfo.emails[0].value,
      password,
    };
    result = await User.create(newUser);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create account with google"
  );
};
userController.verifyEmail = async (req, res, next) => {
  let result;
  try {
    const emailVerificationCode = req.params.code;
    const found = await User.findOne({ emailVerificationCode });
    if (!found) throw new Error("Not found email");
    result = await User.findOneAndUpdate({
      email: found.email,
      isEmailVerified: true,
    });
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully verify email"
  );
};
module.exports = userController;
