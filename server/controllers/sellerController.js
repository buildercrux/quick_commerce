/**
 * Seller Controller
 * Handles seller management operations
 */

import Seller from '../models/Seller.js'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'

// JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d'

/**
 * Send token response
 */
const sendTokenResponse = async (seller, statusCode, res) => {
  try {
    // Create token
    const accessToken = seller.getSignedJwtToken()
    const refreshToken = seller.getSignedRefreshToken()

    // Add refresh token to seller and update last login in one operation
    if (!seller.refreshTokens) {
      seller.refreshTokens = []
    }
    
    seller.refreshTokens.push(refreshToken)
    
    // Keep only last 5 refresh tokens
    if (seller.refreshTokens.length > 5) {
      seller.refreshTokens = seller.refreshTokens.slice(-5)
    }
    
    seller.lastLogin = new Date()
    await seller.save({ validateBeforeSave: false })

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }

    res.status(statusCode)
      .cookie('token', accessToken, options)
      .json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          _id: seller._id,
          name: seller.name,
          email: seller.email,
          role: 'seller',
          storeName: seller.storeName,
          storeDescription: seller.storeDescription,
          address: seller.address,
          geo: seller.geo,
          serviceRadiusKm: seller.serviceRadiusKm,
          isApproved: seller.isApproved,
          isSuspended: seller.isSuspended,
          avatar: seller.avatar,
          metrics: seller.metrics,
          businessHours: seller.businessHours
        }
      })
  } catch (error) {
    console.error('Error in sendTokenResponse:', error)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

/**
 * @desc    Register seller
 * @route   POST /api/v1/sellers/register
 * @access  Public
 */
export const registerSeller = async (req, res, next) => {
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
      name, 
      email, 
      phone, 
      password, 
      storeName, 
      storeDescription, 
      address, 
      geo, 
      serviceRadiusKm 
    } = req.body

    // Check if seller already exists
    const existingSeller = await Seller.findByEmail(email)
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        error: 'Seller already exists with this email'
      })
    }

    // Create seller
    const seller = await Seller.create({
      name,
      email,
      phone,
      password,
      storeName,
      storeDescription,
      address,
      geo,
      serviceRadiusKm: serviceRadiusKm || 5
    })

    await sendTokenResponse(seller, 201, res)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Login seller
 * @route   POST /api/v1/sellers/login
 * @access  Public
 */
export const loginSeller = async (req, res, next) => {
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

    const { email, password } = req.body

    // Check for seller
    const seller = await Seller.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens')
    if (!seller) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check if password matches
    const isMatch = await seller.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check if seller is suspended
    if (seller.isSuspended) {
      return res.status(401).json({
        success: false,
        error: 'Account is suspended'
      })
    }

    await sendTokenResponse(seller, 200, res)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get current seller
 * @route   GET /api/v1/sellers/me
 * @access  Private (Seller)
 */
export const getMe = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.seller._id)

    res.status(200).json({
      success: true,
      seller
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update seller profile
 * @route   PATCH /api/v1/sellers/me
 * @access  Private (Seller)
 */
export const updateProfile = async (req, res, next) => {
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

    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      storeName: req.body.storeName,
      storeDescription: req.body.storeDescription,
      address: req.body.address,
      geo: req.body.geo,
      serviceRadiusKm: req.body.serviceRadiusKm,
      businessHours: req.body.businessHours,
      paymentSettings: req.body.paymentSettings
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key]
      }
    })

    // Check if email is being updated and if it's already taken
    if (req.body.email && req.body.email !== req.seller.email) {
      const existingSeller = await Seller.findByEmail(req.body.email)
      if (existingSeller) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        })
      }
    }

    const seller = await Seller.findByIdAndUpdate(
      req.seller._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    )

    res.status(200).json({
      success: true,
      seller
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get seller dashboard stats
 * @route   GET /api/v1/sellers/dashboard
 * @access  Private (Seller)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const sellerId = req.seller._id

    // Get product count
    const Product = (await import('../models/Product.js')).default
    const Order = (await import('../models/Order.js')).default

    const productCount = await Product.countDocuments({ seller: sellerId })
    const activeProductCount = await Product.countDocuments({ 
      seller: sellerId, 
      status: 'active' 
    })

    // Get order stats
    const orderStats = await Order.aggregate([
      {
        $match: {
          'items.seller': sellerId,
          status: { $in: ['pending', 'confirmed', 'shipped', 'delivered', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          todayOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ['$createdAt', new Date(new Date().setHours(23, 59, 59, 999))] }
                  ]
                },
                1,
                0
              ]
            }
          },
          todayRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ['$createdAt', new Date(new Date().setHours(23, 59, 59, 999))] }
                  ]
                },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ])

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      todayRevenue: 0
    }

    // Get recent orders
    const recentOrders = await Order.find({
      'items.seller': sellerId
    })
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(5)

    res.status(200).json({
      success: true,
      data: {
        products: {
          total: productCount,
          active: activeProductCount
        },
        orders: {
          total: stats.totalOrders,
          today: stats.todayOrders,
          revenue: {
            total: stats.totalRevenue,
            today: stats.todayRevenue
          }
        },
        recentOrders
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all sellers (Admin only)
 * @route   GET /api/v1/sellers
 * @access  Private (Admin)
 */
export const getSellers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query

    let query = {}

    // Status filter
    if (status === 'approved') {
      query.isApproved = true
      query.isSuspended = false
    } else if (status === 'pending') {
      query.isApproved = false
      query.isSuspended = false
    } else if (status === 'suspended') {
      query.isSuspended = true
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sellers = await Seller.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Seller.countDocuments(query)

    res.status(200).json({
      success: true,
      count: sellers.length,
      total,
      data: sellers
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single seller
 * @route   GET /api/v1/sellers/:id
 * @access  Private (Admin)
 */
export const getSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id).select('-password -refreshTokens')

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      })
    }

    res.status(200).json({
      success: true,
      data: seller
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update seller status (Admin only)
 * @route   PATCH /api/v1/sellers/:id/status
 * @access  Private (Admin)
 */
export const updateSellerStatus = async (req, res, next) => {
  try {
    const { isApproved, isSuspended } = req.body

    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { isApproved, isSuspended },
      { new: true, runValidators: true }
    )

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      })
    }

    res.status(200).json({
      success: true,
      data: seller
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete seller (Admin only)
 * @route   DELETE /api/v1/sellers/:id
 * @access  Private (Admin)
 */
export const deleteSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id)

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      })
    }

    // Check if seller has products
    const Product = (await import('../models/Product.js')).default
    const productCount = await Product.countDocuments({ seller: seller._id })

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete seller with existing products. Please transfer or delete products first.'
      })
    }

    await Seller.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Seller deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Logout seller
 * @route   POST /api/v1/sellers/logout
 * @access  Private (Seller)
 */
