/**
 * Review Model
 * Mongoose schema for product reviews
 */

import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: [true, 'Please add a review title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please add a review comment'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  helpful: {
    count: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative']
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  verified: {
    type: Boolean,
    default: false
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
})

// Indexes
reviewSchema.index({ product: 1 })
reviewSchema.index({ user: 1 })
reviewSchema.index({ order: 1 })
reviewSchema.index({ status: 1 })
reviewSchema.index({ rating: 1 })
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ product: 1, status: 1 })
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

// Pre-save middleware to check if user can review
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if user has already reviewed this product
    const existingReview = await this.constructor.findOne({
      user: this.user,
      product: this.product
    })
    
    if (existingReview) {
      return next(new Error('You have already reviewed this product'))
    }
    
    // Check if order exists and is completed
    const Order = mongoose.model('Order')
    const order = await Order.findOne({
      _id: this.order,
      user: this.user,
      status: { $in: ['delivered', 'completed'] }
    })
    
    if (!order) {
      return next(new Error('Order not found or not completed'))
    }
    
    // Check if product is in the order
    const productInOrder = order.items.some(item => 
      item.product.toString() === this.product.toString()
    )
    
    if (!productInOrder) {
      return next(new Error('Product not found in order'))
    }
    
    // Mark as verified since it's from a completed order
    this.verified = true
  }
  next()
})

// Post-save middleware to update product ratings
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    const Product = mongoose.model('Product')
    const product = await Product.findById(this.product)
    if (product) {
      await product.updateRatings()
    }
  }
})

// Post-remove middleware to update product ratings
reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product')
  const product = await Product.findById(this.product)
  if (product) {
    await product.updateRatings()
  }
})

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = function(userId) {
  const userIndex = this.helpful.users.indexOf(userId)
  
  if (userIndex === -1) {
    // Add user to helpful list
    this.helpful.users.push(userId)
    this.helpful.count += 1
  } else {
    // Remove user from helpful list
    this.helpful.users.splice(userIndex, 1)
    this.helpful.count -= 1
  }
  
  return this.save()
}

// Instance method to add response
reviewSchema.methods.addResponse = function(text, respondedBy) {
  this.response = {
    text,
    respondedBy,
    respondedAt: new Date()
  }
  
  return this.save()
}

// Static method to get reviews by product
reviewSchema.statics.getByProduct = function(productId, page = 1, limit = 10, status = 'approved') {
  const skip = (page - 1) * limit
  
  return this.find({ product: productId, status })
    .populate('user', 'name avatar')
    .populate('response.respondedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get reviews by user
reviewSchema.statics.getByUser = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit
  
  return this.find({ user: userId })
    .populate('product', 'name images price')
    .populate('response.respondedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get pending reviews
reviewSchema.statics.getPending = function(page = 1, limit = 20) {
  const skip = (page - 1) * limit
  
  return this.find({ status: 'pending' })
    .populate('user', 'name email')
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get review statistics
reviewSchema.statics.getStats = function(productId) {
  return this.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: {
          $reduce: {
            input: [1, 2, 3, 4, 5],
            initialValue: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    {
                      $map: {
                        input: ['$$this'],
                        as: 'rating',
                        in: {
                          k: { $toString: '$$rating' },
                          v: {
                            $size: {
                              $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', '$$rating'] }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ])
}

export default mongoose.model('Review', reviewSchema)