const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const templateSchema = Schema(
  {
    name: { type: String, required: true }, //sender name
    description: { type: String, required: true },
    template_key: { type: String, required: true, unique: true }, //identification
    from: { type: String, required: true }, //destination
    html: { type: String, required: true }, //content
    subject: { type: String, required: true }, //title
    variables: [{ type: String, required: true }], //allow variables, dynamic
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
