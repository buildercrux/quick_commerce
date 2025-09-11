/**
 * Product Routes
 * API routes for product management
 */

import express from 'express'
import { body, query } from 'express-validator'
import { protect, authorize, optionalAuth } from '../middleware/auth.js'
import { uploadMultiple } from '../middleware/upload.js'
import {
  getProducts,
  getProduct,
  getProductsByIds,
  getFeaturedProducts,
  getCategories,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'

const router = express.Router()

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products with filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price_low, price_high, rating, popular]
 *           default: newest
 *       - in: query
 *         name: delivery
 *         schema:
 *           type: string
 *           enum: [instant, nextDay, standard]
 *         description: Filter products by delivery speed
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Min rating must be between 0 and 5'),
  query('sortBy')
    .optional()
    .isIn(['newest', 'oldest', 'price_low', 'price_high', 'rating', 'popular'])
    .withMessage('Invalid sort option'),
  query('delivery')
    .optional()
    .isIn(['instant', 'nextDay', 'standard'])
    .withMessage('Invalid delivery option')
], optionalAuth, getProducts)

/**
 * @swagger
 * /api/v1/products/batch:
 *   get:
 *     summary: Get multiple products by IDs
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated product IDs
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid product IDs
 */
router.get('/batch', [
  query('ids')
    .notEmpty()
    .withMessage('Product IDs are required')
], getProductsByIds)

/**
 * @swagger
 * /api/v1/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/featured', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], getFeaturedProducts)

/**
 * @swagger
 * /api/v1/products/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', getCategories)

/**
 * @swagger
 * /api/v1/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], optionalAuth, searchProducts)

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get single product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', optionalAuth, getProduct)

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to create products
 */
// Parse multipart before validation so validators see req.body
router.post('/', protect, authorize('vendor', 'admin'), uploadMultiple('images', 10), [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
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
], createProduct)

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update this product
 *       404:
 *         description: Product not found
 */
router.put('/:id', protect, authorize('vendor', 'admin'), uploadMultiple('images', 10), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
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
], updateProduct)

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete this product
 *       404:
 *         description: Product not found
 */
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct)


export default router