const express = require("express");

const {
  createReview,
  getReviews,
  getReview,
  deleteReview,
} = require("../controllers/reviews.controller");

const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/", authenticateToken, createReview);
router.get("/", authenticateToken, getReviews);
router.get("/:reviewId", authenticateToken, getReview);
router.delete("/:reviewId", authenticateToken, deleteReview);

module.exports = router;
