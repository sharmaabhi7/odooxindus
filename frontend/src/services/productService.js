import api from './api';

export const productService = {
  getProducts: async (params) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products', error);
      throw error;
    }
  },
  
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product', error);
      throw error;
    }
  },
  
  default: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create product', error);
      throw error;
    }
  },
  
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Failed to update product', error);
      throw error;
    }
  },
  
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete product', error);
      throw error;
    }
  }
};
