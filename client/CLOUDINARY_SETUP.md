# Cloudinary Setup Guide

## 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Note your Cloud Name, API Key, and API Secret from the dashboard

## 2. Create Upload Preset
1. In Cloudinary Dashboard, go to Settings > Upload
2. Click "Add upload preset"
3. Set the following:
   - **Preset name**: `ecom-multirole`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `ecom-multirole`
   - **Resource Type**: `Image`
   - **Access Mode**: `Public`

## 3. Environment Variables
Create a `.env` file in the client directory with:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

# Backend API URL
VITE_API_URL=http://localhost:3001
```

## 4. Current Configuration
The app is configured with:
- **Cloud Name**: `drsarxk57`
- **API Key**: `221264995981298`
- **Upload Preset**: `ecom-multirole`

## 5. Folder Structure
Images will be organized as:
- Products: `ecom-multirole/products/`
- Banners: `ecom-multirole/banners/`
- Test: `ecom-multirole/test/`

## 6. Features
- ✅ Image upload with progress indicators
- ✅ Multiple image upload for products
- ✅ Banner image upload with aspect ratio control
- ✅ Image preview and deletion
- ✅ Automatic optimization (format, quality, size)
- ✅ Responsive image URLs
- ✅ Error handling and fallbacks

## 7. Testing
You can test the configuration by importing the test utility:

```javascript
import { testCloudinaryConfig } from './utils/testCloudinary'

// Test configuration
const result = testCloudinaryConfig()
console.log(result)
```