export const logoutSeller = async (req, res, next) => {
  try {
    // Clear refresh token from seller if it exists
    if (req.cookies.refreshToken && req.seller) {
      req.seller.refreshTokens = req.seller.refreshTokens.filter(
        token => token !== req.cookies.refreshToken
      )
      await req.seller.save({ validateBeforeSave: false })
    }

    // Clear cookies
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.status(200).json({
      success: true,
      message: 'Seller logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get seller feed data
 * @route   GET /api/v1/sellers/:sellerId/feed
 * @access  Public
 */
export const getSellerFeed = async (req, res, next) => {
  try {
    const { sellerId } = req.params

    // Find seller
    const seller = await Seller.findById(sellerId).select('name storeName avatar')
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      })
    }

    // Import Product model
    const Product = (await import('../models/Product.js')).default

    // Get seller's products with images
    const products = await Product.find({ seller: sellerId })
      .populate('seller', 'name storeName avatar')
      .select('name images price likeCount liked')
      .sort({ createdAt: -1 })
      .limit(20)

    // Mock data for banners and stories (in real app, these would come from database)
    const banners = [
      {
        id: 1,
        imgUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
        alt: 'Fashion Banner'
      },
      {
        id: 2,
        imgUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop',
        alt: 'Lifestyle Banner'
      }
    ]

    const stories = [
      { id: 'my-feed', label: 'MY FEED', imgUrl: seller.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop' },
      { id: 'kurtas', label: 'KURTAS', imgUrl: 'https://images.unsplash.com/photo-1594633312681-425a7b9569e2?w=150&h=150&fit=crop' },
      { id: 'tops', label: 'TOPS', imgUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=150&fit=crop' },
      { id: 'dresses', label: 'DRESSES', imgUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=150&fit=crop' },
      { id: 'sarees', label: 'SAREES', imgUrl: 'https://images.unsplash.com/photo-1594633312681-425a7b9569e2?w=150&h=150&fit=crop' },
      { id: 'jewelry', label: 'JEWELRY', imgUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&h=150&fit=crop' },
      { id: 'bags', label: 'BAGS', imgUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop' },
      { id: 'shoes', label: 'SHOES', imgUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&h=150&fit=crop' }
    ]

    // Format products for frontend
    const formattedProducts = products.map(product => ({
      id: product._id,
      seller: {
        id: product.seller._id,
        name: product.seller.storeName || product.seller.name,
        avatarUrl: product.seller.avatar
      },
      title: product.name,
      images: product.images || [],
      price: product.price,
      likeCount: product.likeCount || 0,
      liked: product.liked || false
    }))

    res.status(200).json({
      success: true,
      data: {
        banners,
        stories,
        products: formattedProducts
      }
    })
  } catch (error) {
    next(error)
  }
}
