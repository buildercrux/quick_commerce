/**
 * Migration Script: Add location data to existing products
 * This script back-fills location data for existing products based on their vendor's location
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Seller from '../models/Seller.js'

// Load environment variables
dotenv.config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom-multirole', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

const migrateProductLocations = async () => {
  try {
    console.log('Starting product location migration...')

    // Get all products that don't have location data
    const productsWithoutLocation = await Product.find({
      $or: [
        { location: { $exists: false } },
        { location: null },
        { 'location.coordinates': { $exists: false } }
      ]
    }).populate('vendor seller')

    console.log(`Found ${productsWithoutLocation.length} products without location data`)

    let updatedCount = 0
    let skippedCount = 0

    for (const product of productsWithoutLocation) {
      let locationData = null

      // Try to get location from seller first
      if (product.seller && product.seller.geo) {
        locationData = product.seller.geo
        console.log(`Using seller location for product: ${product.name}`)
      }
      // Fallback to vendor location if available
      else if (product.vendor && product.vendor.vendorProfile && product.vendor.vendorProfile.businessAddress) {
        // For vendors, we need to geocode their address
        // This is a simplified approach - in production, you'd use a geocoding service
        const address = product.vendor.vendorProfile.businessAddress
        if (address.city && address.state) {
          // Default coordinates for major cities (you'd replace this with actual geocoding)
          const defaultCoordinates = getDefaultCoordinates(address.city, address.state)
          if (defaultCoordinates) {
            locationData = {
              type: 'Point',
              coordinates: defaultCoordinates
            }
            console.log(`Using default coordinates for vendor product: ${product.name}`)
          }
        }
      }

      if (locationData) {
        await Product.findByIdAndUpdate(product._id, {
          location: locationData
        })
        updatedCount++
        console.log(`Updated product: ${product.name}`)
      } else {
        skippedCount++
        console.log(`Skipped product (no location data): ${product.name}`)
      }
    }

    console.log('\nMigration completed!')
    console.log(`Updated: ${updatedCount} products`)
    console.log(`Skipped: ${skippedCount} products`)

  } catch (error) {
    console.error('Error during migration:', error)
  }
}

// Default coordinates for major cities (simplified approach)
const getDefaultCoordinates = (city, state) => {
  const cityCoordinates = {
    'Mumbai': [72.8777, 19.0760],
    'Delhi': [77.1025, 28.7041],
    'Bangalore': [77.5946, 12.9716],
    'Hyderabad': [78.4867, 17.3850],
    'Chennai': [80.2707, 13.0827],
    'Kolkata': [88.3639, 22.5726],
    'Pune': [73.8567, 18.5204],
    'Ahmedabad': [72.5714, 23.0225],
    'Jaipur': [75.7873, 26.9124],
    'Surat': [72.8311, 21.1702],
    'Lucknow': [80.9462, 26.8467],
    'Kanpur': [80.3319, 26.4499],
    'Nagpur': [79.0882, 21.1458],
    'Indore': [75.8013, 22.7196],
    'Thane': [72.9667, 19.2183],
    'Bhopal': [77.4126, 23.2599],
    'Visakhapatnam': [83.2185, 17.6868],
    'Pimpri-Chinchwad': [73.7927, 18.6298],
    'Patna': [85.1376, 25.5941],
    'Vadodara': [73.1812, 22.3072]
  }

  const key = city.toLowerCase()
  for (const [cityName, coords] of Object.entries(cityCoordinates)) {
    if (key.includes(cityName.toLowerCase())) {
      return coords
    }
  }

  // Default to Delhi if no match found
  return [77.1025, 28.7041]
}

const runMigration = async () => {
  await connectDB()
  await migrateProductLocations()
  process.exit(0)
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
}

export default migrateProductLocations
