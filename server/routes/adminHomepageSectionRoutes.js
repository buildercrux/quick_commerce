/**
 * Admin Homepage Section Routes
 * Admin routes for managing dynamic homepage sections
 */

import express from 'express'
import {
  getAllHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  addProductToSection,
  removeProductFromSection,
  reorderProductsInSection,
  reorderSections
} from '../controllers/homepageSectionController.js'
import { protect, authorize } from '../middleware/auth.js'
import { body } from 'express-validator'

const router = express.Router()

// Apply protection and admin authorization to all routes
router.use(protect)
router.use(authorize('admin'))

// Validation middleware
const validateSection = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('type')
    .isIn(['category', 'featured', 'custom', 'banner'])
    .withMessage('Type must be one of: category, featured, custom, banner'),
  body('category')
    .optional()
    .trim()
    .toLowerCase(),
  body('maxProducts')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max products must be between 1 and 20'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('bannerText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Banner text cannot be more than 200 characters')
]

// Section management routes
router.get('/', getAllHomepageSections)
router.post('/', validateSection, createHomepageSection)
router.put('/:id', validateSection, updateHomepageSection)
router.delete('/:id', deleteHomepageSection)

// Product management routes
router.post('/:id/products', [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID')
], addProductToSection)

router.delete('/:id/products/:productId', removeProductFromSection)

router.put('/:id/products/reorder', [
  body('productIds')
    .isArray()
    .withMessage('Product IDs must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('Product IDs array cannot be empty')
      }
      return true
    })
], reorderProductsInSection)

// Section reordering
router.put('/reorder', [
  body('sectionOrders')
    .isArray()
    .withMessage('Section orders must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('Section orders array cannot be empty')
      }
      return true
    })
], reorderSections)

export default router





