/**
 * Seller Model
 * Mongoose schema for seller management with location awareness
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d'

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please add a valid phone number'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  storeName: {
    type: String,
    required: [true, 'Please add a store name'],
    trim: true,
    maxlength: [100, 'Store name cannot be more than 100 characters']
  },
  storeDescription: {
    type: String,
    maxlength: [500, 'Store description cannot be more than 500 characters'],
    trim: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add street address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please add city'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Please add pincode'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Please add country'],
      trim: true,
      default: 'India'
    }
  },
  geo: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90      // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    }
  },
  serviceRadiusKm: {
    type: Number,
    default: 5,
    min: [1, 'Service radius must be at least 1 km'],
    max: [100, 'Service radius cannot exceed 100 km']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_crop,g_face,r_max/w_200/lady.jpg'
    }
  },
  businessDocuments: [{
    type: {
      type: String,
      enum: ['business_license', 'tax_certificate', 'identity_document', 'address_proof'],
      required: true
    },
    public_id: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  refreshTokens: [{
    type: String,
    select: false
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Business metrics
  metrics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  // Business hours
  businessHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  // Payment settings
  paymentSettings: {
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String
    },
    upiId: String,
    gstNumber: String
  }
}, {
  timestamps: true
})

// Indexes
sellerSchema.index({ email: 1 })
sellerSchema.index({ isApproved: 1 })
sellerSchema.index({ isSuspended: 1 })
sellerSchema.index({ geo: '2dsphere' }) // Geospatial index for location queries
sellerSchema.index({ 'address.pincode': 1 })
sellerSchema.index({ storeName: 'text', storeDescription: 'text' })

// Virtual for full address
sellerSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.pincode}, ${this.address.country}`
})

// Pre-save middleware to hash password
sellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Instance method to match password
sellerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Instance method to get signed JWT token
sellerSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: 'seller' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  )
}

// Instance method to get signed refresh token
sellerSchema.methods.getSignedRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE }
  )
}

// Instance method to add refresh token
sellerSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push(token)
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5)
  }
  
  return this.save({ validateBeforeSave: false })
}

// Instance method to remove refresh token
sellerSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(t => t !== token)
  return this.save({ validateBeforeSave: false })
}

// Instance method to update last login
sellerSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  return this.save({ validateBeforeSave: false })
}

// Static method to find seller by email
sellerSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to find sellers within radius
sellerSchema.statics.findWithinRadius = function(longitude, latitude, radiusKm) {
  return this.find({
    geo: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    },
    isApproved: true,
    isSuspended: false
  })
}

// Static method to find sellers by pincode
sellerSchema.statics.findByPincode = function(pincode) {
  return this.find({
    'address.pincode': pincode,
    isApproved: true,
    isSuspended: false
  })
}

// Transform JSON output
sellerSchema.methods.toJSON = function() {
  const sellerObject = this.toObject()
  
  // Remove sensitive fields
  delete sellerObject.password
  delete sellerObject.refreshTokens
  delete sellerObject.__v
  
  return sellerObject
}

export default mongoose.model('Seller', sellerSchema)
