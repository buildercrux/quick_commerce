/**
 * Banner Routes
 * Public and admin routes for banner management
 */

import express from 'express'
import {
  getBanners,
  getAllBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners
} from '../controllers/bannerController.js'
import { protect, authorize } from '../middleware/auth.js'
import { validateBanner } from '../middleware/validation.js'

const router = express.Router()

// Public routes
router.get('/', getBanners)

// Admin routes
router.use(protect, authorize('admin'))

router.get('/admin', getAllBanners)
router.get('/admin/:id', getBanner)
router.post('/admin', validateBanner, createBanner)
router.put('/admin/:id', validateBanner, updateBanner)
router.delete('/admin/:id', deleteBanner)
router.patch('/admin/:id/toggle', toggleBannerStatus)
router.put('/admin/reorder', reorderBanners)

export default router
