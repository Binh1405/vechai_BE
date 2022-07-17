const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    ratings: [
      {
        author: { type: Schema.Types.ObjectId, ref: "User" },
        rate: { type: Number, enum: [1, 2, 3, 4, 5] },
      },
    ],
    category: {
      type: String,
      enum: ["bike", "shoe", "tower", "shirt", "cheese"],
      required: true,
    },
    gender: { type: String, enum: ["men", "women", "kids"], required: true },
    averageRate: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    cover: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
