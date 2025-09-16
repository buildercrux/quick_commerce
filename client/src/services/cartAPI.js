/**
 * Cart API Service
 */

import api from './api'

const cartAPI = {
  getMyCart: () => api.get('/cart/me'),
  replaceMyCart: (items) => api.put('/cart/me', { items }),
  addItem: (productId, quantity = 1) => api.post('/cart/me/items', { productId, quantity }),
  updateItem: (productId, quantity) => api.patch('/cart/me/items', { productId, quantity }),
  clear: () => api.delete('/cart/me'),
}

export default cartAPI


