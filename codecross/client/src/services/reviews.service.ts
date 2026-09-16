import {
  createReviewRequest,
  deleteReviewRequest,
  getReviewRequest,
  getReviewsRequest,
  type CreateReviewData,
} from "../api/reviews.api";

export async function createReview(data: CreateReviewData) {
  const response = await createReviewRequest(data);

  return response.data;
}

export async function getReviews() {
  const response = await getReviewsRequest();

  return response.data.reviews;
}

export async function getReview(reviewId: number) {
  const response = await getReviewRequest(reviewId);

  return response.data.review;
}

export async function deleteReview(reviewId: number) {
  const response = await deleteReviewRequest(reviewId);

  return response.data;
}
