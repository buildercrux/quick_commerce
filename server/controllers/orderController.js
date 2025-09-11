/**
 * Order Controller
 * Handles order management operations
 */

import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { validationResult } from 'express-validator'

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
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

    const { items, shippingAddress, billingAddress, payment } = req.body

    // Validate and calculate order totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.product}`
        })
      }

      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: `Product is not available: ${product.name}`
        })
      }

      if (product.inventory.trackQuantity && product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for: ${product.name}`
        })
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product: product._id,
        variant: item.variant || null,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      })
    }

    // Calculate totals
    const shipping = 0 // TODO: Calculate shipping based on address
    const tax = subtotal * 0.1 // TODO: Calculate tax based on location
    const discount = 0 // TODO: Apply any discounts
    const total = subtotal + shipping + tax - discount

    // Create order
    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        ...payment,
        amount: total
      },
      pricing: {
        subtotal,
        shipping,
        tax,
        discount,
        total
      }
    }

    const order = await Order.create(orderData)

    // Update product inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': -item.quantity } }
      )
    }

    // Populate order data
    await order.populate([
      { path: 'items.product', select: 'name images price' },
      { path: 'user', select: 'name email' }
    ])

    res.status(201).json({
      success: true,
      data: order
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get user orders
 * @route   GET /api/v1/orders
 * @access  Private
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

    let query = { user: req.user._id }
    if (status) {
      query.status = status
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const orders = await Order.find(query)
      .populate('items.product', 'name images price')
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
 * @desc    Get single order
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price vendor')
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      })
    }

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Cancel order
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order'
      })
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      })
    }

    // Update order status
    order.updateStatus('cancelled', 'Order cancelled by customer')

    // Restore product inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': item.quantity } }
      )
    }

    await order.save()

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Request order return
 * @route   POST /api/v1/orders/:id/return
 * @access  Private
 */
export const requestReturn = async (req, res, next) => {
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

    const { reason, description } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to request return for this order'
      })
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Order must be delivered to request a return'
      })
    }

    // Request return
    await order.requestReturn(reason, description)

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
      data: order.returnInfo.returnRequests[order.returnInfo.returnRequests.length - 1]
    })
  } catch (error) {
    if (error.message === 'This order is not returnable' || 
        error.message === 'Return window has expired') {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }
    next(error)
  }
}

/**
 * @desc    Track order
 * @route   GET /api/v1/orders/:id/track
 * @access  Private
 */
export const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to track this order'
      })
    }

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      tracking: order.tracking,
      items: order.items,
      shippingAddress: order.shippingAddress,
      statusHistory: order.statusHistory || []
    }

    res.status(200).json({
      success: true,
      data: trackingInfo
    })
  } catch (error) {
    next(error)
  }
}