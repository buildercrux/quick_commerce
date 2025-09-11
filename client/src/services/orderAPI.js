/**
 * Order API Service
 * Order-related API calls
 */

import api from './api'

const orderAPI = {
  // Create order
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Get user orders
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/orders?${queryParams.toString()}`)
  },
  
  // Get single order
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  
  // Cancel order
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
  
  // Request return
  requestReturn: (orderId, returnData) => api.post(`/orders/${orderId}/return`, returnData),
  
  // Track order
  trackOrder: (orderId) => api.get(`/orders/${orderId}/track`),
}

export default orderAPI






