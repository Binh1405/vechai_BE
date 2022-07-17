const multer = require("multer");
const path = require("path");
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    console.log("from client", file);
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      cb(new Error("File ext not supported"), false);
    }
    cb(null, true);
  },
});
