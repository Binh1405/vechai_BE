const express = require("express");
const { createComment } = require("../controllers/comment.controller");
const router = express.Router();
const authenticationMiddleware = require("../middlewares/auth.middleware");

router.post("/:productId", authenticationMiddleware, createComment);
router.get("/:productId"); //get all comment of a product
router.put("/:commentId"); //update a comment
router.delete("/:commentId"); //delete a comment

module.exports = router;
