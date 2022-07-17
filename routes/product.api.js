const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProduct,
  updateProduct,
  getSingleProduct,
  deleteProduct,
  rateProduct,
} = require("../controllers/product.controller");
const authenticationMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");

router.get("/", getAllProduct); //public
router.get("/:productId", getSingleProduct); //public
router.post("/", authenticationMiddleware, isAdmin, createProduct); //admin
router.put("/:productId", authenticationMiddleware, isAdmin, updateProduct); //admin
router.put("/:productId/rate", authenticationMiddleware, rateProduct); //authenticated
router.delete("/:productId", authenticationMiddleware, isAdmin, deleteProduct); //admin

module.exports = router;
