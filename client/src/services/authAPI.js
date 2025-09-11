/**
 * Auth API Service
 * Authentication-related API calls
 */

import api, { authCheckApi } from './api'

const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Logout user
  logout: () => api.post('/auth/logout'),
  
  // Get current user (using authCheckApi to avoid redirects)
  getCurrentUser: () => authCheckApi.get('/auth/me'),
  
  // Update profile
  updateProfile: (profileData) => {
    const formData = new FormData()
    
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key])
      }
    })
    
    return api.put('/auth/update-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Update password
  updatePassword: (passwordData) => api.put('/auth/update-password', passwordData),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (resetData) => api.put('/auth/reset-password', resetData),
  
  // Refresh token
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  // Seller auth
  registerSeller: (sellerData) => api.post('/sellers/register', sellerData),
  loginSeller: (credentials) => api.post('/sellers/login', credentials),
  logoutSeller: () => api.post('/sellers/logout'),
}

export default authAPI

