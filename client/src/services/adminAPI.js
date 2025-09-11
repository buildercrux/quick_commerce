/**
 * Admin API Service
 * Admin dashboard and management API calls
 */

import api from './api'

const adminAPI = {
  // Get dashboard data
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Get users
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/admin/users?${queryParams.toString()}`)
  },
  
  // Update user
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  
  // Get analytics
  getAnalytics: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/admin/analytics?${queryParams.toString()}`)
  },
  
  // Get orders
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/admin/orders?${queryParams.toString()}`)
  },

  // Sellers management
  getSellers: (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    return api.get(`/sellers?${queryParams.toString()}`)
  },
  getSeller: (sellerId) => api.get(`/sellers/${sellerId}`),
  updateSellerStatus: (sellerId, data) => api.patch(`/sellers/${sellerId}/status`, data),
  deleteSeller: (sellerId) => api.delete(`/sellers/${sellerId}`),
}

export default adminAPI






