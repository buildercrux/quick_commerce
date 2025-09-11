/**
 * Authentication Controller
 * Handles user authentication operations
 */

import User from '../models/User.js'
import { validationResult } from 'express-validator'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

/**
 * Send token response
 */
const sendTokenResponse = async (user, statusCode, res) => {
  try {
    // Create token
    const accessToken = user.getSignedJwtToken()
    const refreshToken = user.getSignedRefreshToken()

    // Add refresh token to user and update last login in one operation
    if (!user.refreshTokens) {
      user.refreshTokens = []
    }
    
    user.refreshTokens.push(refreshToken)
    
    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5)
    }
    
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

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
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isSuspended: user.isSuspended,
          vendorProfile: user.vendorProfile,
          shippingAddresses: user.shippingAddresses,
          preferences: user.preferences
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
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
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

    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer'
    })

    await sendTokenResponse(user, 201, res)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
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

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens')
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(401).json({
        success: false,
        error: 'Account is suspended'
      })
    }

    await sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    // Clear refresh token from user if it exists
    if (req.cookies.refreshToken && req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter(
        token => token !== req.cookies.refreshToken
      )
      await req.user.save({ validateBeforeSave: false })
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
      message: 'User logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required'
      })
    }

    // Verify refresh token first
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211')
    
    // Get user from refresh token
    const user = await User.findById(decoded.id).select('+refreshTokens')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      })
    }
    
    if (!user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      })
    }

    // Remove old refresh token and add new one in one operation
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken)
    
    // Generate new tokens
    const newAccessToken = user.getSignedJwtToken()
    const newRefreshToken = user.getSignedRefreshToken()
    
    // Add new refresh token
    user.refreshTokens.push(newRefreshToken)
    
    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5)
    }
    
    await user.save({ validateBeforeSave: false })

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }

    res.status(200)
      .cookie('token', newAccessToken, options)
      .json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
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

    const { email } = req.body

    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with this email'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    await user.save({ validateBeforeSave: false })

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`

    // TODO: Send email with reset link
    console.log('Reset URL:', resetUrl)

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken // Only for development
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/reset-password/:resettoken
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
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

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      })
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    await sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update user password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = async (req, res, next) => {
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

    const user = await User.findById(req.user._id).select('+password')

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    user.password = req.body.newPassword
    await user.save()

    await sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/update-profile
 * @access  Private
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
      email: req.body.email
    }

    // Check if email is being updated and if it's already taken
    if (req.body.email && req.body.email !== req.user.email) {
      const existingUser = await User.findByEmail(req.body.email)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    )

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}