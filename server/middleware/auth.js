/**
 * Authentication Middleware
 * Handles JWT authentication and authorization
 */

import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Seller from '../models/Seller.js'

// JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in cookies first, then Authorization header
    if (req.cookies.token) {
      token = req.cookies.token
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET)

      // First try to resolve a User principal by decoded.id
      const user = await User.findById(decoded.id).select('-password -refreshTokens')
      if (user) {
        if (user.isSuspended) {
          return res.status(401).json({ success: false, error: 'Account is suspended' })
        }
        req.user = user
        // If this user has seller role, best-effort hydrate req.seller by email
        if (user.role === 'seller') {
          const sellerDoc = await Seller.findOne({ email: user.email.toLowerCase() }).select('-password -refreshTokens')
          if (sellerDoc && !sellerDoc.isSuspended) {
            req.seller = sellerDoc
          }
        }
        return next()
      }

      // If no User found and token role is seller, it might be a Seller token
      if (decoded.role === 'seller') {
        const seller = await Seller.findById(decoded.id).select('-password -refreshTokens')
        if (!seller) {
          return res.status(401).json({ success: false, error: 'No seller found with this token' })
        }
        if (seller.isSuspended) {
          return res.status(401).json({ success: false, error: 'Account is suspended' })
        }
        req.seller = seller
        // Synthesize a minimal req.user for role checks
        req.user = { _id: seller._id, email: seller.email, role: 'seller' }
        return next()
      }

      // Neither a valid user nor seller principal found
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' })
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    })
  }
}

/**
 * Authorize specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      })
    }

    next()
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.cookies.token) {
      token = req.cookies.token
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET)

        if (decoded.role === 'seller') {
          const seller = await Seller.findById(decoded.id).select('-password -refreshTokens')
          if (seller && !seller.isSuspended) {
            req.seller = seller
            req.user = { ...seller.toObject(), role: 'seller' }
          }
        } else {
          const user = await User.findById(decoded.id).select('-password -refreshTokens')
          if (user && !user.isSuspended) {
            req.user = user
          }
        }
      } catch (error) {
        // Token is invalid, but we don't fail
        console.log('Invalid token in optional auth:', error.message)
      }
    }

    next()
  } catch (error) {
    next()
  }
}

/**
 * Check if user owns the resource
 */
export const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName]
      const resource = await Model.findById(resourceId)

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        })
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        req.resource = resource
        return next()
      }

      // Check ownership
      if (resource.user && resource.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this resource'
        })
      }

      req.resource = resource
      next()
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Server error in ownership check'
      })
    }
  }
}

/**
 * Verify refresh token
 */
export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required'
      })
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
      const user = await User.findById(decoded.id)

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

      if (user.isSuspended) {
        return res.status(401).json({
          success: false,
          error: 'Account is suspended'
        })
      }

      req.user = user
      req.refreshToken = refreshToken
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error in refresh token verification'
    })
  }
}

/**
 * Rate limiting for sensitive operations
 */
export const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map()

  return (req, res, next) => {
    const key = req.ip + (req.user ? req.user._id : '')
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean old attempts
    if (attempts.has(key)) {
      const userAttempts = attempts.get(key).filter(time => time > windowStart)
      attempts.set(key, userAttempts)
    } else {
      attempts.set(key, [])
    }

    const userAttempts = attempts.get(key)

    if (userAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: 'Too many attempts. Please try again later.'
      })
    }

    userAttempts.push(now)
    next()
  }
}

