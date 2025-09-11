/**
 * Homepage Section Model
 * Manages dynamic sections on the homepage
 */

import mongoose from 'mongoose'

const homepageSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['category', 'featured', 'custom', 'banner'],
    default: 'category',
    required: true
  },
  category: {
    type: String,
    trim: true,
    lowercase: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  maxProducts: {
    type: Number,
    default: 6,
    min: 1,
    max: 20
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  bannerImage: {
    public_id: String,
    url: String
  },
  bannerLink: {
    type: String,
    trim: true
  },
  bannerText: {
    type: String,
    trim: true,
    maxlength: [200, 'Banner text cannot be more than 200 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Indexes
homepageSectionSchema.index({ order: 1, isVisible: 1 })
homepageSectionSchema.index({ type: 1, isVisible: 1 })
homepageSectionSchema.index({ category: 1, isVisible: 1 })

// Virtual for populated products
homepageSectionSchema.virtual('populatedProducts', {
  ref: 'Product',
  localField: 'products',
  foreignField: '_id'
})

// Ensure virtual fields are serialized
homepageSectionSchema.set('toJSON', { virtuals: true })

// Static method to get visible sections ordered
homepageSectionSchema.statics.getVisibleSections = function(delivery) {
  const query = this.find({ isVisible: true })
  
  // Apply delivery filter to populated products
  if (delivery && ['instant', 'nextDay', 'standard'].includes(delivery)) {
    query.populate({
      path: 'products',
      match: { [`deliveryOptions.${delivery}`]: true },
      select: 'name price comparePrice images ratings category deliveryOptions'
    })
  } else {
    query.populate('products', 'name price comparePrice images ratings category deliveryOptions')
  }
  
  return query.sort({ order: 1, createdAt: 1 })
}

// Static method to get sections by type
homepageSectionSchema.statics.getSectionsByType = function(type) {
  return this.find({ type, isVisible: true })
    .populate('products', 'name price comparePrice images ratings category')
    .sort({ order: 1, createdAt: 1 })
}

// Instance method to add product
homepageSectionSchema.methods.addProduct = function(productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId)
    // Keep only the maximum number of products
    if (this.products.length > this.maxProducts) {
      this.products = this.products.slice(-this.maxProducts)
    }
  }
  return this.save()
}

// Instance method to remove product
homepageSectionSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(id => id.toString() !== productId.toString())
  return this.save()
}

// Instance method to reorder products
homepageSectionSchema.methods.reorderProducts = function(productIds) {
  this.products = productIds.slice(0, this.maxProducts)
  return this.save()
}

export default mongoose.model('HomepageSection', homepageSectionSchema)



