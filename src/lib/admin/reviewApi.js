
import axios from 'axios';

const adminReviewApiClient = axios.create({
  baseURL: '/api/reviews/admin',
});

adminReviewApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllReviews = () => {
    return adminReviewApiClient.get('/all');
};

export const getReviewById = (reviewId) => {
    return adminReviewApiClient.get(`/${reviewId}`);
};

export const updateReview = (reviewId, reviewData) => {
    return adminReviewApiClient.put(`/${reviewId}`, reviewData);
};

export const deleteReview = (reviewId) => {
    return adminReviewApiClient.delete(`/${reviewId}`);
};
