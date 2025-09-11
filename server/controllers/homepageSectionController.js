/**
 * Homepage Section Controller
 * Manages dynamic homepage sections
 */

import HomepageSection from '../models/HomepageSection.js'
import Product from '../models/Product.js'
import { validationResult } from 'express-validator'

/**
 * @desc    Get all homepage sections
 * @route   GET /api/v1/homepage-sections
 * @access  Public
 */
export const getHomepageSections = async (req, res, next) => {
  try {
    const { delivery } = req.query
    const sections = await HomepageSection.getVisibleSections(delivery)
    
    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all homepage sections (admin)
 * @route   GET /api/v1/admin/homepage-sections
 * @access  Private/Admin
 */
export const getAllHomepageSections = async (req, res, next) => {
  try {
    const sections = await HomepageSection.find()
      .populate('products', 'name price comparePrice primaryImage ratings category')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ order: 1, createdAt: 1 })
    
    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single homepage section
 * @route   GET /api/v1/homepage-sections/:id
 * @access  Public
 */
export const getHomepageSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id)
      .populate('products', 'name price comparePrice primaryImage ratings category')
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new homepage section
 * @route   POST /api/v1/admin/homepage-sections
 * @access  Private/Admin
 */
export const createHomepageSection = async (req, res, next) => {
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

    const {
      title,
      description,
      type,
      category,
      products,
      maxProducts,
      isVisible,
      order,
      bannerImage,
      bannerLink,
      bannerText
    } = req.body

    // Validate products exist
    if (products && products.length > 0) {
      const existingProducts = await Product.find({ _id: { $in: products } })
      if (existingProducts.length !== products.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more products not found'
        })
      }
    }

    const sectionData = {
      title,
      description,
      type,
      category,
      products: products || [],
      maxProducts: maxProducts || 6,
      isVisible: isVisible !== undefined ? isVisible : true,
      order: order || 0,
      bannerImage,
      bannerLink,
      bannerText,
      createdBy: req.user._id
    }

    const section = await HomepageSection.create(sectionData)
    
    await section.populate('products', 'name price comparePrice primaryImage ratings category')
    await section.populate('createdBy', 'name email')
    
    res.status(201).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update homepage section
 * @route   PUT /api/v1/admin/homepage-sections/:id
 * @access  Private/Admin
 */
export const updateHomepageSection = async (req, res, next) => {
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

    const section = await HomepageSection.findById(req.params.id)
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      })
    }

    const {
      title,
      description,
      type,
      category,
      products,
      maxProducts,
      isVisible,
      order,
      bannerImage,
      bannerLink,
      bannerText
    } = req.body

    // Validate products exist if provided
    if (products && products.length > 0) {
      const existingProducts = await Product.find({ _id: { $in: products } })
      if (existingProducts.length !== products.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more products not found'
        })
      }
    }

    // Update fields
    if (title !== undefined) section.title = title
    if (description !== undefined) section.description = description
    if (type !== undefined) section.type = type
    if (category !== undefined) section.category = category
    if (products !== undefined) section.products = products
    if (maxProducts !== undefined) section.maxProducts = maxProducts
    if (isVisible !== undefined) section.isVisible = isVisible
    if (order !== undefined) section.order = order
    if (bannerImage !== undefined) section.bannerImage = bannerImage
    if (bannerLink !== undefined) section.bannerLink = bannerLink
    if (bannerText !== undefined) section.bannerText = bannerText
    
    section.lastModifiedBy = req.user._id

    await section.save()
    
    await section.populate('products', 'name price comparePrice primaryImage ratings category')
    await section.populate('createdBy', 'name email')
    await section.populate('lastModifiedBy', 'name email')
    
    res.status(200).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete homepage section
 * @route   DELETE /api/v1/admin/homepage-sections/:id
 * @access  Private/Admin
 */
export const deleteHomepageSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id)
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      })
    }

    await HomepageSection.findByIdAndDelete(req.params.id)
    
    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Add product to section
 * @route   POST /api/v1/admin/homepage-sections/:id/products
 * @access  Private/Admin
 */
export const addProductToSection = async (req, res, next) => {
  try {
    const { productId } = req.body
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      })
    }

    const section = await HomepageSection.findById(req.params.id)
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
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

    await section.addProduct(productId)
    
    await section.populate('products', 'name price comparePrice primaryImage ratings category')
    
    res.status(200).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Remove product from section
 * @route   DELETE /api/v1/admin/homepage-sections/:id/products/:productId
 * @access  Private/Admin
 */
export const removeProductFromSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id)
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      })
    }

    await section.removeProduct(req.params.productId)
    
    await section.populate('products', 'name price comparePrice primaryImage ratings category')
    
    res.status(200).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reorder products in section
 * @route   PUT /api/v1/admin/homepage-sections/:id/products/reorder
 * @access  Private/Admin
 */
export const reorderProductsInSection = async (req, res, next) => {
  try {
    const { productIds } = req.body
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        error: 'Product IDs array is required'
      })
    }

    const section = await HomepageSection.findById(req.params.id)
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      })
    }

    await section.reorderProducts(productIds)
    
    await section.populate('products', 'name price comparePrice primaryImage ratings category')
    
    res.status(200).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reorder sections
 * @route   PUT /api/v1/admin/homepage-sections/reorder
 * @access  Private/Admin
 */
export const reorderSections = async (req, res, next) => {
  try {
    const { sectionOrders } = req.body
    
    if (!sectionOrders || !Array.isArray(sectionOrders)) {
      return res.status(400).json({
        success: false,
        error: 'Section orders array is required'
      })
    }

    // Update each section's order
    const updatePromises = sectionOrders.map(({ sectionId, order }) =>
      HomepageSection.findByIdAndUpdate(sectionId, { order })
    )

    await Promise.all(updatePromises)
    
    const sections = await HomepageSection.find()
      .populate('products', 'name price comparePrice primaryImage ratings category')
      .sort({ order: 1, createdAt: 1 })
    
    res.status(200).json({
      success: true,
      data: sections
    })
  } catch (error) {
    next(error)
  }
}



