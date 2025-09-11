/**
 * Seller Routes
 * Handles seller-related API endpoints
 */

import express from 'express'
import {
  registerSeller,
  loginSeller,
  getMe,
  updateProfile,
  getDashboardStats,
  logoutSeller
} from '../controllers/sellerController.js'
import {
  getSellers,
  getSeller,
  updateSellerStatus,
  deleteSeller
} from '../controllers/sellerController.js'
import { protect, authorize } from '../middleware/auth.js'
import { body } from 'express-validator'

const router = express.Router()

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('storeName')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  body('storeDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Store description cannot exceed 500 characters'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required'),
  body('address.country')
    .optional()
    .trim()
    .default('India'),
  body('geo.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers [longitude, latitude]'),
  body('geo.coordinates.*')
    .isNumeric()
    .withMessage('Coordinates must be numbers'),
  body('serviceRadiusKm')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Service radius must be between 1 and 100 km')
]

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('storeName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  body('storeDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Store description cannot exceed 500 characters'),
  body('address.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.pincode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pincode is required'),
  body('geo.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers [longitude, latitude]'),
  body('geo.coordinates.*')
    .optional()
    .isNumeric()
    .withMessage('Coordinates must be numbers'),
  body('serviceRadiusKm')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Service radius must be between 1 and 100 km')
]

// Public routes
router.post('/register', registerValidation, registerSeller)
router.post('/login', loginValidation, loginSeller)

// Protected routes (Seller only)
router.use(protect) // All routes below this middleware are protected

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

router.get('/me', authenticateSeller, getMe)
router.patch('/me', authenticateSeller, updateProfileValidation, updateProfile)
router.get('/dashboard', authenticateSeller, getDashboardStats)
router.post('/logout', authenticateSeller, logoutSeller)

// Admin routes
router.get('/', authorize('admin'), getSellers)
router.get('/:id', authorize('admin'), getSeller)
router.patch('/:id/status', authorize('admin'), updateSellerStatus)
router.delete('/:id', authorize('admin'), deleteSeller)

export default router
