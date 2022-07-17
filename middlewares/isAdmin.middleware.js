const User = require("../models/User");

const isAdmin = async(req, res, next) => {
  try {
    const userId = req.currentUser._id
    console.log("userId", userId)
    const currentUser = await User.findById(userId)
    const isAdmin = currentUser.role === "admin"
    if (!isAdmin)
      throw new Error("you need to be admin to get access");
    req.isAdmin = isAdmin
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = isAdmin;
