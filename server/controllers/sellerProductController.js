/**
 * Seller Product Controller
 * Handles seller product management operations
 */

import Product from '../models/Product.js'
import Seller from '../models/Seller.js'
import { validationResult } from 'express-validator'
import { v2 as cloudinary } from 'cloudinary'

/**
 * @desc    Get seller's products
 * @route   GET /api/v1/seller/products
 * @access  Private (Seller)
 */
export const getSellerProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search
    } = req.query

    let query = { seller: req.seller._id }

    // Status filter
    if (status) {
      query.status = status
    }

    // Category filter
    if (category) {
      query.category = category
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const products = await Product.find(query)
      .populate('seller', 'name storeName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Product.countDocuments(query)

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      data: products
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single seller product
 * @route   GET /api/v1/seller/products/:id
 * @access  Private (Seller)
 */
export const getSellerProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.seller._id
    }).populate('seller', 'name storeName address geo serviceRadiusKm')

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new product
 * @route   POST /api/v1/seller/products
 * @access  Private (Seller)
 */
export const createProduct = async (req, res, next) => {
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

    // Get seller info for location
    const seller = await Seller.findById(req.seller._id)
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      })
    }

    const productData = {
      ...req.body,
      seller: req.seller._id,
      location: seller.geo // Copy seller's location to product
    }

    const product = await Product.create(productData)

    // Populate seller info
    await product.populate('seller', 'name storeName address geo serviceRadiusKm')

    res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update product
 * @route   PUT /api/v1/seller/products/:id
 * @access  Private (Seller)
 */
export const updateProduct = async (req, res, next) => {
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

    let product = await Product.findOne({
      _id: req.params.id,
      seller: req.seller._id
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('seller', 'name storeName address geo serviceRadiusKm')

    res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/seller/products/:id
 * @access  Private (Seller)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.seller._id
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await cloudinary.uploader.destroy(image.public_id)
          } catch (error) {
            console.error('Error deleting image from Cloudinary:', error)
          }
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Upload product images
 * @route   POST /api/v1/seller/products/:id/images
 * @access  Private (Seller)
 */
export const uploadProductImages = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.seller._id
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded'
      })
    }

    const uploadedImages = []

    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'ecommerce/products',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        })

        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
          alt: file.originalname
        })
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error)
        continue
      }
    }

    // Add new images to product
    product.images = [...product.images, ...uploadedImages]

    // Ensure only one primary image
    if (product.images.length === uploadedImages.length) {
      product.images[0].isPrimary = true
    }

    await product.save()

    res.status(200).json({
      success: true,
      data: product.images
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete product image
 * @route   DELETE /api/v1/seller/products/:id/images/:imageId
 * @access  Private (Seller)
 */
export const deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.seller._id
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    const imageIndex = product.images.findIndex(
      img => img._id.toString() === req.params.imageId
    )

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      })
    }

    const image = product.images[imageIndex]

    // Delete from Cloudinary
    if (image.public_id) {
      try {
        await cloudinary.uploader.destroy(image.public_id)
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error)
      }
    }

    // Remove from product
    product.images.splice(imageIndex, 1)

    // If we removed the primary image, make the first remaining image primary
    if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true
    }

    await product.save()

    res.status(200).json({
      success: true,
      data: product.images
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Set primary image
 * @route   PATCH /api/v1/seller/products/:id/images/:imageId/primary
 * @access  Private (Seller)
 */
export const setPrimaryImage = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.seller._id
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Reset all images to not primary
    product.images.forEach(img => {
      img.isPrimary = false
    })

    // Set the specified image as primary
    const image = product.images.find(
      img => img._id.toString() === req.params.imageId
    )

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      })
    }

    image.isPrimary = true
    await product.save()

    res.status(200).json({
      success: true,
      data: product.images
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get product analytics
 * @route   GET /api/v1/seller/products/analytics
 * @access  Private (Seller)
 */
export const getProductAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.seller._id

    // Get product stats
    const productStats = await Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          inactiveProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          totalSales: { $sum: '$sales.total' },
          totalUnitsSold: { $sum: '$sales.count' },
          averageRating: { $avg: '$ratings.average' }
        }
      }
    ])

    // Get top selling products
    const topProducts = await Product.find({ seller: sellerId })
      .sort({ 'sales.count': -1 })
      .limit(5)
      .select('name sales ratings images')

    // Get category distribution
    const categoryStats = await Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSales: { $sum: '$sales.total' }
        }
      },
      { $sort: { count: -1 } }
    ])

    res.status(200).json({
      success: true,
      data: {
        overview: productStats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          draftProducts: 0,
          inactiveProducts: 0,
          totalSales: 0,
          totalUnitsSold: 0,
          averageRating: 0
        },
        topProducts,
        categoryStats
      }
    })
  } catch (error) {
    next(error)
  }
}
