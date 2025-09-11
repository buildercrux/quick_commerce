/**
 * Homepage Section Routes
 * Routes for managing dynamic homepage sections
 */

import express from 'express'
import { query } from 'express-validator'
import {
  getHomepageSections,
  getHomepageSection
} from '../controllers/homepageSectionController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', [
  query('delivery')
    .optional()
    .isIn(['instant', 'nextDay', 'standard'])
    .withMessage('Invalid delivery option')
], getHomepageSections)
router.get('/:id', getHomepageSection)

export default router



