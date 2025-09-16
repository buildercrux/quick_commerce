/**
 * API Service
 * Axios configuration and interceptors for API requests
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Resolve API base URL (env override > production URL > dev proxy)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD
    ? 'https://quick-commerce-seven.vercel.app/api/v1'
    : '/api/v1')

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create a separate instance for auth checks (no redirects)
const authCheckApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for main API
api.interceptors.request.use(
  (config) => {
    // Add request timestamp
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Request interceptor for auth check API
authCheckApi.interceptors.request.use(
  (config) => {
    // Add request timestamp
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime
    
    // Log slow requests in development
    if (import.meta.env.DEV && duration > 2000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`)
    }
    
    return response
  },
  (error) => {
    const { response } = error
    
    // Handle different error status codes
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login only if not already on login page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            // Clear any stored auth state
            localStorage.removeItem('authState')
            sessionStorage.clear()
            window.location.href = '/login'
            toast.error('Session expired. Please login again.')
          }
          break
          
        case 403:
          toast.error('You do not have permission to perform this action.')
          break
          
        case 404:
          toast.error('Resource not found.')
          break
          
        case 422:
          // Validation errors
          if (data.errors) {
            Object.values(data.errors).forEach(errorArray => {
              errorArray.forEach(error => toast.error(error))
            })
          } else {
            toast.error(data.message || 'Validation failed.')
          }
          break
          
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
          
        case 500:
          toast.error('Server error. Please try again later.')
          break
          
        default:
          toast.error(data.message || 'An error occurred.')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred.')
    }
    
    return Promise.reject(error)
  }
)

// Response interceptor for auth check API (no redirects)
authCheckApi.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime
    
    // Log slow requests in development
    if (import.meta.env.DEV && duration > 2000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`)
    }
    
    return response
  },
  (error) => {
    // For auth check API, don't redirect on 401 - just return the error
    return Promise.reject(error)
  }
)

// Helper functions (not needed for cookie-based auth)
export const setAuthToken = (token) => {
  // Not needed for cookie-based authentication
}

export const clearAuthToken = () => {
  // Not needed for cookie-based authentication
}

// Request helper functions
export const get = (url, config = {}) => api.get(url, config)
export const post = (url, data, config = {}) => api.post(url, data, config)
export const put = (url, data, config = {}) => api.put(url, data, config)
export const patch = (url, data, config = {}) => api.patch(url, data, config)
export const del = (url, config = {}) => api.delete(url, config)

// Function to setup delivery mode interceptor (called after store is created)
export const setupDeliveryModeInterceptor = (store) => {
  api.interceptors.request.use(
    (config) => {
      // Add request timestamp
      config.metadata = { startTime: new Date() }
      
      // Auto-append delivery mode to product GET requests only
      if (config.url?.startsWith('/products') && config.method === 'get') {
        const state = store.getState()
        const mode = state.products?.currentDeliveryMode
        const hasQuery = config.url.includes('?')
        if (!config.url.includes('delivery=') && mode && mode !== 'standard') {
          config.url += `${hasQuery ? '&' : '?'}delivery=${mode}`
        }
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}

export { authCheckApi }
export default api

