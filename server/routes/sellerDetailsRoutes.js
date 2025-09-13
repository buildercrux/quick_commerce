import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { getMySellerDetails, upsertMySellerDetails, getNearbySellers } from '../controllers/sellerDetailsController.js'

const router = express.Router()

// Public route for getting nearby sellers (no authentication required)
router.get('/nearby', getNearbySellers)

// Protected routes - only logged-in users with role seller can access
router.use(protect, authorize('seller', 'admin'))

router.get('/me', getMySellerDetails)
router.put('/me', upsertMySellerDetails)

export default router



