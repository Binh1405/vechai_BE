const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = Schema(
  {
    owner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    status: { type: String, enum: ["active", "paid"], default: "active" },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        qty: { type: Number, required: true, default: 1 },
        price: {type: Number, required: true},
      },
    ],
    totalPrice: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
