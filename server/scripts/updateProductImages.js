/**
 * Update Product Images Script
 * Scrapes real product images from Flipkart/Amazon and updates existing products
 */

import mongoose from 'mongoose'
import Product from '../models/Product.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

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

// Product search mappings for better search results
const productSearchMappings = {
  'iPhone 15 Pro': 'iPhone 15 Pro Apple smartphone',
  'Samsung Galaxy S24': 'Samsung Galaxy S24 smartphone',
  'MacBook Air M3': 'MacBook Air M3 Apple laptop',
  'Sony WH-1000XM5': 'Sony WH-1000XM5 headphones',
  'Nike Air Max 270': 'Nike Air Max 270 shoes',
  'Levi\'s 501 Jeans': 'Levi\'s 501 jeans',
  'Adidas T-Shirt': 'Adidas cotton t-shirt',
  'IKEA Malm Bed Frame': 'IKEA Malm bed frame',
  'Herman Miller Aeron Chair': 'Herman Miller Aeron chair',
  'The Great Gatsby': 'The Great Gatsby book',
  'JavaScript: The Good Parts': 'JavaScript The Good Parts book'
}

// Function to search and get product images from Flipkart
async function searchFlipkartProduct(searchQuery) {
  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`
    console.log(`🔍 Searching Flipkart: ${searchQuery}`)
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    const images = []
    
    // Look for product images in the search results
    $('img[src*="img6a"]').each((index, element) => {
      if (index < 3) { // Get first 3 images
        const src = $(element).attr('src')
        if (src && src.includes('img6a')) {
          // Convert to high resolution image
          const highResSrc = src.replace(/q=70/, 'q=100').replace(/w=.*?&/, 'w=400&').replace(/h=.*?&/, 'h=400&')
          images.push({
            public_id: `flipkart_${Date.now()}_${index}`,
            url: highResSrc,
            isPrimary: index === 0
          })
        }
      }
    })
    
    return images
  } catch (error) {
    console.error(`❌ Error searching Flipkart for ${searchQuery}:`, error.message)
    return []
  }
}

// Function to search and get product images from Amazon
async function searchAmazonProduct(searchQuery) {
  try {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`
    console.log(`🔍 Searching Amazon: ${searchQuery}`)
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    const images = []
    
    // Look for product images in the search results
    $('img[data-src*="images-amazon.com"]').each((index, element) => {
      if (index < 3) { // Get first 3 images
        const src = $(element).attr('data-src') || $(element).attr('src')
        if (src && src.includes('images-amazon.com')) {
          images.push({
            public_id: `amazon_${Date.now()}_${index}`,
            url: src,
            isPrimary: index === 0
          })
        }
      }
    })
    
    return images
  } catch (error) {
    console.error(`❌ Error searching Amazon for ${searchQuery}:`, error.message)
    return []
  }
}

// Function to get high-quality product images from Unsplash (fallback)
async function getUnsplashImages(productName, category) {
  try {
    const searchQuery = category === 'electronics' ? 'technology' : 
                      category === 'fashion' ? 'fashion' : 
                      category === 'home' ? 'furniture' : 'books'
    
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: searchQuery,
        per_page: 3,
        orientation: 'squarish'
      },
      headers: {
        'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // You'll need to get this from Unsplash
      }
    })
    
    return response.data.results.map((photo, index) => ({
      public_id: `unsplash_${Date.now()}_${index}`,
      url: photo.urls.regular,
      isPrimary: index === 0
    }))
  } catch (error) {
    console.error(`❌ Error getting Unsplash images:`, error.message)
    return []
  }
}

// Function to get better product images using a more reliable approach
async function getProductImages(productName, category) {
  console.log(`\n🖼️  Getting images for: ${productName}`)
  
  // Try multiple approaches
  let images = []
  
  // Approach 1: Try Flipkart
  const searchQuery = productSearchMappings[productName] || productName
  images = await searchFlipkartProduct(searchQuery)
  
  if (images.length === 0) {
    // Approach 2: Try Amazon
    images = await searchAmazonProduct(searchQuery)
  }
  
  if (images.length === 0) {
    // Approach 3: Use curated high-quality images from Unsplash
    console.log(`📸 Using curated images for ${productName}`)
    images = getCuratedImages(productName, category)
  }
  
  console.log(`✅ Found ${images.length} images for ${productName}`)
  return images
}

// Curated high-quality images as fallback
function getCuratedImages(productName, category) {
  const curatedImages = {
    'iPhone 15 Pro': [
      {
        public_id: `curated_iphone_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_iphone_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      },
      {
        public_id: `curated_iphone_3_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'Samsung Galaxy S24': [
      {
        public_id: `curated_samsung_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_samsung_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'MacBook Air M3': [
      {
        public_id: `curated_macbook_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_macbook_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'Sony WH-1000XM5': [
      {
        public_id: `curated_headphones_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_headphones_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'Nike Air Max 270': [
      {
        public_id: `curated_nike_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_nike_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'Levi\'s 501 Jeans': [
      {
        public_id: `curated_jeans_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_jeans_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'Adidas T-Shirt': [
      {
        public_id: `curated_tshirt_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_tshirt_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'IKEA Malm Bed Frame': [
      {
        public_id: `curated_bed_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_bed_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'Herman Miller Aeron Chair': [
      {
        public_id: `curated_chair_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_chair_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'The Great Gatsby': [
      {
        public_id: `curated_book_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_book_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ],
    'JavaScript: The Good Parts': [
      {
        public_id: `curated_js_book_1_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop&q=80',
        isPrimary: true
      },
      {
        public_id: `curated_js_book_2_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=800&fit=crop&q=80',
        isPrimary: false
      }
    ]
  }
  
  return curatedImages[productName] || [
    {
      public_id: `curated_default_${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop&q=80',
      isPrimary: true
    }
  ]
}

// Main function to update all products
const updateProductImages = async () => {
  try {
    await connectDB()
    
    console.log('🖼️  Starting product image update...')
    
    // Get all products
    const products = await Product.find({ status: 'active' })
    console.log(`📦 Found ${products.length} products to update`)
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      console.log(`\n[${i + 1}/${products.length}] Updating: ${product.name}`)
      
      try {
        // Get new images
        const newImages = await getProductImages(product.name, product.category)
        
        if (newImages.length > 0) {
          // Update the product with new images
          await Product.findByIdAndUpdate(
            product._id,
            { images: newImages },
            { new: true }
          )
          
          console.log(`✅ Updated ${product.name} with ${newImages.length} images`)
        } else {
          console.log(`⚠️  No images found for ${product.name}`)
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`❌ Error updating ${product.name}:`, error.message)
      }
    }
    
    console.log('\n🎉 Product image update completed!')
    
    // Display updated products
    const updatedProducts = await Product.find({ status: 'active' })
    console.log('\n📊 Updated Products Summary:')
    updatedProducts.forEach(product => {
      console.log(`• ${product.name}: ${product.images.length} images`)
    })
    
  } catch (error) {
    console.error('❌ Error updating product images:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the update function
updateProductImages()
