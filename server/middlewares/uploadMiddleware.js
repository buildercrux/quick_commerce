/**
 * Upload Middleware
 * File upload handling with Cloudinary integration
 * 
 * Features: Image upload, file validation, size limits, multiple formats
 */

const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const { AppError } = require('./errorMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
});

// Upload single image
const uploadSingle = (fieldName = 'image') => {
  return upload.single(fieldName);
};

// Upload multiple images
const uploadMultiple = (fieldName = 'images', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Upload fields
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Cloudinary upload function
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new AppError('Failed to upload image to cloudinary', 500);
  }
};

// Upload single image to Cloudinary
const uploadSingleToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const result = await uploadToCloudinary(req.file, {
      folder: 'ecom-multirole/uploads',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    req.uploadedFile = result;
    next();
  } catch (error) {
    next(error);
  }
};

// Upload multiple images to Cloudinary
const uploadMultipleToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file, {
        folder: 'ecom-multirole/uploads',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);
    req.uploadedFiles = results;
    next();
  } catch (error) {
    next(error);
  }
};

// Upload product images to Cloudinary
const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file, {
        folder: 'ecom-multirole/products',
        transformation: [
          { width: 800, height: 800, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);
    req.productImages = results;
    next();
  } catch (error) {
    next(error);
  }
};

// Upload user avatar to Cloudinary
const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const result = await uploadToCloudinary(req.file, {
      folder: 'ecom-multirole/avatars',
      transformation: [
        { width: 200, height: 200, crop: 'fill', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    req.avatar = result;
    next();
  } catch (error) {
    next(error);
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new AppError('Failed to delete image', 500);
  }
};

// Delete multiple images from Cloudinary
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw new AppError('Failed to delete images', 500);
  }
};

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
  }
  next(error);
};

// Validate image dimensions
const validateImageDimensions = (maxWidth = 2000, maxHeight = 2000) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    // This would require additional processing to get image dimensions
    // For now, we'll skip this validation
    next();
  };
};

// Clean up uploaded files on error
const cleanupUploads = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Clean up any temporary files if needed
    if (req.file && req.file.buffer) {
      req.file.buffer = null;
    }
    if (req.files) {
      req.files.forEach(file => {
        file.buffer = null;
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadSingleToCloudinary,
  uploadMultipleToCloudinary,
  uploadProductImages,
  uploadUserAvatar,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  handleUploadError,
  validateImageDimensions,
  cleanupUploads,
};










