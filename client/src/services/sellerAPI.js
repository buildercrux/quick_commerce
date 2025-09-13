/**
 * Seller API Service
 * Handles all seller-related API calls
 */

import api from './api'

const sellerAPI = {
  // Seller authentication
  register: (sellerData) => api.post('/sellers/register', sellerData),
  login: (credentials) => api.post('/sellers/login', credentials),
  logout: () => api.post('/sellers/logout'),
  
  // Seller profile
  getProfile: () => api.get('/sellers/me'),
  updateProfile: (profileData) => api.patch('/sellers/me', profileData),
  
  // Dashboard
  getDashboardStats: () => api.get('/sellers/dashboard'),
 
  // Seller details (linked to user)
  getSellerDetails: () => api.get('/seller-details/me'),
  upsertSellerDetails: (details) => api.put('/seller-details/me', details),
  
  // Products
  getProducts: (params = {}) => api.get('/seller/products', { params }),
  getProduct: (productId) => api.get(`/seller/products/${productId}`),
  createProduct: (productData) => api.post('/seller/products', productData),
  updateProduct: (productId, productData) => api.put(`/seller/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/seller/products/${productId}`),
  
  // Product images
  uploadImages: (productId, formData) => api.post(`/seller/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (productId, imageId) => api.delete(`/seller/products/${productId}/images/${imageId}`),
  setPrimaryImage: (productId, imageId) => api.patch(`/seller/products/${productId}/images/${imageId}/primary`),
  
  // Analytics
  getProductAnalytics: () => api.get('/seller/products/analytics'),
  
  // Orders
  getOrders: (params = {}) => api.get('/seller/orders', { params }),
  getOrder: (orderId) => api.get(`/seller/orders/${orderId}`),
  updateOrderStatus: (orderId, status) => api.patch(`/seller/orders/${orderId}/status`, { status })
}

export default sellerAPI
