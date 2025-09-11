/**
 * Banner Model
 * Mongoose schema for banner management
 */

import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a banner title'],
    trim: true,
    maxlength: [100, 'Banner title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a banner description'],
    maxlength: [200, 'Banner description cannot be more than 200 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add a banner image URL']
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
    maxlength: [50, 'Button text cannot be more than 50 characters']
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'returning_users', 'premium_users'],
    default: 'all'
  },
  category: {
    type: String,
    enum: ['electronics', 'fashion', 'home', 'beauty', 'sports', 'books', 'general'],
    default: 'general'
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
})

// Index for efficient queries
bannerSchema.index({ isActive: 1, order: 1 })
bannerSchema.index({ startDate: 1, endDate: 1 })
bannerSchema.index({ category: 1, isActive: 1 })

// Virtual for checking if banner is currently active
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date()
  return this.isActive && 
         this.startDate <= now && 
         (!this.endDate || this.endDate >= now)
})

// Static method to get active banners ordered by priority and order
bannerSchema.statics.getActiveBanners = function() {
  const now = new Date()
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ]
  })
  .sort({ priority: -1, order: 1, createdAt: -1 })
}

// Static method to get banners by category
bannerSchema.statics.getBannersByCategory = function(category) {
  return this.getActiveBanners().find({ category })
}

// Pre-save middleware to validate dates
bannerSchema.pre('save', function(next) {
  if (this.endDate && this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'))
  }
  next()
})

// Ensure virtual fields are serialized
bannerSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Banner', bannerSchema)
