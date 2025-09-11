/**
 * Seed Products Script
 * Creates sample products for testing
 */

import mongoose from 'mongoose'
import Product from '../models/Product.js'
import User from '../models/User.js'

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://buildercrux:This%401234@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority&appName=Cluster0')
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Helper function to generate random delivery options
const generateDeliveryOptions = () => {
  const options = ['instant', 'nextDay', 'standard']
  const selectedOptions = {}
  
  // Always include standard delivery
  selectedOptions.standard = true
  
  // Randomly assign instant delivery (30% chance)
  selectedOptions.instant = Math.random() < 0.3
  
  // Randomly assign next day delivery (50% chance)
  selectedOptions.nextDay = Math.random() < 0.5
  
  return selectedOptions
}

const seedProducts = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Seeding products...')
    
    // Get admin user
    const adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.')
      return
    }
    
    // Clear existing products
    await Product.deleteMany({})
    console.log('🗑️ Cleared existing products')
    
    // Sample products
    const products = [
      // Electronics
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system',
        price: 99999,
        comparePrice: 109999,
        category: 'electronics',
        brand: 'Apple',
        sku: 'IPH15PRO-128',
        'inventory.quantity': 50,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_iphone_1',
            url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ],
        deliveryOptions: {
          instant: true,
          nextDay: true,
          standard: true
        }
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Premium Android smartphone',
        price: 79999,
        comparePrice: 89999,
        category: 'electronics',
        brand: 'Samsung',
        sku: 'SGS24-256',
        'inventory.quantity': 30,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_samsung',
            url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      {
        name: 'MacBook Air M3',
        description: 'Ultra-thin laptop with M3 chip',
        price: 129999,
        comparePrice: 139999,
        category: 'electronics',
        brand: 'Apple',
        sku: 'MBA-M3-256',
        'inventory.quantity': 20,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_macbook',
            url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Premium noise-cancelling headphones',
        price: 29999,
        comparePrice: 34999,
        category: 'electronics',
        brand: 'Sony',
        sku: 'WH1000XM5',
        'inventory.quantity': 40,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_headphones',
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      
      // Fashion
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes',
        price: 12999,
        comparePrice: 14999,
        category: 'fashion',
        brand: 'Nike',
        sku: 'NAM270-BLK',
        'inventory.quantity': 100,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_nike',
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      {
        name: 'Levi\'s 501 Jeans',
        description: 'Classic straight fit jeans',
        price: 3999,
        comparePrice: 4999,
        category: 'fashion',
        brand: 'Levi\'s',
        sku: 'LEV501-BLU',
        'inventory.quantity': 75,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_jeans',
            url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      {
        name: 'Adidas T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 1999,
        comparePrice: 2499,
        category: 'fashion',
        brand: 'Adidas',
        sku: 'ADIDAS-TS-WHT',
        'inventory.quantity': 150,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_tshirt',
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      
      // Home & Furniture
      {
        name: 'IKEA Malm Bed Frame',
        description: 'Modern platform bed frame',
        price: 15999,
        comparePrice: 19999,
        category: 'home',
        brand: 'IKEA',
        sku: 'IKEA-MALM-QUEEN',
        'inventory.quantity': 25,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_bed',
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      {
        name: 'Herman Miller Aeron Chair',
        description: 'Ergonomic office chair',
        price: 89999,
        comparePrice: 99999,
        category: 'home',
        brand: 'Herman Miller',
        sku: 'HM-AERON-SIZE-B',
        'inventory.quantity': 15,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_chair',
            url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      
      // Books
      {
        name: 'The Great Gatsby',
        description: 'Classic American novel',
        price: 299,
        comparePrice: 399,
        category: 'books',
        brand: 'Penguin Classics',
        sku: 'BOOK-GATSBY',
        'inventory.quantity': 200,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_book',
            url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      },
      {
        name: 'JavaScript: The Good Parts',
        description: 'Essential JavaScript programming guide',
        price: 1299,
        comparePrice: 1599,
        category: 'books',
        brand: 'O\'Reilly',
        sku: 'BOOK-JS-GOOD',
        'inventory.quantity': 50,
        status: 'active',
        vendor: adminUser._id,
        images: [
          {
            public_id: 'sample_js_book',
            url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
            isPrimary: true
          }
        ]
      }
    ]
    
    // Create products
    const createdProducts = await Product.insertMany(products)
    console.log(`✅ Created ${createdProducts.length} products`)
    
    // Add random delivery options to all products
    console.log('🚚 Adding delivery options...')
    for (const product of createdProducts) {
      const deliveryOptions = generateDeliveryOptions()
      await Product.findByIdAndUpdate(product._id, { deliveryOptions })
    }
    console.log('✅ Delivery options added to all products')
    
    // Display created products by category
    const categories = [...new Set(createdProducts.map(p => p.category))]
    categories.forEach(category => {
      const categoryProducts = createdProducts.filter(p => p.category === category)
      console.log(`📦 ${category}: ${categoryProducts.length} products`)
    })
    
    console.log('🎉 Products seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding products:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the seed function
seedProducts()



