/**
 * Check Inventory Data Script
 * Script to check if products have inventory data in the database
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../models/Product.js'
import connectDB from '../config/database.js'

dotenv.config()
connectDB()

const checkInventoryData = async () => {
  try {
    console.log('🔍 Checking inventory data in database...')
    
    // Get all products
    const products = await Product.find({}).limit(5)
    
    console.log(`📦 Found ${products.length} products`)
    
    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1} ---`)
      console.log('Name:', product.name)
      console.log('ID:', product._id)
      console.log('Inventory:', product.inventory)
      console.log('Has inventory field:', 'inventory' in product)
      console.log('Inventory type:', typeof product.inventory)
      
      if (product.inventory) {
        console.log('Track Quantity:', product.inventory.trackQuantity)
        console.log('Quantity:', product.inventory.quantity)
        console.log('Low Stock Threshold:', product.inventory.lowStockThreshold)
        console.log('Allow Backorder:', product.inventory.allowBackorder)
      }
    })
    
    // Check if any products have inventory data
    const productsWithInventory = await Product.find({
      'inventory.quantity': { $exists: true, $gt: 0 }
    })
    
    console.log(`\n📊 Products with inventory > 0: ${productsWithInventory.length}`)
    
    // Check if any products have inventory field at all
    const productsWithInventoryField = await Product.find({
      inventory: { $exists: true }
    })
    
    console.log(`📊 Products with inventory field: ${productsWithInventoryField.length}`)
    
  } catch (error) {
    console.error('❌ Error checking inventory data:', error)
  } finally {
    mongoose.connection.close()
  }
}

checkInventoryData()
