/**
 * Product API Service
 * Product-related API calls
 */

import api from './api'

const productAPI = {
  // Get all products with filters
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/products?${queryParams.toString()}`)
  },
  
  // Get single product
  getProduct: (productId) => api.get(`/products/${productId}`),
  
  // Get multiple products by IDs
  getProductsByIds: (productIds) => {
    const ids = Array.isArray(productIds) ? productIds.join(',') : productIds
    return api.get(`/products/batch?ids=${ids}`)
  },
  
  // Get featured products
  getFeaturedProducts: (limit = 10) => api.get(`/products/featured?limit=${limit}`),
  
  // Get categories
  getCategories: () => api.get('/products/categories'),
  
  // Search products
  searchProducts: (searchParams) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        queryParams.append(key, searchParams[key])
      }
    })
    
    return api.get(`/products/search?${queryParams.toString()}`)
  },
  
  // Create product (vendor/admin only)
  createProduct: (productData) => {
    const formData = new FormData()
    
    Object.keys(productData).forEach(key => {
      const value = productData[key]
      if (value === null || value === undefined) return

      if (key === 'images' && Array.isArray(value)) {
        // Separate new files from existing image objects
        const files = value.filter(v => v && (v instanceof File || (typeof v === 'object' && 'size' in v && 'name' in v)))
        const existing = value.filter(v => !(v && (v instanceof File || (typeof v === 'object' && 'size' in v && 'name' in v))))

        // Append files as multipart entries
        files.forEach(file => formData.append('images', file))

        // Send existing image metadata as JSON under a separate key to avoid duplicate field name collisions
        if (existing.length > 0) {
          formData.append('imagesMeta', JSON.stringify(existing))
        }
      } else if (key === 'specifications' || key === 'tags' || key === 'deliveryOptions' || key === 'inventory') {
        // JSON stringify nested objects
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    })
    
    // Debug: log what is being sent for create as well
    try {
      // eslint-disable-next-line no-console
      console.log('[createProduct] productData:', productData)
      const readable = {}
      for (const [k, v] of formData.entries()) {
        if (v && typeof v === 'object' && 'name' in v && 'size' in v) {
          readable[k] = `File(name=${v.name}, size=${v.size}, type=${v.type || 'unknown'})`
        } else {
          readable[k] = v
        }
      }
      // eslint-disable-next-line no-console
      console.log('[createProduct] formData (readable):', readable)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[createProduct] Failed to inspect FormData:', e)
    }

    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Update product (owner/admin only)
  updateProduct: (productId, productData) => {
    const formData = new FormData()
    
    Object.keys(productData).forEach(key => {
      const value = productData[key]
      if (value === null || value === undefined) return

      if (key === 'images' && Array.isArray(value)) {
        // Separate new files from existing image objects
        const files = value.filter(v => v && (v instanceof File || (typeof v === 'object' && 'size' in v && 'name' in v)))
        const existing = value.filter(v => !(v && (v instanceof File || (typeof v === 'object' && 'size' in v && 'name' in v))))

        // Append files as multipart entries
        files.forEach(file => formData.append('images', file))

        // Send existing image metadata as JSON in the body under the same key
        if (existing.length > 0) {
          formData.append('images', JSON.stringify(existing))
        }
      } else if (key === 'specifications' || key === 'tags' || key === 'deliveryOptions' || key === 'images' || key === 'inventory') {
        // JSON stringify nested objects/arrays
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    })

    // Debug: log what is being sent
    try {
      // Log original productData
      // eslint-disable-next-line no-console
      console.log('[updateProduct] productData:', productData)

      // Build a readable snapshot of FormData
      const readable = {}
      for (const [k, v] of formData.entries()) {
        if (v && typeof v === 'object' && 'name' in v && 'size' in v) {
          // Likely a File/Blob
          readable[k] = `File(name=${v.name}, size=${v.size}, type=${v.type || 'unknown'})`
        } else {
          readable[k] = v
        }
      }
      // eslint-disable-next-line no-console
      console.log('[updateProduct] formData (readable):', readable)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[updateProduct] Failed to inspect FormData:', e)
    }
    
    return api.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Delete product (owner/admin only)
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
  
}

export default productAPI


