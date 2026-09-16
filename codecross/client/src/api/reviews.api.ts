import api from "./axios";

export type CreateReviewData = {
  title: string;
  language: string;
  content: string;
  filename: string;
  analysisTypes: string[];
};

export const createReviewRequest = (data: CreateReviewData) => {
  return api.post("/reviews", data);
};

export const getReviewsRequest = () => {
  return api.get("/reviews");
};

export const getReviewRequest = (reviewId: number) => {
  return api.get(`/reviews/${reviewId}`);
};

export const deleteReviewRequest = (reviewId: number) => {
  return api.delete(`/reviews/${reviewId}`);
};