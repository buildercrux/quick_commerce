/**
 * Seed Banners Script
 * Populates the database with sample banner data
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Banner from '../models/Banner.js'

// Load environment variables
dotenv.config()

const sampleBanners = [
  {
    title: 'Summer Sale - Up to 70% Off',
    description: 'Discover amazing deals on electronics, fashion, and more. Limited time offer!',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop&q=80',
    buttonText: 'Shop Now',
    buttonLink: '/products?category=electronics',
    isActive: true,
    order: 1,
    priority: 10,
    category: 'electronics',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    title: 'New Arrivals - Fashion Collection',
    description: 'Explore the latest trends in fashion. Fresh styles for every occasion.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop&q=80',
    buttonText: 'Explore Fashion',
    buttonLink: '/products?category=fashion',
    isActive: true,
    order: 2,
    priority: 9,
    category: 'fashion',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
  },
  {
    title: 'Mobile Mania - Latest Smartphones',
    description: 'Get the newest smartphones with amazing features and great prices.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=600&fit=crop&q=80',
    buttonText: 'View Mobiles',
    buttonLink: '/products?category=mobile',
    isActive: true,
    order: 3,
    priority: 8,
    category: 'electronics',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
  },
  {
    title: 'Beauty & Personal Care',
    description: 'Pamper yourself with our premium beauty and personal care products.',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=600&fit=crop&q=80',
    buttonText: 'Shop Beauty',
    buttonLink: '/products?category=beauty',
    isActive: true,
    order: 4,
    priority: 7,
    category: 'beauty',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  },
  {
    title: 'Home & Living Essentials',
    description: 'Transform your home with our curated collection of home essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop&q=80',
    buttonText: 'Shop Home',
    buttonLink: '/products?category=home',
    isActive: true,
    order: 5,
    priority: 6,
    category: 'home',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) // 120 days from now
  },
  {
    title: 'Sports & Fitness Gear',
    description: 'Stay active and healthy with our premium sports and fitness equipment.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&q=80',
    buttonText: 'Shop Sports',
    buttonLink: '/products?category=sports',
    isActive: true,
    order: 6,
    priority: 5,
    category: 'sports',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000) // 150 days from now
  },
  {
    title: 'Books & Stationery',
    description: 'Expand your knowledge with our vast collection of books and stationery.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=600&fit=crop&q=80',
    buttonText: 'Browse Books',
    buttonLink: '/products?category=books',
    isActive: true,
    order: 7,
    priority: 4,
    category: 'books',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days from now
  },
  {
    title: 'Flash Sale - 24 Hours Only',
    description: 'Don\'t miss out on our flash sale! Huge discounts for the next 24 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop&q=80',
    buttonText: 'Shop Flash Sale',
    buttonLink: '/products?sale=true',
    isActive: true,
    order: 8,
    priority: 10,
    category: 'general',
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
]

const seedBanners = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
    console.log('📦 Connected to MongoDB')

    // Clear existing banners
    await Banner.deleteMany({})
    console.log('🗑️  Cleared existing banners')

    // Create new banners
    const banners = await Banner.insertMany(sampleBanners)
    console.log(`✅ Created ${banners.length} banners`)

    // Display created banners
    console.log('\n📋 Created Banners:')
    banners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title} (${banner.category}) - Priority: ${banner.priority}`)
    })

    console.log('\n🎉 Banner seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding banners:', error)
    process.exit(1)
  }
}

// Run the seed function
seedBanners()
