
import axios from 'axios';

const productApiClient = axios.create({
  baseURL: '/api/products', // Use the proxy and correct base path
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (filters = {}) => {
  const response = await productApiClient.get('/filterPage', { params: filters });
  return response.data;
};

export const getAllProducts = async () => {
    const response = await productApiClient.get('/allItems');
    return response.data;
};


export const getProductById = async (id) => {
    const response = await productApiClient.get(`/${id}`);
    return response.data;
};

// Admin-specific functions that will require authentication later
// For now, they use the same public client. We can refactor this when building the admin dashboard.
export const addProduct = async (productData) => {
    const response = await productApiClient.post('/', productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await productApiClient.put(`/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await productApiClient.delete(`/${id}`);
    return response.data;
};

