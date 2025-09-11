/**
 * Create Cloudinary Upload Preset
 * This script creates the required upload preset for the application
 */

import https from 'https';

const CLOUDINARY_CONFIG = {
  cloud_name: 'drsarxk57',
  api_key: '221264995981298',
  api_secret: 'j78ZaIKDqsnpr0Ni0cr7XYGi8Dk'
};

const createUploadPreset = () => {
  const postData = JSON.stringify({
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

  const auth = Buffer.from(`${CLOUDINARY_CONFIG.api_key}:${CLOUDINARY_CONFIG.api_secret}`).toString('base64');

  const options = {
    hostname: 'api.cloudinary.com',
    port: 443,
    path: `/v1_1/${CLOUDINARY_CONFIG.cloud_name}/upload_presets`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Basic ${auth}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Upload preset created successfully!');
          console.log('Preset name:', result.name);
          console.log('Preset ID:', result.preset);
        } else {
          console.error('❌ Error creating upload preset:');
          console.error('Status:', res.statusCode);
          console.error('Response:', result);
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.error('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.write(postData);
  req.end();
};

console.log('🚀 Creating Cloudinary upload preset...');
createUploadPreset();