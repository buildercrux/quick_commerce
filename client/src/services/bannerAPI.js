/**
 * Banner API Service
 * Handles banner-related API calls
 */

import api from './api'

const bannerAPI = {
  // Get all active banners (public)
  getBanners: () => api.get('/banners'),
  
  // Admin banner operations
  getAllBanners: (params = {}) => api.get('/admin/banners', { params }),
  getBanner: (id) => api.get(`/admin/banners/${id}`),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  toggleBannerStatus: (id) => api.patch(`/admin/banners/${id}/toggle`),
  reorderBanners: (bannerOrders) => api.put('/admin/banners/reorder', { bannerOrders })
}

export default bannerAPI
