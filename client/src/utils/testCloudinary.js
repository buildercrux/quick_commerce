/**
 * Test Cloudinary Configuration
 * Simple test to verify Cloudinary setup works
 */

import { uploadImage, getOptimizedImageUrl, CLOUDINARY_CONFIG } from '../config/cloudinary'

// Test function to verify Cloudinary configuration
export const testCloudinaryConfig = () => {
  console.log('Cloudinary Configuration:', CLOUDINARY_CONFIG)
  
  // Test URL generation
  const testPublicId = 'sample'
  const testUrl = getOptimizedImageUrl(testPublicId, {
    width: 200,
    height: 200,
    crop: 'fill'
  })
  
  console.log('Generated URL:', testUrl)
  
  return {
    config: CLOUDINARY_CONFIG,
    testUrl,
    status: 'ready'
  }
}

// Test image upload with a sample file
export const testImageUpload = async (file) => {
  try {
    console.log('Testing image upload...')
    const result = await uploadImage(file, 'ecom-multirole/test')
    console.log('Upload successful:', result)
    return result
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

export default testCloudinaryConfig





