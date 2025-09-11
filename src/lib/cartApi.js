import axios from 'axios';

const cartApiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add auth token
cartApiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
cartApiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
      }
    }
    return Promise.reject(error);
  }
);

export const getCart = () => cartApiClient.get('/cart/me');

export const addToCart = (item) => 
  cartApiClient.post('/cart/me/items', item);

export const updateCartItem = (productId, quantity) =>
  cartApiClient.put(`/cart/me/items/${productId}`, null, { 
    params: { quantity } 
  });

export const removeFromCart = (productId) =>
  cartApiClient.delete(`/cart/me/items/${productId}`);

export const clearCart = () => cartApiClient.delete('/cart/me');

export default cartApiClient;