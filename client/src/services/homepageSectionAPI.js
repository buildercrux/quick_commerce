/**
 * Homepage Section API Service
 * API calls for homepage sections management
 */

import api from './api'

const homepageSectionAPI = {
  // Get all homepage sections (public)
  getHomepageSections: (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    return api.get(`/homepage-sections?${queryParams.toString()}`)
  },
  
  // Get single homepage section (public)
  getHomepageSection: (sectionId) => api.get(`/homepage-sections/${sectionId}`),
  
  // Admin: Get all homepage sections
  getAllHomepageSections: () => api.get('/admin/homepage-sections'),
  
  // Admin: Create homepage section
  createHomepageSection: (sectionData) => api.post('/admin/homepage-sections', sectionData),
  
  // Admin: Update homepage section
  updateHomepageSection: (sectionId, sectionData) => api.put(`/admin/homepage-sections/${sectionId}`, sectionData),
  
  // Admin: Delete homepage section
  deleteHomepageSection: (sectionId) => api.delete(`/admin/homepage-sections/${sectionId}`),
  
  // Admin: Add product to section
  addProductToSection: (sectionId, productId) => api.post(`/admin/homepage-sections/${sectionId}/products`, { productId }),
  
  // Admin: Remove product from section
  removeProductFromSection: (sectionId, productId) => api.delete(`/admin/homepage-sections/${sectionId}/products/${productId}`),
  
  // Admin: Reorder products in section
  reorderProductsInSection: (sectionId, productIds) => api.put(`/admin/homepage-sections/${sectionId}/products/reorder`, { productIds }),
  
  // Admin: Reorder sections
  reorderSections: (sectionOrders) => api.put('/admin/homepage-sections/reorder', { sectionOrders })
}

export default homepageSectionAPI