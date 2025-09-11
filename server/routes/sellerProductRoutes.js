/**
 * Seller Product Routes
 * Handles seller product management API endpoints
 */

import express from 'express'
import {
  getSellerProducts,
  getSellerProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  setPrimaryImage,
  getProductAnalytics
} from '../controllers/sellerProductController.js'
import { protect, authorize } from '../middleware/auth.js'
import { body } from 'express-validator'
import { uploadMultiple } from '../middleware/upload.js'

const router = express.Router()

// All routes are protected
router.use(protect)

// Seller authentication middleware
const authenticateSeller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    req.seller = req.user
    next()
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. Seller role required.'
    })
  }
}

// All routes require seller authentication
router.use(authenticateSeller)

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('inventory.trackQuantity')
    .optional()
    .isBoolean()
    .withMessage('Track quantity must be a boolean'),
  body('deliveryOptions.instant')
    .optional()
    .isBoolean()
    .withMessage('Instant delivery option must be a boolean'),
  body('deliveryOptions.nextDay')
    .optional()
    .isBoolean()
    .withMessage('Next day delivery option must be a boolean'),
  body('deliveryOptions.standard')
    .optional()
    .isBoolean()
    .withMessage('Standard delivery option must be a boolean')
]

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('inventory.trackQuantity')
    .optional()
    .isBoolean()
    .withMessage('Track quantity must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'archived'])
    .withMessage('Status must be one of: draft, active, inactive, archived'),
  body('deliveryOptions.instant')
    .optional()
    .isBoolean()
    .withMessage('Instant delivery option must be a boolean'),
  body('deliveryOptions.nextDay')
    .optional()
    .isBoolean()
    .withMessage('Next day delivery option must be a boolean'),
  body('deliveryOptions.standard')
    .optional()
    .isBoolean()
    .withMessage('Standard delivery option must be a boolean')
]

// Routes
router.get('/', getSellerProducts)
router.get('/analytics', getProductAnalytics)
router.get('/:id', getSellerProduct)
router.post('/', createProductValidation, createProduct)
router.put('/:id', updateProductValidation, updateProduct)
router.delete('/:id', deleteProduct)

// Image management routes
router.post('/:id/images', uploadMultiple('images', 5), uploadProductImages)
router.delete('/:id/images/:imageId', deleteProductImage)
router.patch('/:id/images/:imageId/primary', setPrimaryImage)

export default router
