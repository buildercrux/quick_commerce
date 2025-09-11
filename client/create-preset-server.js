/**
 * Create Cloudinary Upload Preset - Server Side
 * This script creates the required upload preset for the application
 */

import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({ 
  cloud_name: 'drsarxk57', 
  api_key: '221264995981298', 
  api_secret: 'j78ZaIKDqsnpr0Ni0cr7XYGi8Dk'
});

async function createUploadPreset() {
  try {
    console.log('🚀 Creating Cloudinary upload preset...');
    
    // Create upload preset
    const result = await cloudinary.api.create_upload_preset({
      name: 'ecom-multirole',
      unsigned: true,
      folder: 'ecom-multirole',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_file_size: 10485760, // 10MB
      transformation: {
        quality: 'auto',
        fetch_format: 'auto'
      }
    });
    
    console.log('✅ Upload preset created successfully!');
    console.log('Preset name:', result.name);
    console.log('Preset ID:', result.preset);
    console.log('Unsigned:', result.unsigned);
    
  } catch (error) {
    if (error.error && error.error.message === 'Upload preset with this name already exists') {
      console.log('✅ Upload preset already exists!');
      console.log('Preset name: ecom-multirole');
    } else {
      console.error('❌ Error creating upload preset:', error);
    }
  }
}

// Run the function
createUploadPreset();





