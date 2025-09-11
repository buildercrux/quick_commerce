/**
 * User API Service
 * User profile and preferences API calls
 */

import api from './api'

const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update user profile
  updateProfile: (profileData) => {
    const formData = new FormData()
    
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key])
      }
    })
    
    return api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Get shipping addresses
  getShippingAddresses: () => api.get('/users/addresses'),
  
  // Add shipping address
  addShippingAddress: (addressData) => api.post('/users/addresses', addressData),
  
  // Update shipping address
  updateShippingAddress: (addressId, addressData) => 
    api.put(`/users/addresses/${addressId}`, addressData),
  
  // Delete shipping address
  deleteShippingAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  
  // Update preferences
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
}

export default userAPI






