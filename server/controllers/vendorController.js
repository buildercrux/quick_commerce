/**
 * Vendor Controller
 * Handles vendor operations
 */

import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { validationResult } from 'express-validator'
import { v2 as cloudinary } from 'cloudinary'

/**
 * @desc    Get vendor dashboard data
 * @route   GET /api/v1/vendor/dashboard
 * @access  Private (Vendor)
 */
export const getDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user._id

    // Get counts
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    ] = await Promise.all([
      Product.countDocuments({ vendor: vendorId }),
      Product.countDocuments({ vendor: vendorId, status: 'active' }),
      Order.countDocuments({ 'vendorOrders.vendor': vendorId }),
      Order.countDocuments({ 
        'vendorOrders.vendor': vendorId,
        'vendorOrders.status': { $in: ['pending', 'confirmed'] }
      }),
      Order.aggregate([
        { $match: { 'vendorOrders.vendor': vendorId, status: { $in: ['completed', 'delivered'] } } },
        { $unwind: '$vendorOrders' },
        { $match: { 'vendorOrders.vendor': vendorId } },
        { $group: { _id: null, total: { $sum: '$vendorOrders.total' } } }
      ])
    ])

    // Get recent orders
    const recentOrders = await Order.find({ 'vendorOrders.vendor': vendorId })
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(10)

    // Get top products
    const topProducts = await Product.find({ 
      vendor: vendorId, 
      status: 'active' 
    })
      .sort({ 'sales.count': -1 })
      .limit(5)
      .select('name images sales ratings')

    // Get monthly revenue for chart
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          'vendorOrders.vendor': vendorId,
          status: { $in: ['completed', 'delivered'] },
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      { $unwind: '$vendorOrders' },
      { $match: { 'vendorOrders.vendor': vendorId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$vendorOrders.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalOrders,
          pendingOrders,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentOrders,
        topProducts,
        monthlyRevenue
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get vendor products
 * @route   GET /api/v1/vendor/products
 * @access  Private (Vendor)
 */
export const getProducts = async (req, res, next) => {
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

    const { page = 1, limit = 20, status } = req.query
    const vendorId = req.user._id

    let query = { vendor: vendorId }
    if (status) query.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Product.countDocuments(query)

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new product
 * @route   POST /api/v1/vendor/products
 * @access  Private (Vendor)
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

    const productData = {
      ...req.body,
      vendor: req.user._id
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const images = []
      
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          folder: 'ecom-multirole/products',
          width: 800,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        })

        images.push({
          public_id: result.public_id,
          url: result.secure_url,
          isPrimary: i === 0
        })
      }

      productData.images = images
    }

    // Parse JSON fields
    if (req.body.specifications) {
      try {
        productData.specifications = JSON.parse(req.body.specifications)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid specifications format'
        })
      }
    }

    if (req.body.tags) {
      try {
        productData.tags = JSON.parse(req.body.tags)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tags format'
        })
      }
    }

    const product = await Product.create(productData)

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
 * @route   PUT /api/v1/vendor/products/:id
 * @access  Private (Vendor)
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

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      })
    }

    const updateData = { ...req.body }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const images = []
      
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          folder: 'ecom-multirole/products',
          width: 800,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        })

        images.push({
          public_id: result.public_id,
          url: result.secure_url,
          isPrimary: i === 0
        })
      }

      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          await cloudinary.uploader.destroy(image.public_id)
        }
      }

      updateData.images = images
    }

    // Parse JSON fields
    if (req.body.specifications) {
      try {
        updateData.specifications = JSON.parse(req.body.specifications)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid specifications format'
        })
      }
    }

    if (req.body.tags) {
      try {
        updateData.tags = JSON.parse(req.body.tags)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tags format'
        })
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/vendor/products/:id
 * @access  Private (Vendor)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      })
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.public_id)
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
 * @desc    Get vendor orders
 * @route   GET /api/v1/vendor/orders
 * @access  Private (Vendor)
 */
export const getOrders = async (req, res, next) => {
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

    const { page = 1, limit = 20, status } = req.query
    const vendorId = req.user._id

    let query = { 'vendorOrders.vendor': vendorId }
    if (status) {
      query['vendorOrders.status'] = status
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Order.countDocuments(query)

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single vendor order
 * @route   GET /api/v1/vendor/orders/:id
 * @access  Private (Vendor)
 */
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check if vendor has products in this order
    const vendorOrder = order.vendorOrders.find(
      vo => vo.vendor.toString() === req.user._id.toString()
    )

    if (!vendorOrder) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        vendorOrder
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update order status
 * @route   PUT /api/v1/vendor/orders/:id/status
 * @access  Private (Vendor)
 */
export const updateOrderStatus = async (req, res, next) => {
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

    const { status, trackingNumber, carrier, notes } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Find vendor order
    const vendorOrderIndex = order.vendorOrders.findIndex(
      vo => vo.vendor.toString() === req.user._id.toString()
    )

    if (vendorOrderIndex === -1) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this order'
      })
    }

    // Update vendor order status
    order.vendorOrders[vendorOrderIndex].status = status

    if (trackingNumber) {
      order.vendorOrders[vendorOrderIndex].tracking.trackingNumber = trackingNumber
    }

    if (carrier) {
      order.vendorOrders[vendorOrderIndex].tracking.carrier = carrier
    }

    if (notes) {
      order.vendorOrders[vendorOrderIndex].notes = notes
    }

    // Set timestamps
    if (status === 'shipped') {
      order.vendorOrders[vendorOrderIndex].tracking.shippedAt = new Date()
    }

    if (status === 'delivered') {
      order.vendorOrders[vendorOrderIndex].tracking.deliveredAt = new Date()
    }

    await order.save()

    res.status(200).json({
      success: true,
      data: order.vendorOrders[vendorOrderIndex]
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get vendor analytics
 * @route   GET /api/v1/vendor/analytics
 * @access  Private (Vendor)
 */
export const getAnalytics = async (req, res, next) => {
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

    const { period = '30d' } = req.query
    const vendorId = req.user._id

    // Calculate date range
    const now = new Date()
    let startDate
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get analytics data
    const [
      revenue,
      orders,
      products
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            'vendorOrders.vendor': vendorId,
            status: { $in: ['completed', 'delivered'] },
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$vendorOrders' },
        { $match: { 'vendorOrders.vendor': vendorId } },
        {
          $group: {
            _id: null,
            total: { $sum: '$vendorOrders.total' },
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: { 
            'vendorOrders.vendor': vendorId,
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$vendorOrders' },
        { $match: { 'vendorOrders.vendor': vendorId } },
        {
          $group: {
            _id: '$vendorOrders.status',
            count: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        {
          $match: { 
            vendor: vendorId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ])

    res.status(200).json({
      success: true,
      data: {
        period,
        revenue: revenue[0] || { total: 0, count: 0 },
        ordersByStatus: orders,
        productsByStatus: products
      }
    })
  } catch (error) {
    next(error)
  }
}





