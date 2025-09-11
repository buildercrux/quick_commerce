/**
 * Vendor API Service
 * Vendor dashboard and management API calls
 */

import api from './api'

const vendorAPI = {
  // Get dashboard data
  getDashboard: () => api.get('/vendor/dashboard'),
  
  // Get vendor products
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/vendor/products?${queryParams.toString()}`)
  },
  
  // Get vendor orders
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/vendor/orders?${queryParams.toString()}`)
  },
  
  // Update order status
  updateOrderStatus: (orderId, statusData) => 
    api.put(`/vendor/orders/${orderId}/status`, statusData),
  
  // Get analytics
  getAnalytics: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/vendor/analytics?${queryParams.toString()}`)
  },
}

export default vendorAPI






