/**
 * Admin Banner Routes
 * Admin-specific routes for banner management
 */

import express from 'express'
import {
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

// All routes require admin authentication
router.use(protect, authorize('admin'))

router.get('/', getAllBanners)
router.get('/:id', getBanner)
router.post('/', validateBanner, createBanner)
router.put('/:id', validateBanner, updateBanner)
router.delete('/:id', deleteBanner)
router.patch('/:id/toggle', toggleBannerStatus)
router.put('/reorder', reorderBanners)

export default router
