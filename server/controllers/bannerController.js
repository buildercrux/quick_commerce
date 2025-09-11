/**
 * Banner Controller
 * Handles banner-related operations
 */

import Banner from '../models/Banner.js'
import { validationResult } from 'express-validator'

/**
 * @desc    Get all active banners
 * @route   GET /api/v1/banners
 * @access  Public
 */
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.getActiveBanners()
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all banners (admin)
 * @route   GET /api/v1/admin/banners
 * @access  Private/Admin
 */
export const getAllBanners = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, isActive } = req.query
    
    // Build query
    const query = {}
    if (category) query.category = category
    if (isActive !== undefined) query.isActive = isActive === 'true'
    
    const banners = await Banner.find(query)
      .sort({ priority: -1, order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    
    const total = await Banner.countDocuments(query)
    
    res.status(200).json({
      success: true,
      count: banners.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: banners
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single banner
 * @route   GET /api/v1/admin/banners/:id
 * @access  Private/Admin
 */
export const getBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: banner
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new banner
 * @route   POST /api/v1/admin/banners
 * @access  Private/Admin
 */
export const createBanner = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }
    
    const banner = await Banner.create(req.body)
    
    res.status(201).json({
      success: true,
      data: banner
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update banner
 * @route   PUT /api/v1/admin/banners/:id
 * @access  Private/Admin
 */
export const updateBanner = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: banner
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete banner
 * @route   DELETE /api/v1/admin/banners/:id
 * @access  Private/Admin
 */
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id)
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Toggle banner status
 * @route   PATCH /api/v1/admin/banners/:id/toggle
 * @access  Private/Admin
 */
export const toggleBannerStatus = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      })
    }
    
    banner.isActive = !banner.isActive
    await banner.save()
    
    res.status(200).json({
      success: true,
      data: banner
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reorder banners
 * @route   PUT /api/v1/admin/banners/reorder
 * @access  Private/Admin
 */
export const reorderBanners = async (req, res, next) => {
  try {
    const { bannerOrders } = req.body
    
    if (!Array.isArray(bannerOrders)) {
      return res.status(400).json({
        success: false,
        message: 'bannerOrders must be an array'
      })
    }
    
    // Update order for each banner
    const updatePromises = bannerOrders.map(({ id, order }) =>
      Banner.findByIdAndUpdate(id, { order }, { new: true })
    )
    
    await Promise.all(updatePromises)
    
    res.status(200).json({
      success: true,
      message: 'Banners reordered successfully'
    })
  } catch (error) {
    next(error)
  }
}
