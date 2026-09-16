const reviewsService = require("../services/reviews.service");
const { isValidString } = require("../utils/validateString");

// ======================================================
// CRIAR REVISÃO
// ======================================================
async function createReview(req, res) {
  const userId = req.userId;

  const { title, language, content, filename, analysisTypes } = req.body;

  if (
    !isValidString(title, 100) ||
    !isValidString(language, 30) ||
    !isValidString(content, 100000) ||
    !isValidString(filename, 255)
  ) {
    return res.status(400).json({
      error: "INVALID_DATA",
    });
  }

  try {
    const result = await reviewsService.createReview(
      userId,
      title,
      language,
      content,
      filename,
      analysisTypes,
    );

    return res.status(201).json({
      message: "SUCCESS",
      reviewId: result.reviewId,
      status: result.status,
    });
  } catch (error) {
    console.error("Create review error:", error);

    if (error.message === "INVALID_ANALYSIS_TYPE") {
      return res.status(400).json({
        error: "INVALID_ANALYSIS_TYPE",
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

// ======================================================
// CONSEGUIR REVISÕES
// ======================================================
async function getReviews(req, res) {
  const userId = req.userId;

  try {
    const reviews = await reviewsService.getReviews(userId);

    return res.json({
      message: "SUCCESS",
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

// ======================================================
// CONSEGUIR REVISÃO
// ======================================================
async function getReview(req, res) {
  const userId = req.userId;
  const reviewId = Number(req.params.reviewId);

  if (!Number.isInteger(reviewId) || reviewId <= 0) {
    return res.status(400).json({
      error: "INVALID_DATA",
    });
  }

  try {
    const review = await reviewsService.getReview(reviewId, userId);

    if (review === "NOT_FOUND") {
      return res.status(404).json({
        error: "NOT_FOUND",
      });
    }

    return res.json({
      message: "SUCCESS",
      review,
    });
  } catch (error) {
    console.error("Get review error:", error);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

// ======================================================
// DELETAR REVISÃO
// ======================================================
async function deleteReview(req, res) {
  const userId = req.userId;
  const reviewId = Number(req.params.reviewId);

  if (!Number.isInteger(reviewId) || reviewId <= 0) {
    return res.status(400).json({
      error: "INVALID_DATA",
    });
  }

  try {
    const result = await reviewsService.deleteReview(reviewId, userId);

    if (result === "NOT_FOUND") {
      return res.status(404).json({
        error: "NOT_FOUND",
      });
    }

    return res.json({
      message: "SUCCESS",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

// ======================================================

module.exports = {
  createReview,
  getReviews,
  getReview,
  deleteReview,
};
