const crypto = require("crypto");
module.exports = (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") //convert to hex decima format
    .slice(0, len)
    .toUpperCase(); //return require number of characters
};
