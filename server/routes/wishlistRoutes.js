/**
 * Wishlist Routes
 * API routes for wishlist management
 */

import express from 'express'
import { param } from 'express-validator'
import { protect } from '../middleware/auth.js'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
} from '../controllers/wishlistController.js'

const router = express.Router()

// All routes are protected
router.use(protect)

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/', getWishlist)

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product added to wishlist
 *       400:
 *         description: Invalid product ID or product already in wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product or user not found
 */
router.post('/:productId', [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
], addToWishlist)

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *       400:
 *         description: Invalid product ID or product not in wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/:productId', [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
], removeFromWishlist)

/**
 * @swagger
 * /api/v1/wishlist/check/{productId}:
 *   get:
 *     summary: Check if product is in wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Wishlist status retrieved
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/check/:productId', [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
], checkWishlist)

/**
 * @swagger
 * /api/v1/wishlist:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/', clearWishlist)

export default router
