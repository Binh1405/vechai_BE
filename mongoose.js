const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const { createTemplateIfNotExist } = require("./helpers/email.helper");
// mongoose.Promise = global.Promise;

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(
  MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log("mongodb atlas connection success", MONGO_URI);
      createTemplateIfNotExist();
    } else {
      console.log("error in db connection: ", err);
    }
  }
);
