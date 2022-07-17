const Cart = require("../models/Cart");
const Product = require("../models/Product");
const sendResponse = require("../helpers/sendResponse");
const User = require("../models/User");
const mongoose = require("mongoose");

const cartController = {};
cartController.createCart = async (req, res, next) => {
  let result;
  try {
    const owner = req.currentUser._id;
    const { productId } = req.params;
    let { qty } = req.body;
    qty = parseInt(qty);
    if (!productId || typeof qty !== "number") {
      throw new Error("missing info");
    }
    if (qty < 0) {
      throw new Error("qty is invalid");
    }
    let activeCart = await Cart.findOne({ owner, status: "active" });
    if (activeCart) {
      const found = await Product.findById(productId);
      if (!found) throw new Error("this product can not be found");
      const productChoice = { productId, qty };
      const productArray = activeCart.products.map((product) => {
        if (
          mongoose.Types.ObjectId(product.productId).toString() === productId
        ) {
          product.qty += qty;
        }
        return product;
      });
      activeCart.products = productArray;
      result = activeCart;
      await activeCart.save();
    }
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    { result },
    false,
    "Successfully create a shopping cart"
  );
};

cartController.addProductToCart = async (req, res, next) => {
  const owner = req.currentUser._id;
  let result;
  const addedProduct = req.body;
  const { productId } = addedProduct;
  let { qty, price } = addedProduct;
  qty = parseInt(qty);
  price = parseInt(price);
  try {
    let cart = await Cart.findOne({ owner, status: "active" });
    console.log("current cart", cart)
    if (cart) {
      const existingProductIndex = cart.products.findIndex(
        (p) => mongoose.Types.ObjectId(p.productId).toString() == productId
      );
      console.log("existingProductIndex", existingProductIndex)
      if (existingProductIndex >= 0) {
        const existingProduct = cart.products[existingProductIndex];
        existingProduct.qty += qty;
        cart.totalPrice += price;
      } else {
        cart.products.push(addedProduct);
        cart.totalPrice += price;
      }
    } else {
      cart = await Cart.create({ owner, status: "active" });
      cart.products.push(addedProduct);
      cart.totalPrice = price;
    }
    await cart.save();
    console.log("cart", cart)
    result = await Cart.findByIdAndUpdate(cart._id, cart, { new: true });
    await result.save()
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "successfully add product to card"
  );
};

