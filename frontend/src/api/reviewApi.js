import axiosClient from "./axiosClient";

export const reviewApi = {
  createReview(payload) {
    return axiosClient.post("/api/reviews", payload);
  },
  getProductReviews(productId, params) {
    return axiosClient.get(`/api/reviews/product/${productId}`, { params });
  },
};
