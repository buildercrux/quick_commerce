/**
 * Wishlist Controller
 * Handles wishlist management operations
 */

import User from '../models/User.js'
import Product from '../models/Product.js'
import { validationResult } from 'express-validator'

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Get user with populated wishlist
    const user = await User.findById(userId)
      .populate({
        path: 'wishlist',
        populate: {
          path: 'seller',
          select: 'name storeName address geo serviceRadiusKm'
        }
      })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Filter out any null products (in case product was deleted)
    const validWishlist = user.wishlist.filter(product => product !== null)

    res.status(200).json({
      success: true,
      count: validWishlist.length,
      data: validWishlist
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist/:productId
 * @access  Private
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { productId } = req.params

    // Validate product ID
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      })
    }

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      })
    }

    // Add product to wishlist
    user.wishlist.push(productId)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        productId,
        wishlistCount: user.wishlist.length
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { productId } = req.params

    // Validate product ID
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      })
    }

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product not in wishlist'
      })
    }

    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: {
        productId,
        wishlistCount: user.wishlist.length
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/v1/wishlist/check/:productId
 * @access  Private
 */
export const checkWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { productId } = req.params

    // Validate product ID
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      })
    }

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Check if product is in wishlist
    const isInWishlist = user.wishlist.includes(productId)

    res.status(200).json({
      success: true,
      data: {
        productId,
        isInWishlist
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/v1/wishlist
 * @access  Private
 */
export const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Clear wishlist
    user.wishlist = []
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: {
        wishlistCount: 0
      }
    })
  } catch (error) {
    next(error)
  }
}
