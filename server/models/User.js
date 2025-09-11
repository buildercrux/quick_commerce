/**
 * User Model
 * Mongoose schema for user management
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d'

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_crop,g_face,r_max/w_200/lady.jpg'
    }
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  refreshTokens: [{
    type: String,
    select: false
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Vendor specific fields
  vendorProfile: {
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, 'Business name cannot be more than 100 characters']
    },
    businessDescription: {
      type: String,
      maxlength: [500, 'Business description cannot be more than 500 characters']
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    businessPhone: String,
    businessEmail: String,
    businessWebsite: String,
    taxId: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [{
      type: {
        type: String,
        enum: ['business_license', 'tax_certificate', 'identity_document']
      },
      public_id: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Customer specific fields
  shippingAddresses: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
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
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  // Cloud wishlist (product ids)
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
})

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isSuspended: 1 })
userSchema.index({ 'vendorProfile.isVerified': 1 })

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name
})

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Instance method to match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Instance method to get signed JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  )
}

// Instance method to get signed refresh token
userSchema.methods.getSignedRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE }
  )
}

// Instance method to add refresh token
userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push(token)
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5)
  }
  
  return this.save({ validateBeforeSave: false })
}

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(t => t !== token)
  return this.save({ validateBeforeSave: false })
}

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  return this.save({ validateBeforeSave: false })
}

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Transform JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  
  // Remove sensitive fields
  delete userObject.password
  delete userObject.refreshTokens
  delete userObject.__v
  
  return userObject
}

export default mongoose.model('User', userSchema)