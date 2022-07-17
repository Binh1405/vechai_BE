const express = require("express");
const router = express.Router();

const {
  createCart,
  addProductToCart,
  getSingleCart,
  payCart,
  deleteCart,
  getAll,
  getAllOwn,
  addOneProduct,
  removeWholeProductCart,
  subtractOneFromCart,
} = require("../controllers/cart.controller");
const authenticationMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
router.post("/:productId", authenticationMiddleware, createCart);
router.put(
  "/addProductCart/:productId",
  authenticationMiddleware,
  addProductToCart
);
router.put("/addOneProduct/:productId", authenticationMiddleware, addOneProduct)
router.delete(
  "/subtractOneProduct/:productId",
  authenticationMiddleware,
  subtractOneFromCart
);
router.delete("/removeProductFromCart/:productId", authenticationMiddleware, removeWholeProductCart)
router.delete("/:cartId", authenticationMiddleware, deleteCart);
router.get("/", authenticationMiddleware, isAdmin, getAll);
router.get("/myCart", authenticationMiddleware, getAllOwn);
router.get("/:cartId", authenticationMiddleware, getSingleCart);
router.put("/payment/:cartId", authenticationMiddleware, payCart);
module.exports = router;