cartController.subtractOneFromCart = async (req, res, next) => {
  let result;
  let { productId } = req.params;
  let owner = req.currentUser._id;
  try {
    const cartFound = await Cart.findOne({ owner, status: "active" });
    const newProductsList = cartFound.products.filter((existed) => {
      if (existed.productId.equals(productId)) {
        existed.qty -= 1;
        cartFound.totalPrice -= existed.price 
      }
      return existed.qty > 0;
    });
    cartFound.products = newProductsList;
    await cartFound.save();
    result = await Cart.findByIdAndUpdate(cartFound._id, cartFound, {
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
    `Successfully remove product from cart`
  );
};
cartController.addOneProduct = async(req, res, next) => {
  let result;
  let {productId} = req.body
  let owner = req.currentUser._id
  try {
    const cartFound = await Cart.findOne({owner, status: "active"})

    const newProductsList = cartFound.products.filter((existed) => {
  
      if(existed.productId.equals(productId)){
      existed.qty += 1;
      cartFound.totalPrice += existed.price
      }
      return true
    })
    cartFound.products = newProductsList
    await cartFound.save()
    console.log("cartFound", cartFound)
    result = await Cart.findByIdAndUpdate(cartFound._id, cartFound, {
      new: true
    })
  } catch (error) {
    return next(error)
  }
  return sendResponse(res, 200, true, result, false, "Successfully add 1 product")
}

cartController.removeWholeProductCart = async(req, res, next)=>{
  let result
  let {productId} = req.params;
  console.log("productId", productId)
  let owner = req.currentUser._id
  try {
    const cartFound = await Cart.findOne({owner, status: "active"})
    console.log("cartFound", cartFound)
    const isExisting = cartFound.products.findIndex((p) => p.productId.equals(productId))
    console.log("isExisting", isExisting)
    if(isExisting >= 0){
      const isExistingProduct = cartFound.products[isExisting]
      console.log("isExistingProduct", isExistingProduct)
      let {qty, price} = isExistingProduct
      let subTotal = qty*price
      cartFound.products.splice(isExisting, 1);
      cartFound.totalPrice -= subTotal
    }
    await cartFound.save()
    console.log("new Cart", cartFound)
    result = await Cart.findByIdAndUpdate(cartFound._id, cartFound, {new: true})
  } catch (error) {
    return next(error)
  }
  return sendResponse(res, 200, true, result, false, "Successfully remove a whole product from cart")
}

cartController.getSingleCart = async (req, res, next) => {
  let result;
  const { cartId } = req.params;
  const owner = req.currentUser._id;
  try {
    console.log(owner, cartId);
    result = await Cart.findOne({ owner, _id: cartId }).populate(
      "products.productId"
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
    "Successfully get single shopping cart"
  );
};
cartController.payCart = async (req, res, next) => {
  let result = {};
  console.log("req", req);
  const { cartId } = req.params;
  console.log("currentUser", req.currentUser);
  const { currentBalance, _id } = req.currentUser;
  console.log("_id", _id);
  try {
    let found = await Cart.findById(cartId).populate("products.productId");
    console.log("found", found);
    const productsToUpdate = await Promise.all(
      found.products.map(async (request) => {
        console.log("request", request);
        const existed = await Product.findById(request.productId._id);
        console.log("existed", existed);
        let newStock = existed.stock;
        if (request.qty <= existed.stock) {
          newStock = existed.stock - request.qty;
        } else {
          console.log(
            "Sole out",
            request.productId.name,
            request.qty,
            existed.stock
          );
          throw new Error("Sold out product");
        }
        return { _id: existed._id, newStock };
      })
    );
    const total = found.products.reduce(
      (acc, cur) => acc + cur.qty * cur.productId.price,
      0
    );
    if (found.status === "paid") throw new Error("cart already paid");
    if (total > currentBalance)
      throw new Error("404 - You dont have enough money");
    const newBalance = currentBalance - total;
    result.cart = await Cart.findByIdAndUpdate(
      cartId,
      { status: "paid" },
      { new: true }
    );
    const user = await User.findByIdAndUpdate(
      _id,
      { currentBalance: newBalance },
      { new: true }
    );
    result.currentBalance = user.currentBalance;
    await Promise.all(
      productsToUpdate.map(async (product) => {
        await Product.findByIdAndUpdate(product._id, {
          stock: product.newStock,
        });
      })
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
    "Successfully pay for your shopping cart"
  );
};
cartController.deleteCart = async (req, res, next) => {
  let result;
  const { cartId } = req.params;
  const owner = req.currentUser._id;
  try {
    result = await Cart.findOneAndUpdate(
      { _id: cartId, owner },
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
    "Successfully delete this shopping cart"
  );
};
cartController.getAll = async (req, res, next) => {
  let result = {};
  try {
    result.carts = await Cart.find({}).populate([
      "owner",
      "products.productId",
    ]);
    result.count = result.carts.length;
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully get all carts of users"
  );
};
cartController.getAllOwn = async (req, res, next) => {
  let result = {};
  let owner = req.currentUser._id;
  try {
    const cartFound = await Cart.findOne({ owner, status: "active" });
    console.log("cartFound", cartFound)
    if(cartFound === null){
        result.products = []
        result.totalPrice = 0
    }else{
      result = await Cart.findByIdAndUpdate(cartFound._id).populate("products.productId")
      await result.save()
    }
    console.log("result", result)
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully get my own cart"
  );
};
module.exports = cartController;
