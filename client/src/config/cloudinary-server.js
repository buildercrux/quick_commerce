/**
 * Cloudinary Server Configuration
 * Server-side Cloudinary utilities for advanced operations
 */

import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({ 
  cloud_name: 'drsarxk57', 
  api_key: '221264995981298', 
  api_secret: 'j78ZaIKDqsnpr0Ni0cr7XYGi8Dk'
});

// Upload image with transformations
export const uploadImageWithTransform = async (file, options = {}) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: 'ecom-multirole',
      resource_type: 'image',
      ...options
    });
    
    return {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

// Generate responsive image URLs
export const getResponsiveImageUrls = (publicId, baseOptions = {}) => {
  const sizes = [
    { width: 200, height: 200, crop: 'fill' },
    { width: 400, height: 400, crop: 'fill' },
    { width: 800, height: 800, crop: 'fill' },
    { width: 1200, height: 1200, crop: 'fill' }
  ];

  return sizes.map(size => ({
    ...size,
    url: cloudinary.url(publicId, {
      ...baseOptions,
      ...size
    })
  }));
};

// Delete image
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export default cloudinary;





