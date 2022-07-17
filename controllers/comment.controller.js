const sendResponse = require("../helpers/sendResponse");
const Cart = require("../models/Cart");
const Comment = require("../models/Comment");

const commentController = {};
commentController.createComment = async (req, res, next) => {
  let result;
  try {
    const author = req.currentUser._id;
    let { content } = req.body;
    const { productId } = req.params;
    if (!author || !productId || !content) throw new Error("need inputs");
    if (content.trim().split(" ").length < 10) {
      throw new Error("please add content at least 10 words");
    }
    const found = await Cart.findOne({
      owner: author,
      status: "paid",
      "products.productId": productId,
    });
    if (!found) throw new Error("pay first comment later");
    const newComment = {
      author,
      content,
      targetProduct: productId,
    };
    result = await Comment.create(newComment);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Create comment successfully"
  );
};

module.exports = commentController;
