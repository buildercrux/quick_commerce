/**
 * User Controller
 * Handles user profile and address management
 */

import User from '../models/User.js'
import { validationResult } from 'express-validator'
import { v2 as cloudinary } from 'cloudinary'

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
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
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
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

    const fieldsToUpdate = {}
    const allowedFields = ['name', 'email', 'vendorProfile']

    // Filter allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = req.body[key]
      }
    })

    // Check if email is being updated and if it's already taken
    if (fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email) {
      const existingUser = await User.findByEmail(fieldsToUpdate.email)
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

/**
 * @desc    Update user avatar
 * @route   PUT /api/v1/users/avatar
 * @access  Private
 */
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      })
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecom-multirole/avatars',
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    })

    // Delete old avatar from Cloudinary if exists
    if (req.user.avatar && req.user.avatar.public_id) {
      await cloudinary.uploader.destroy(req.user.avatar.public_id)
    }

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          public_id: result.public_id,
          url: result.secure_url
        }
      },
      { new: true }
    )

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Add shipping address
 * @route   POST /api/v1/users/shipping-addresses
 * @access  Private
 */
export const addShippingAddress = async (req, res, next) => {
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
      phone,
      address,
      city,
      state,
      zipCode,
      country = 'US',
      isDefault = false
    } = req.body

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: { 'shippingAddresses.$[].isDefault': false }
        }
      )
    }

    const newAddress = {
      name,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      isDefault
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { shippingAddresses: newAddress } },
      { new: true }
    )

    res.status(201).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update shipping address
 * @route   PUT /api/v1/users/shipping-addresses/:addressId
 * @access  Private
 */
export const updateShippingAddress = async (req, res, next) => {
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

    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    const addressIndex = user.shippingAddresses.findIndex(
      addr => addr._id.toString() === addressId
    )

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      })
    }

    // Update address fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        user.shippingAddresses[addressIndex][key] = req.body[key]
      }
    })

    await user.save()

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete shipping address
 * @route   DELETE /api/v1/users/shipping-addresses/:addressId
 * @access  Private
 */
export const deleteShippingAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    const addressIndex = user.shippingAddresses.findIndex(
      addr => addr._id.toString() === addressId
    )

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      })
    }

    user.shippingAddresses.splice(addressIndex, 1)
    await user.save()

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Set default shipping address
 * @route   PUT /api/v1/users/shipping-addresses/:addressId/default
 * @access  Private
 */
export const setDefaultShippingAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    const addressIndex = user.shippingAddresses.findIndex(
      addr => addr._id.toString() === addressId
    )

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      })
    }

    // Remove default from all addresses
    user.shippingAddresses.forEach(addr => {
      addr.isDefault = false
    })

    // Set selected address as default
    user.shippingAddresses[addressIndex].isDefault = true

    await user.save()

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update user preferences
 * @route   PUT /api/v1/users/preferences
 * @access  Private
 */
export const updatePreferences = async (req, res, next) => {
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

    const preferences = {}
    const allowedFields = ['emailNotifications', 'smsNotifications', 'newsletter']

    // Filter allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        preferences[key] = req.body[key]
      }
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true }
    )

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}





