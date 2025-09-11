/**
 * Seed Homepage Sections
 * Creates initial homepage sections for the ecommerce platform
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import HomepageSection from '../models/HomepageSection.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

// Load environment variables
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const seedHomepageSections = async () => {
  try {
    await connectDB()

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.')
      process.exit(1)
    }

    // Get some products for the sections
    const products = await Product.find({ status: 'active' }).limit(20)
    if (products.length === 0) {
      console.error('No products found. Please seed products first.')
      process.exit(1)
    }

    // Clear existing sections
    await HomepageSection.deleteMany({})
    console.log('Cleared existing homepage sections')

    // Create homepage sections
    const sections = [
      {
        title: 'Electronics',
        description: 'Latest electronic gadgets and devices',
        type: 'category',
        category: 'electronics',
        products: products.filter(p => p.category === 'electronics').slice(0, 6).map(p => p._id),
        maxProducts: 6,
        order: 1,
        isVisible: true,
        createdBy: adminUser._id
      },
      {
        title: 'Mobile Phones',
        description: 'Best smartphones and accessories',
        type: 'category',
        category: 'mobile',
        products: products.filter(p => p.category === 'mobile').slice(0, 6).map(p => p._id),
        maxProducts: 6,
        order: 2,
        isVisible: true,
        createdBy: adminUser._id
      },
      {
        title: 'Beauty & Personal Care',
        description: 'Premium beauty and personal care products',
        type: 'category',
        category: 'beauty',
        products: products.filter(p => p.category === 'beauty').slice(0, 6).map(p => p._id),
        maxProducts: 6,
        order: 3,
        isVisible: true,
        createdBy: adminUser._id
      },
      {
        title: 'Fashion & Clothing',
        description: 'Trendy fashion and clothing items',
        type: 'category',
        category: 'fashion',
        products: products.filter(p => p.category === 'fashion').slice(0, 6).map(p => p._id),
        maxProducts: 6,
        order: 4,
        isVisible: true,
        createdBy: adminUser._id
      },
      {
        title: 'Featured Products',
        description: 'Handpicked featured products',
        type: 'featured',
        products: products.slice(0, 8).map(p => p._id),
        maxProducts: 8,
        order: 5,
        isVisible: true,
        createdBy: adminUser._id
      },
      {
        title: 'Special Offer',
        description: 'Limited time offers and deals',
        type: 'banner',
        bannerText: 'Get up to 50% off on selected items!',
        bannerLink: '/products?sale=true',
        order: 6,
        isVisible: true,
        createdBy: adminUser._id
      }
    ]

    // Create sections
    const createdSections = await HomepageSection.insertMany(sections)
    console.log(`Created ${createdSections.length} homepage sections`)

    // Display created sections
    createdSections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title} (${section.type}) - ${section.products.length} products`)
    })

    console.log('Homepage sections seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding homepage sections:', error)
    process.exit(1)
  }
}

// Run the seeder
seedHomepageSections()