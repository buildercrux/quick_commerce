/**
 * Payment Routes
 * API routes for payment processing
 */

import express from 'express'
import { body } from 'express-validator'
import { protect } from '../middleware/auth.js'
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod
} from '../controllers/paymentController.js'

const router = express.Router()

// All routes are protected
router.use(protect)

/**
 * @swagger
 * /api/v1/payments/create-intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               currency:
 *                 type: string
 *                 default: usd
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
router.post('/create-intent', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be at least 0.01'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Valid order ID is required')
], createPaymentIntent)

/**
 * @swagger
 * /api/v1/payments/confirm:
 *   post:
 *     summary: Confirm payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
router.post('/confirm', [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Valid order ID is required')
], confirmPayment)

/**
 * @swagger
 * /api/v1/payments/methods:
 *   get:
 *     summary: Get user payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/methods', getPaymentMethods)

/**
 * @swagger
 * /api/v1/payments/methods:
 *   post:
 *     summary: Add payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethodId
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Payment method added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
router.post('/methods', [
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
], addPaymentMethod)

/**
 * @swagger
 * /api/v1/payments/methods/{id}:
 *   delete:
 *     summary: Remove payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment method ID
 *     responses:
 *       200:
 *         description: Payment method removed successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Payment method not found
 */
router.delete('/methods/:id', removePaymentMethod)

/**
 * @swagger
 * /api/v1/payments/methods/{id}/default:
 *   put:
 *     summary: Set default payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment method ID
 *     responses:
 *       200:
 *         description: Default payment method set successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Payment method not found
 */
router.put('/methods/:id/default', setDefaultPaymentMethod)

export default router