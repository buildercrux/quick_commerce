/**
 * Validation Middleware
 * Express-validator middleware for request validation
 */

import { body, validationResult } from 'express-validator'

/**
 * Banner validation rules
 */
export const validateBanner = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Banner title is required')
    .isLength({ max: 100 })
    .withMessage('Banner title cannot be more than 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Banner description is required')
    .isLength({ max: 200 })
    .withMessage('Banner description cannot be more than 200 characters'),
  
  body('imageUrl')
    .isURL()
    .withMessage('Please provide a valid image URL'),
  
  body('buttonText')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Button text cannot be more than 50 characters'),
  
  body('buttonLink')
    .optional()
    .isURL()
    .withMessage('Please provide a valid button link URL'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be between 1 and 10'),
  
  body('targetAudience')
    .optional()
    .isIn(['all', 'new_users', 'returning_users', 'premium_users'])
    .withMessage('Invalid target audience'),
  
  body('category')
    .optional()
    .isIn(['electronics', 'fashion', 'home', 'beauty', 'sports', 'books', 'general'])
    .withMessage('Invalid category'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date')
      }
      return true
    })
]

/**
 * Homepage Section validation rules
 */
export const validateHomepageSection = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Section title is required')
    .isLength({ max: 100 })
    .withMessage('Section title cannot be more than 100 characters'),
  
  body('type')
    .isIn(['category', 'featured', 'custom', 'banner'])
    .withMessage('Invalid section type'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot be more than 50 characters'),
  
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean value'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  
  body('bannerImage')
    .optional()
    .isURL()
    .withMessage('Please provide a valid banner image URL'),
  
  body('bannerLink')
    .optional()
    .isURL()
    .withMessage('Please provide a valid banner link URL')
]

/**
 * Product validation rules
 */
export const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot be more than 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot be more than 2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Product category is required')
    .isLength({ max: 50 })
    .withMessage('Category cannot be more than 50 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Invalid product status')
]

/**
 * User validation rules
 */
export const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['customer', 'vendor', 'admin'])
    .withMessage('Invalid user role')
]

/**
 * Generic validation error handler
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()
}
