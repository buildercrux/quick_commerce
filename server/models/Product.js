/**
 * Product Model
 * Mongoose schema for product management
 */

import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    trackQuantity: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Low stock threshold cannot be negative']
    },
    allowBackorder: {
      type: Boolean,
      default: false
    }
  },
  shipping: {
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    dimensions: {
      length: {
        type: Number,
        min: [0, 'Length cannot be negative']
      },
      width: {
        type: Number,
        min: [0, 'Width cannot be negative']
      },
      height: {
        type: Number,
        min: [0, 'Height cannot be negative']
      }
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    }
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    }
  },
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  variants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        min: [0, 'Variant price cannot be negative']
      },
      sku: String,
      quantity: {
        type: Number,
        default: 0,
        min: [0, 'Variant quantity cannot be negative']
      },
      image: {
        public_id: String,
        url: String
      }
    }]
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  digitalFile: {
    public_id: String,
    url: String,
    filename: String,
    size: Number
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional for backward compatibility
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  sales: {
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total sales cannot be negative']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Sales count cannot be negative']
    }
  },
  deliveryOptions: {
    instant: {
      type: Boolean,
      default: false
    },
    nextDay: {
      type: Boolean,
      default: false
    },
    standard: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
})

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' })
productSchema.index({ category: 1 })
productSchema.index({ subcategory: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ vendor: 1 })
productSchema.index({ status: 1 })
productSchema.index({ featured: 1 })
productSchema.index({ price: 1 })
productSchema.index({ 'ratings.average': -1 })
productSchema.index({ 'sales.total': -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ sku: 1 })
productSchema.index({ barcode: 1 })
productSchema.index({ slug: 1 })
productSchema.index({ "deliveryOptions.instant": 1, "deliveryOptions.nextDay": 1, "deliveryOptions.standard": 1 })
productSchema.index({ location: '2dsphere' }) // Geospatial index for location queries
productSchema.index({ seller: 1 })

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary)
  return primary || this.images[0] || null
})

// Virtual for isInStock
productSchema.virtual('isInStock').get(function() {
  if (!this.inventory.trackQuantity) return true
  return this.inventory.quantity > 0
})

// Virtual for isLowStock
productSchema.virtual('isLowStock').get(function() {
  if (!this.inventory.trackQuantity) return false
  return this.inventory.quantity <= this.inventory.lowStockThreshold
})

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
  next()
})

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.isModified('images')) {
    let primaryCount = 0
    this.images.forEach((img, index) => {
      if (img.isPrimary) {
        primaryCount++
        if (primaryCount > 1) {
          img.isPrimary = false
        }
      }
    })
    
    // If no primary image, make first one primary
    if (primaryCount === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true
    }
  }
  next()
})

// Instance method to update ratings
productSchema.methods.updateRatings = async function() {
  const Review = mongoose.model('Review')
  const stats = await Review.aggregate([
    { $match: { product: this._id, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ])

  if (stats.length > 0) {
    this.ratings.average = Math.round(stats[0].averageRating * 10) / 10
    this.ratings.count = stats[0].totalReviews
  } else {
    this.ratings.average = 0
    this.ratings.count = 0
  }

  return this.save({ validateBeforeSave: false })
}

// Instance method to update sales
productSchema.methods.updateSales = async function() {
  const Order = mongoose.model('Order')
  const stats = await Order.aggregate([
    { $match: { status: { $in: ['completed', 'delivered'] } } },
    { $unwind: '$items' },
    { $match: { 'items.product': this._id } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$items.total' },
        totalCount: { $sum: '$items.quantity' }
      }
    }
  ])

  if (stats.length > 0) {
    this.sales.total = stats[0].totalSales
    this.sales.count = stats[0].totalCount
  } else {
    this.sales.total = 0
    this.sales.count = 0
  }

  return this.save({ validateBeforeSave: false })
}

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    status: 'active', 
    featured: true 
  })
  .populate('vendor', 'name email vendorProfile.businessName')
  .sort({ 'ratings.average': -1, createdAt: -1 })
  .limit(limit)
}

// Static method to search products
productSchema.statics.search = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    minRating,
    sortBy = 'newest',
    page = 1,
    limit = 20,
    delivery,
    lat,
    lng,
    pincode,
    radiusKm = 5
  } = options

  let searchQuery = { status: 'active' }

  // Text search
  if (query) {
    searchQuery.$text = { $search: query }
  }

  // Category filter
  if (category) {
    searchQuery.category = category
  }

  // Price range filter
  if (minPrice || maxPrice) {
    searchQuery.price = {}
    if (minPrice) searchQuery.price.$gte = minPrice
    if (maxPrice) searchQuery.price.$lte = maxPrice
  }

  // Rating filter
  if (minRating) {
    searchQuery['ratings.average'] = { $gte: minRating }
  }

  // Delivery filter
  if (delivery) {
    if (['instant', 'nextDay', 'standard'].includes(delivery)) {
      searchQuery[`deliveryOptions.${delivery}`] = true
    }
  }

  // Location-based filtering
  if (lat && lng) {
    // Geospatial query - find products within radius
    searchQuery.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    }
  } else if (pincode) {
    // Pincode-based query - find products by seller pincode
    searchQuery['sellerPincode'] = pincode
  }

  // Sort options
  let sort = {}
  switch (sortBy) {
    case 'newest':
      sort = { createdAt: -1 }
      break
    case 'oldest':
      sort = { createdAt: 1 }
      break
    case 'price_low':
      sort = { price: 1 }
      break
    case 'price_high':
      sort = { price: -1 }
      break
    case 'rating':
      sort = { 'ratings.average': -1 }
      break
    case 'popular':
      sort = { 'sales.count': -1 }
      break
    case 'distance':
      // For distance sorting, we need to use aggregation pipeline
      if (lat && lng) {
        return this.aggregate([
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              distanceField: 'distance',
              maxDistance: radiusKm * 1000,
              spherical: true
            }
          },
          { $match: searchQuery },
          { $sort: { distance: 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'sellers',
              localField: 'seller',
              foreignField: '_id',
              as: 'sellerInfo'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'vendor',
              foreignField: '_id',
              as: 'vendorInfo'
            }
          }
        ])
      }
      break
    default:
      sort = { createdAt: -1 }
  }

  const skip = (page - 1) * limit

  return this.find(searchQuery)
    .populate('vendor', 'name email vendorProfile.businessName')
    .populate('seller', 'name email storeName address geo serviceRadiusKm')
    .sort(sort)
    .skip(skip)
    .limit(limit)
}

export default mongoose.model('Product', productSchema)