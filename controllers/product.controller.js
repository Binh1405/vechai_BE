const sendResponse = require("../helpers/sendResponse");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Comment = require("../models/Comment");

const productController = {};

productController.createProduct = async (req, res, next) => {
  console.log("req", req);
  const { name } = req.body;
  let { price, stock, category } = req.body;
  console.log("new product", name, price, stock, category, gender);
  let result;
  try {
    if (!name || !price || !stock || category || gender) {
      throw new Error("missing info");
    }
    price = parseInt(price);
    stock = parseInt(stock);
    if (
      typeof price !== "number" ||
      price < 0 ||
      typeof stock !== "number" ||
      stock < 0
    ) {
      throw new Error("price or stock invalid");
    }
    const newProduct = {
      name,
      price,
      stock,
    };
    console.log("this is new product created", newProduct);
    result = await Product.create(newProduct);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "successfully create a new product"
  );
};

productController.getAllProduct = async (req, res, next) => {
  let { limit, page, ...filter } = req.query;
  limit = parseInt(req.query.limit) || 10;
  page = parseInt(req.query.page) || 1;
  let count = 0;
  let result;
  try {
    result = await Product.find({ ...filter, isDeleted: false })
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
    "Successfully get all products"
  );
};
productController.updateProduct = async (req, res, next) => {
  let result;
  const allowOptions = ["name", "price", "stock"];
  const updateObject = {};
  const { productId } = req.params;
  console.log("productId", productId);
  try {
    allowOptions.forEach((option) => {
      if (req.body[option] !== undefined) {
        updateObject[option] = req.body[option];
      }
    });
    if (!productId) throw new Error("this product can not be found");
    result = await Product.findByIdAndUpdate(productId, updateObject, {
      new: true,
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
    "Successfully update this product"
  );
};
productController.getSingleProduct = async (req, res, next) => {
  let result = {};
  const { productId } = req.params;
  try {
    if (!productId) throw new Error("this product is not found");
    result = await Product.findById(productId, { isDeleted: false });
    comments = await Comment.find({ targetProduct: productId }).populate(
      "author",
      "content"
    );
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully get this single product"
  );
};
productController.deleteProduct = async (req, res, next) => {
  let result;
  try {
    const { productId } = req.params;
    if (!productId) throw new Error("this product is not found");
    result = await Product.findByIdAndUpdate(
      productId,
      { isDeleted: true },
      { new: true }
    );
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully delete this product"
  );
};
productController.rateProduct = async (req, res, next) => {
  let result;
  try {
    const author = req.currentUser._id;
    let { rate } = req.body;
    const { productId } = req.params;
    const found = await Product.findById(productId);
    if (!found) throw new Error("this product is not found");
    const isPaid = await Cart.findOne({
      owner: author,
      status: "paid",
      "products.productId": productId,
    });
    console.log("test", isPaid);
    if (!isPaid) throw new Error("you have to buy first in order to rate");
    rate = parseInt(rate);
    if (!rate || typeof rate !== "number" || rate < 1) {
      throw new Error("Invalid rate");
    }
    const newRating = { rate, author };
    found.ratings.push(newRating);
    let newAverate = found.ratings.reduce((acc, cur) => acc + cur.rate, 0);
    newAverate /= found.ratings.length;
    result = await Product.findByIdAndUpdate(
      productId,
      {
        ratings: found.ratings,
        averageRate: newAverate,
      },
      {
        new: true,
      }
    );
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully rate the product"
  );
};

module.exports = productController;
