
import axios from 'axios';

const productApiClient = axios.create({
  baseURL: '/api/products', // Use the proxy and correct base path
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = (filters = {}) => {
  return productApiClient.get('/filterPage', { params: filters }).then(res => res.data);
};

export const getAllProducts = () => {
    return productApiClient.get('/allItems');
};


export const getProductById = (id) => {
    return productApiClient.get(`/${id}`);
};

// Admin-specific functions that will require authentication later
// For now, they use the same public client. We can refactor this when building the admin dashboard.
export const addProduct = (productData) => {
    return productApiClient.post('/', productData);
};

export const updateProduct = (id, productData) => {
    return productApiClient.put(`/${id}`, productData);
};

export const deleteProduct = (id) => {
    return productApiClient.delete(`/${id}`);
};
