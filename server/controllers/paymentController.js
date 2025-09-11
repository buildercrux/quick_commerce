/**
 * Payment Controller
 * Handles payment processing operations
 */

import Stripe from 'stripe'
import Order from '../models/Order.js'
import { validationResult } from 'express-validator'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...')

/**
 * @desc    Create payment intent
 * @route   POST /api/v1/payments/create-intent
 * @access  Private
 */
export const createPaymentIntent = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { amount, currency = 'usd', orderId } = req.body

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user._id.toString(),
        orderId: orderId || ''
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Confirm payment
 * @route   POST /api/v1/payments/confirm
 * @access  Private
 */
export const confirmPayment = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { paymentIntentId, orderId } = req.body

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      })
    }

    // Update order if orderId provided
    if (orderId) {
      const order = await Order.findById(orderId)
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        })
      }

      // Check if user owns the order
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to confirm payment for this order'
        })
      }

      // Update order payment status
      order.payment.status = 'completed'
      order.payment.transactionId = paymentIntent.id
      order.payment.paymentIntentId = paymentIntent.id
      order.payment.paidAt = new Date()

      await order.save()
    }

    res.status(200).json({
      success: true,
      data: {
        paymentIntent,
        orderId: orderId || null
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get user payment methods
 * @route   GET /api/v1/payments/methods
 * @access  Private
 */
export const getPaymentMethods = async (req, res, next) => {
  try {
    // TODO: Implement payment methods storage
    // For now, return empty array
    res.status(200).json({
      success: true,
      data: []
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Add payment method
 * @route   POST /api/v1/payments/methods
 * @access  Private
 */
export const addPaymentMethod = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { paymentMethodId, isDefault = false } = req.body

    // TODO: Implement payment methods storage
    // For now, return success
    res.status(201).json({
      success: true,
      data: {
        id: paymentMethodId,
        isDefault
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Remove payment method
 * @route   DELETE /api/v1/payments/methods/:id
 * @access  Private
 */
export const removePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params

    // TODO: Implement payment methods storage
    // For now, return success
    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Set default payment method
 * @route   PUT /api/v1/payments/methods/:id/default
 * @access  Private
 */
export const setDefaultPaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params

    // TODO: Implement payment methods storage
    // For now, return success
    res.status(200).json({
      success: true,
      message: 'Default payment method set successfully'
    })
  } catch (error) {
    next(error)
  }
}





