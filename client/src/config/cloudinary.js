/**
 * Cloudinary Configuration
 * Image upload and management service
 */

// Cloudinary configuration - using direct API calls instead of SDK for browser compatibility
const CLOUDINARY_CONFIG = {
  cloud_name: 'drsarxk57',
  api_key: '221264995981298',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your_api_secret_here',
  upload_preset: 'ecom-multirole'
}

// Check if API secret is configured
const isConfigured = () => {
  return CLOUDINARY_CONFIG.api_secret && CLOUDINARY_CONFIG.api_secret !== 'your_api_secret_here'
}

// Image upload function
export const uploadImage = async (file, folder = 'ecom-multirole') => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ecom-multirole') // Use our custom preset
    formData.append('folder', folder)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to upload image')
    }

    const data = await response.json()
    return {
      public_id: data.public_id,
      url: data.secure_url,
      width: data.width,
      height: data.height
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Multiple images upload
export const uploadMultipleImages = async (files, folder = 'ecom-multirole') => {
  try {
    const uploadPromises = Array.from(files).map((file, index) => 
      uploadImage(file, folder).then(result => ({
        ...result,
        isPrimary: index === 0
      }))
    )

    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}

// Generate optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  }

  // Build URL manually
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload`
  const params = new URLSearchParams()
  
  Object.entries(defaultOptions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value)
    }
  })
  
  const paramString = params.toString()
  return `${baseUrl}/${paramString ? paramString + '/' : ''}${publicId}`
}

// Generate responsive image URLs
export const getResponsiveImageUrls = (publicId, baseOptions = {}) => {
  const sizes = [
    { width: 200, height: 200, crop: 'fill' },
    { width: 400, height: 400, crop: 'fill' },
    { width: 800, height: 800, crop: 'fill' },
    { width: 1200, height: 1200, crop: 'fill' }
  ]

  return sizes.map(size => ({
    ...size,
    url: getOptimizedImageUrl(publicId, {
      ...baseOptions,
      ...size
    })
  }))
}

// Delete image
export const deleteImage = async (publicId) => {
  try {
    // Check if Cloudinary is properly configured
    if (!isConfigured()) {
      throw new Error('Cloudinary API secret not configured. Please set VITE_CLOUDINARY_API_SECRET in your .env file.')
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        api_key: CLOUDINARY_CONFIG.api_key,
        api_secret: CLOUDINARY_CONFIG.api_secret,
        timestamp: Math.round(new Date().getTime() / 1000)
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to delete image')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

// Export configuration for reference
export { CLOUDINARY_CONFIG }
