/**
 * Order Model
 * Mongoose schema for order management
 */

import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      name: String,
      option: String
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  }],
  shippingAddress: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'US'
    }
  },
  billingAddress: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'US'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentIntentId: String,
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paidAt: Date,
    refundedAt: Date,
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    shippedAt: Date,
    deliveredAt: Date
  },
  notes: {
    customer: String,
    internal: String
  },
  returnInfo: {
    isReturnable: {
      type: Boolean,
      default: true
    },
    returnWindow: {
      type: Number,
      default: 30 // days
    },
    returnRequests: [{
      reason: {
        type: String,
        enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'other'],
        required: true
      },
      description: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      },
      processedAt: Date,
      refundAmount: Number,
      returnShippingLabel: {
        public_id: String,
        url: String
      }
    }]
  },
  vendorOrders: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      variant: {
        name: String,
        option: String
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative']
      }
    }],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      shippedAt: Date,
      deliveredAt: Date
    },
    notes: String
  }]
}, {
  timestamps: true
})

// Indexes
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ user: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ 'payment.status': 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'vendorOrders.vendor': 1 })
orderSchema.index({ 'vendorOrders.status': 1 })

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments()
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`
  }
  next()
})

// Pre-save middleware to create vendor orders
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Product = mongoose.model('Product')
    
    // Group items by vendor
    const vendorItems = {}
    
    for (const item of this.items) {
      const product = await Product.findById(item.product).populate('vendor')
      if (product && product.vendor) {
        const vendorId = product.vendor._id.toString()
        
        if (!vendorItems[vendorId]) {
          vendorItems[vendorId] = {
            vendor: product.vendor._id,
            items: []
          }
        }
        
        vendorItems[vendorId].items.push({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })
      }
    }
    
    // Create vendor orders
    this.vendorOrders = Object.values(vendorItems)
  }
  next()
})

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.total, 0)
  this.pricing.total = this.pricing.subtotal + this.pricing.shipping + this.pricing.tax - this.pricing.discount
  
  // Update payment amount
  this.payment.amount = this.pricing.total
}

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  const statusHistory = this.statusHistory || []
  statusHistory.push({
    status: this.status,
    changedAt: new Date(),
    notes: notes
  })
  
  this.status = newStatus
  this.statusHistory = statusHistory
  
  // Set timestamps for specific statuses
  if (newStatus === 'shipped' && !this.tracking.shippedAt) {
    this.tracking.shippedAt = new Date()
  }
  
  if (newStatus === 'delivered' && !this.tracking.deliveredAt) {
    this.tracking.deliveredAt = new Date()
  }
  
  if (newStatus === 'cancelled') {
    this.payment.status = 'refunded'
    this.payment.refundedAt = new Date()
  }
}

// Instance method to add tracking info
orderSchema.methods.addTracking = function(carrier, trackingNumber, trackingUrl = '') {
  this.tracking.carrier = carrier
  this.tracking.trackingNumber = trackingNumber
  this.tracking.trackingUrl = trackingUrl
  
  if (this.status === 'processing') {
    this.updateStatus('shipped')
  }
}

// Instance method to request return
orderSchema.methods.requestReturn = function(reason, description = '') {
  if (!this.returnInfo.isReturnable) {
    throw new Error('This order is not returnable')
  }
  
  const daysSinceDelivery = this.tracking.deliveredAt 
    ? Math.floor((Date.now() - this.tracking.deliveredAt) / (1000 * 60 * 60 * 24))
    : 0
  
  if (daysSinceDelivery > this.returnInfo.returnWindow) {
    throw new Error('Return window has expired')
  }
  
  this.returnInfo.returnRequests.push({
    reason,
    description,
    status: 'pending'
  })
  
  return this.save()
}

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  
  return this.find({ status })
    .populate('user', 'name email')
    .populate('items.product', 'name images price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get vendor orders
orderSchema.statics.getVendorOrders = function(vendorId, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  
  return this.find({ 'vendorOrders.vendor': vendorId })
    .populate('user', 'name email')
    .populate('items.product', 'name images price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

export default mongoose.model('Order', orderSchema)