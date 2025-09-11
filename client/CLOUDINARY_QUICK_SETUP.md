# 🚀 Cloudinary Quick Setup Guide

## **Current Status: ❌ API Secret Missing**

You need to set your Cloudinary API secret to enable image uploads.

## **🔧 Quick Fix (2 minutes):**

### **Step 1: Get Your API Secret**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign in to your account
3. Go to **Dashboard → Settings → API Keys**
4. Copy your **API Secret** (long string of characters)

### **Step 2: Update .env File**
Replace `YOUR_ACTUAL_API_SECRET_HERE` in the `.env` file with your actual API secret:

```bash
# Edit the .env file
nano .env

# Or use any text editor to replace:
# VITE_CLOUDINARY_API_SECRET=YOUR_ACTUAL_API_SECRET_HERE
# with:
# VITE_CLOUDINARY_API_SECRET=your_actual_secret_here
```

### **Step 3: Create Upload Preset**
1. Go to **Cloudinary Dashboard → Settings → Upload**
2. Click **"Add upload preset"**
3. Set the following:
   - **Preset name**: `ecom-multirole`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `ecom-multirole`
   - **Resource Type**: `Image`
   - **Access Mode**: `Public`
4. Click **"Save"**

### **Step 4: Restart Development Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## **🧪 Test Your Setup:**

### **Option 1: Use the test script**
```bash
node test-cloudinary-setup.js
```

### **Option 2: Test in browser**
1. Go to Admin → Products
2. Click "Add New Product"
3. Try uploading an image
4. Check browser console for errors

## **✅ Success Indicators:**
- ✅ No "API secret not configured" errors
- ✅ Image uploads successfully
- ✅ Image previews in the form
- ✅ Images appear in product list

## **❌ Common Issues:**

### **Issue: "API secret not configured"**
- **Cause**: Missing or incorrect API secret in .env file
- **Fix**: Check .env file has correct VITE_CLOUDINARY_API_SECRET

### **Issue: "Upload preset not found"**
- **Cause**: Upload preset not created in Cloudinary dashboard
- **Fix**: Create unsigned preset named "ecom-multirole"

### **Issue: "Invalid API secret"**
- **Cause**: Wrong API secret or expired credentials
- **Fix**: Check Cloudinary dashboard for correct API secret

## **📁 Files to Check:**
- `.env` - Contains your API secret
- `src/config/cloudinary.js` - Cloudinary configuration
- `src/components/ui/ImageUpload.jsx` - Image upload component

---

**Need Help?** Check the browser console for specific error messages!





