/**
 * Setup Cloudinary Upload Preset
 * This script helps create the upload preset for Cloudinary
 */

const CLOUDINARY_CONFIG = {
  cloud_name: 'drsarxk57',
  api_key: '221264995981298',
  api_secret: 'j78ZaIKDqsnpr0Ni0cr7XYGi8Dk'
}

const createUploadPreset = async () => {
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/upload_presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${CLOUDINARY_CONFIG.api_key}:${CLOUDINARY_CONFIG.api_secret}`)}`
      },
      body: JSON.stringify({
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
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Upload preset created successfully:', result)
    } else {
      const error = await response.json()
      console.error('Error creating upload preset:', error)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the setup
createUploadPreset()





