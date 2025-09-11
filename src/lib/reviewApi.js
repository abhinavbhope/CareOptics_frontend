
import axios from 'axios';

const reviewApiClient = axios.create({
  baseURL: '/api/reviews', // Use the proxy and correct base path
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add a request interceptor to include the token in headers for secured endpoints
reviewApiClient.interceptors.request.use(
  (config) => {
    // Check if window is defined (i.e., we are in the browser)
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


// --- Review API Functions ---

// Public endpoint, no token needed
export const getReviewsByProductId = (productId) => {
  return reviewApiClient.get(`/product/${productId}`);
};

// Secured endpoint, interceptor will add token
export const addReview = (reviewData) => {
  return reviewApiClient.post('', reviewData);
};

// Secured endpoint
export const updateReview = (reviewId, reviewData) => {
  return reviewApiClient.put(`/${reviewId}`, reviewData);
};

// Secured endpoint
export const deleteReview = (reviewId) => {
  return reviewApiClient.delete(`/${reviewId}`);
};

// Secured endpoint
export const getMyReviews = () => {
  return reviewApiClient.get('/my');
};

    