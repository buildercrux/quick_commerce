/**
 * Admin Controller
 * Handles admin operations
 */

import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Review from '../models/Review.js'
import { validationResult } from 'express-validator'

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (Admin)
 */
export const getDashboard = async (req, res, next) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ])

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(10)

    // Get top products
    const topProducts = await Product.find({ status: 'active' })
      .sort({ 'sales.count': -1 })
      .limit(5)
      .select('name images sales ratings')

    // Get monthly revenue for chart
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] },
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVendors,
          totalProducts,
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
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
export const getUsers = async (req, res, next) => {
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

    const { page = 1, limit = 20, role, status } = req.query

    let query = {}
    if (role) query.role = role
    if (status) query.isSuspended = status === 'suspended'

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      data: users,
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
 * @desc    Get single user
 * @route   GET /api/v1/admin/users/:id
 * @access  Private (Admin)
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens')

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update user
 * @route   PUT /api/v1/admin/users/:id
 * @access  Private (Admin)
 */
export const updateUser = async (req, res, next) => {
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

    const fieldsToUpdate = {}
    const allowedFields = ['name', 'email', 'role']

    // Filter allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = req.body[key]
      }
    })

    // Check if email is being updated and if it's already taken
    if (fieldsToUpdate.email) {
      const existingUser = await User.findByEmail(fieldsToUpdate.email)
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -refreshTokens')

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Suspend/unsuspend user
 * @route   PUT /api/v1/admin/users/:id/suspend
 * @access  Private (Admin)
 */
export const suspendUser = async (req, res, next) => {
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

    const { isSuspended } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended },
      { new: true }
    ).select('-password -refreshTokens')

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all products (admin view)
 * @route   GET /api/v1/admin/products
 * @access  Private (Admin)
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

    let query = {}
    if (status) query.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const products = await Product.find(query)
      .populate('vendor', 'name email vendorProfile.businessName')
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
 * @desc    Get all orders (admin view)
 * @route   GET /api/v1/admin/orders
 * @access  Private (Admin)
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

    let query = {}
    if (status) query.status = status

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
 * @desc    Get analytics data
 * @route   GET /api/v1/admin/analytics
 * @access  Private (Admin)
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
      users,
      products
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'delivered'] },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.total' },
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
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
        usersByRole: users,
        productsByStatus: products
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get admin settings
 * @route   GET /api/v1/admin/settings
 * @access  Private (Admin)
 */
export const getSettings = async (req, res, next) => {
  try {
    // TODO: Implement settings storage (database or config file)
    const settings = {
      siteName: 'Ecom-MultiRole',
      siteDescription: 'Multi-role e-commerce platform',
      maintenanceMode: false,
      allowRegistration: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
      currency: 'USD',
      timezone: 'UTC'
    }

    res.status(200).json({
      success: true,
      data: settings
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update admin settings
 * @route   PUT /api/v1/admin/settings
 * @access  Private (Admin)
 */
export const updateSettings = async (req, res, next) => {
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

    // TODO: Implement settings storage (database or config file)
    const updatedSettings = {
      siteName: req.body.siteName || 'Ecom-MultiRole',
      siteDescription: req.body.siteDescription || 'Multi-role e-commerce platform',
      maintenanceMode: req.body.maintenanceMode || false,
      allowRegistration: req.body.allowRegistration !== false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
      currency: 'USD',
      timezone: 'UTC'
    }

    res.status(200).json({
      success: true,
      data: updatedSettings
    })
  } catch (error) {
    next(error)
  }
}





