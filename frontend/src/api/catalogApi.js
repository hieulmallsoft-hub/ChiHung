import axiosClient from "./axiosClient";

export const catalogApi = {
  getCategories() {
    return axiosClient.get("/api/public/categories");
  },
  getBrands() {
    return axiosClient.get("/api/public/brands");
  },
  getProducts(params) {
    return axiosClient.get("/api/public/products", { params });
  },
  getProductDetail(id) {
    return axiosClient.get(`/api/public/products/${id}`);
  },
  getRelatedProducts(id) {
    return axiosClient.get(`/api/public/products/${id}/related`);
  },
};
