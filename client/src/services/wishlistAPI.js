/**
 * Wishlist API Service
 * Handles wishlist-related API calls
 */

import api from './api'

const API_BASE_URL = '/wishlist'

export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async () => {
    const response = await api.get(API_BASE_URL)
    return response.data
  },

  // Add product to wishlist
  addToWishlist: async (productId) => {
    console.log('Adding product to wishlist:', productId)
    const response = await api.post(`${API_BASE_URL}/${productId}`)
    return response.data
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`${API_BASE_URL}/${productId}`)
    return response.data
  },

  // Check if product is in wishlist
  checkWishlist: async (productId) => {
    const response = await api.get(`${API_BASE_URL}/check/${productId}`)
    return response.data
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    const response = await api.delete(API_BASE_URL)
    return response.data
  }
}

export default wishlistAPI
