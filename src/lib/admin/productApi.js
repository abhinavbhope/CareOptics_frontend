import axios from 'axios';

// Create Axios instance for product API
const productApiClient = axios.create({
  baseURL: '/api/products',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token for admin operations
productApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken'); // token key in localStorage
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Public / non-auth requests
export const getProducts = (params) =>
  productApiClient
    .get('/filterPage', { params })
    .then(res => res.data) // extract payload
    .catch(err => {
      console.error('Product API error:', err);
      return { content: [], totalPages: 0, totalElements: 0 };
    });

export const getProductById = (id) => 
  productApiClient
    .get(`/${id}`)
    .then(res => res.data)
    .catch(err => {
      console.error(`Failed to fetch product ${id}:`, err);
      return null;
    });

// Admin-only operations (require JWT token)
export const addProduct = (productData, imageFile) => {
  const formData = new FormData();
  formData.append("product", JSON.stringify(productData)); // send JSON as string
  formData.append("image", imageFile); // send image file

  return productApiClient.post('/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }, // override default JSON
  })
  .then(res => res.data)
  .catch(err => {
    console.error('Add product failed:', err);
    throw err;
  });
};


export const updateProduct = async (id, productData) => {
    const res = await productApiClient.put(`/${id}`, productData);
    return res.data; // <-- return the updated ProductDTO
};


export const deleteProduct = (id) =>
  productApiClient
    .delete(`/${id}`)
    .then(res => res.data)
    .catch(err => {
      console.error(`Delete product ${id} failed:`, err);
      throw err;
    });
