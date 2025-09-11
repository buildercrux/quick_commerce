/**
 * Review Controller
 * Handles product review operations
 */

import Review from '../models/Review.js'
import { validationResult } from 'express-validator'

/**
 * @desc    Get reviews for a product
 * @route   GET /api/v1/reviews
 * @access  Public
 */
export const getReviews = async (req, res, next) => {
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

    const { product, page = 1, limit = 10 } = req.query

    const result = await Review.getByProduct(product, parseInt(page), parseInt(limit))

    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('product', 'name images')
      .populate('response.respondedBy', 'name')

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    res.status(200).json({
      success: true,
      data: review
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
export const createReview = async (req, res, next) => {
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

    const { product, order, rating, title, comment } = req.body

    const reviewData = {
      product,
      order,
      user: req.user._id,
      rating,
      title,
      comment
    }

    const review = await Review.create(reviewData)

    await review.populate([
      { path: 'user', select: 'name avatar' },
      { path: 'product', select: 'name images' }
    ])

    res.status(201).json({
      success: true,
      data: review
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
export const updateReview = async (req, res, next) => {
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

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      })
    }

    // Check if review can be updated
    if (review.status === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Approved reviews cannot be updated'
      })
    }

    const updateData = {}
    const allowedFields = ['rating', 'title', 'comment']

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key]
      }
    })

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name avatar' },
      { path: 'product', select: 'name images' }
    ])

    res.status(200).json({
      success: true,
      data: updatedReview
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      })
    }

    await Review.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Mark review as helpful
 * @route   POST /api/v1/reviews/:id/helpful
 * @access  Private
 */
export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    await review.markHelpful(req.user._id)

    res.status(200).json({
      success: true,
      data: {
        helpfulCount: review.helpful.count,
        isHelpful: review.helpful.users.includes(req.user._id)
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Add response to review
 * @route   POST /api/v1/reviews/:id/response
 * @access  Private (Vendor/Admin)
 */
export const addResponse = async (req, res, next) => {
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

    const { text } = req.body

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    // Check if user can respond (vendor of product or admin)
    if (req.user.role !== 'admin') {
      const Product = (await import('../models/Product.js')).default
      const product = await Product.findById(review.product)
      
      if (!product || product.vendor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to respond to this review'
        })
      }
    }

    await review.addResponse(text, req.user._id)

    await review.populate('response.respondedBy', 'name')

    res.status(200).json({
      success: true,
      data: review.response
    })
  } catch (error) {
    next(error)
  }
}





