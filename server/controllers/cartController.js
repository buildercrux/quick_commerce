/**
 * Cart Controller
 * CRUD operations for user cart
 */

import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

// Get current user's cart (populated)
export const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: '-__v',
    })

    return res.status(200).json({ success: true, data: cart || { user: userId, items: [] } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cart' })
  }
}

// Replace entire cart (used for merging local -> server)
export const replaceMyCart = async (req, res) => {
  try {
    const userId = req.user._id
    const { items } = req.body
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items must be an array' })
    }

    // Validate product IDs and normalize quantities
    const normalizedItems = []
    for (const it of items) {
      if (!it || !it.product) continue
      const prod = await Product.findById(it.product).select('_id inventory name price images vendor seller')
      if (!prod) continue
      const track = prod.inventory?.trackQuantity !== false
      const available = prod.inventory?.quantity || 0
      const desired = Math.max(1, Number(it.quantity) || 1)
      const finalQty = track ? Math.min(desired, available) : desired
      if (track && available <= 0) continue
      normalizedItems.push({ product: prod._id, quantity: finalQty, addedAt: new Date() })
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { user: userId, items: normalizedItems },
      { upsert: true, new: true }
    ).populate('items.product')

    return res.status(200).json({ success: true, data: cart })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to replace cart' })
  }
}

// Add or update a single item
export const addItemToMyCart = async (req, res) => {
  try {
    const userId = req.user._id
    const { productId, quantity = 1 } = req.body
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' })

    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

    const track = product.inventory?.trackQuantity !== false
    const available = product.inventory?.quantity || 0
    if (track && available <= 0) return res.status(400).json({ success: false, message: 'Out of stock' })

    const desired = Math.max(1, Number(quantity) || 1)
    const finalQty = track ? Math.min(desired, available) : desired

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      const created = await Cart.create({ user: userId, items: [{ product: product._id, quantity: finalQty }] })
      const populated = await created.populate('items.product')
      return res.status(200).json({ success: true, data: populated })
    }

    const idx = cart.items.findIndex(i => i.product.toString() === product._id.toString())
    if (idx >= 0) {
      const newQty = cart.items[idx].quantity + finalQty
      cart.items[idx].quantity = track ? Math.min(newQty, available) : newQty
    } else {
      cart.items.push({ product: product._id, quantity: finalQty })
    }

    await cart.save()
    await cart.populate('items.product')
    return res.status(200).json({ success: true, data: cart })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add item' })
  }
}

// Update quantity or remove
export const updateItemInMyCart = async (req, res) => {
  try {
    const userId = req.user._id
    const { productId, quantity } = req.body
    if (!productId || typeof quantity !== 'number') {
      return res.status(400).json({ success: false, message: 'productId and numeric quantity are required' })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    const item = cart.items.find(i => i.product.toString() === productId)
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' })

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId)
    } else {
      // Validate against inventory
      const product = await Product.findById(productId)
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
      const track = product.inventory?.trackQuantity !== false
      const available = product.inventory?.quantity || 0
      item.quantity = track ? Math.min(quantity, available) : quantity
    }

    await cart.save()
    await cart.populate('items.product')
    return res.status(200).json({ success: true, data: cart })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update item' })
  }
}

// Clear cart
export const clearMyCart = async (req, res) => {
  try {
    const userId = req.user._id
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { user: userId, items: [] },
      { upsert: true, new: true }
    )
    return res.status(200).json({ success: true, data: cart })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to clear cart' })
  }
}


