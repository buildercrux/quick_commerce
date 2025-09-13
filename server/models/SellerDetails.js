/**
 * SellerDetails Model
 * Linked 1:1 with a User document (role: seller)
 */

import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: 'India' }
}, { _id: false })

const geoSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: {
    type: [Number], // [lng, lat]
    validate: {
      validator: function(coords) {
        return !coords || coords.length === 2
      },
      message: 'Coordinates must be [longitude, latitude]'
    }
  }
}, { _id: false })

const sellerDetailsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  sellerName: { type: String, trim: true, required: true },
  phone: { type: String, trim: true },
  address: { type: addressSchema, default: {} },
  location: { type: geoSchema, default: undefined },
  pincode: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

sellerDetailsSchema.index({ user: 1 }, { unique: true })
sellerDetailsSchema.index({ pincode: 1 })
sellerDetailsSchema.index({ location: '2dsphere' })

sellerDetailsSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('SellerDetails', sellerDetailsSchema)



