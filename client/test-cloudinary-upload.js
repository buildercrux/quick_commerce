/**
 * Test Cloudinary Upload Configuration
 * Simple test to verify Cloudinary setup
 */

import { uploadImage } from './src/config/cloudinary.js'

// Test function
const testCloudinaryUpload = async () => {
  try {
    console.log('Testing Cloudinary configuration...')
    
    // Check if API secret is configured
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET
    console.log('API Secret configured:', !!apiSecret)
    console.log('API Secret value:', apiSecret ? 'Set' : 'Not set')
    
    // Test with a simple file (you would need to provide an actual file)
    console.log('Cloudinary configuration test completed')
    
  } catch (error) {
    console.error('Cloudinary test error:', error)
  }
}

// Run test
testCloudinaryUpload()





