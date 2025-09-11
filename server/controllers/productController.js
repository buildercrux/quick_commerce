/**
 * Product Controller
 * Handles product management operations
 */

import Product from '../models/Product.js'
import { validationResult } from 'express-validator'
import { v2 as cloudinary } from 'cloudinary'

/**
 * @desc    Get all products with filters
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'newest',
      delivery,
      lat,
      lng,
      pincode,
      radiusKm = 5
    } = req.query

    // Build search query directly instead of using search method with empty string
    const parsedOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      sortBy,
      lat,
      lng,
      pincode,
      radiusKm: parseFloat(radiusKm)
    }

    let searchQuery = { status: 'active' }

    // Category filter
    if (category) {
      searchQuery.category = category
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {}
      if (minPrice) searchQuery.price.$gte = minPrice
      if (maxPrice) searchQuery.price.$lte = maxPrice
    }

    // Rating filter
    if (minRating) {
      searchQuery['ratings.average'] = { $gte: minRating }
    }

    // Delivery filter
    if (delivery) {
      if (['instant', 'nextDay', 'standard'].includes(delivery)) {
        searchQuery[`deliveryOptions.${delivery}`] = true
      }
    }

    // Location-based filtering
    if (lat && lng) {
      // Geospatial query - find products within radius
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parsedOptions.radiusKm * 1000 // Convert km to meters
        }
      }
    } else if (pincode) {
      // Pincode-based query - find products by seller pincode
      // We need to use aggregation for this since we need to join with sellers
      const Seller = (await import('../models/Seller.js')).default
      const sellersInPincode = await Seller.find({
        'address.pincode': pincode,
        isApproved: true,
        isSuspended: false
      }).select('_id')
      
      const sellerIds = sellersInPincode.map(seller => seller._id)
      searchQuery.seller = { $in: sellerIds }
    }

    // Sort options
    let sort = {}
    let useAggregation = false
    
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 }
        break
      case 'oldest':
        sort = { createdAt: 1 }
        break
      case 'price_low':
        sort = { price: 1 }
        break
      case 'price_high':
        sort = { price: -1 }
        break
      case 'rating':
        sort = { 'ratings.average': -1 }
        break
      case 'popular':
        sort = { 'sales.count': -1 }
        break
      case 'distance':
        if (lat && lng) {
          useAggregation = true
        } else {
          sort = { createdAt: -1 }
        }
        break
      default:
        sort = { createdAt: -1 }
    }

    const skip = (parsedOptions.page - 1) * parsedOptions.limit

    let result, total

    if (useAggregation) {
      // Use aggregation pipeline for distance sorting
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: 'distance',
            maxDistance: parsedOptions.radiusKm * 1000,
            spherical: true
          }
        },
        { $match: searchQuery },
        { $sort: { distance: 1 } },
        { $skip: skip },
        { $limit: parsedOptions.limit },
        {
          $lookup: {
            from: 'sellers',
            localField: 'seller',
            foreignField: '_id',
            as: 'sellerInfo'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'vendor',
            foreignField: '_id',
            as: 'vendorInfo'
          }
        }
      ]

      result = await Product.aggregate(pipeline)
      total = await Product.countDocuments(searchQuery)
    } else {
      // Regular query
      result = await Product.find(searchQuery)
        .populate('vendor', 'name email vendorProfile.businessName')
        .populate('seller', 'name email storeName address geo serviceRadiusKm')
        .sort(sort)
        .skip(skip)
        .limit(parsedOptions.limit)

      total = await Product.countDocuments(searchQuery)
    }

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        page: parsedOptions.page,
        limit: parsedOptions.limit,
        total,
        pages: Math.ceil(total / parsedOptions.limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single product
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email vendorProfile.businessName')

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Only show active products to non-owners
    if (product.status !== 'active' && 
        (!req.user || (req.user._id.toString() !== product.vendor._id.toString() && req.user.role !== 'admin'))) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get multiple products by IDs
 * @route   GET /api/v1/products/batch
 * @access  Public
 */
export const getProductsByIds = async (req, res, next) => {
  try {
    const { ids } = req.query
    
    if (!ids) {
      return res.status(400).json({
        success: false,
        error: 'Product IDs are required'
      })
    }

    // Parse comma-separated IDs
    const productIds = ids.split(',').map(id => id.trim()).filter(id => id)
    
    if (productIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid product IDs provided'
      })
    }

    // Fetch products with complete data including inventory
    const products = await Product.find({
      _id: { $in: productIds },
      status: 'active'
    })
      .populate('vendor', 'name email vendorProfile.businessName')
      .populate('seller', 'name email storeName address geo serviceRadiusKm')

    console.log('🔍 Backend - Batch Products Response:', {
      requestedIds: productIds,
      foundProducts: products.length,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        inventory: p.inventory
      }))
    })

    res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get featured products
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const limit = parseInt(req.query.limit) || 10
    const products = await Product.getFeatured(limit)

    res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all categories
 * @route   GET /api/v1/products/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' })

    res.status(200).json({
      success: true,
      data: categories
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Search products
 * @route   GET /api/v1/products/search
 * @access  Public
 */
export const searchProducts = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const {
      q,
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'newest',
      delivery
    } = req.query

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      sortBy,
      delivery
    }

    const result = await Product.search(q, options)
    const total = await Product.countDocuments({
      $text: { $search: q },
      status: 'active'
    })

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new product
 * @route   POST /api/v1/products
 * @access  Private (Vendor/Admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    // Debug: log incoming raw payload and file meta before any parsing
    try {
      const rawBodySnapshot = { ...req.body }
      const fileMeta = (req.files || []).map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
      }))
      console.log('[createProduct] Incoming payload (raw):', { body: rawBodySnapshot, files: fileMeta })
    } catch (e) {
      console.debug('[createProduct] Failed to log incoming payload:', e)
    }
    // Parse JSON string fields from FormData before validation
    if (typeof req.body.deliveryOptions === 'string') {
      try {
        req.body.deliveryOptions = JSON.parse(req.body.deliveryOptions)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid deliveryOptions format'
        })
      }
    }

    // Parse inventory if sent as JSON string in multipart
    if (typeof req.body.inventory === 'string') {
      try {
        req.body.inventory = JSON.parse(req.body.inventory)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid inventory format'
        })
      }
    }

    // Coerce inventory.quantity to number if provided
    if (req.body.inventory && typeof req.body.inventory.quantity !== 'undefined') {
      req.body.inventory.quantity = Number(req.body.inventory.quantity)
      if (Number.isNaN(req.body.inventory.quantity) || req.body.inventory.quantity < 0) {
        return res.status(400).json({ success: false, error: 'Invalid inventory.quantity' })
      }
    }

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const productData = {
      ...req.body,
      vendor: req.user._id
    }

    // Validate delivery options - at least one must be true
    if (productData.deliveryOptions) {
      const { instant, nextDay, standard } = productData.deliveryOptions
      if (!instant && !nextDay && !standard) {
        return res.status(400).json({
          success: false,
          error: 'At least one delivery option must be selected'
        })
      }
    }

    // Handle images: support both uploads and JSON metadata
    if (req.files && req.files.length > 0) {
      const images = []
      
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          folder: 'ecom-multirole/products',
          width: 800,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        })

        images.push({
          public_id: result.public_id,
          url: result.secure_url,
          isPrimary: i === 0
        })
      }

      productData.images = images
    } else if (req.body.imagesMeta || req.body.images) {
      // If client sent existing image metadata as JSON string or array (now using imagesMeta to avoid collisions)
      try {
        const source = typeof req.body.imagesMeta !== 'undefined' ? req.body.imagesMeta : req.body.images
        const parsed = typeof source === 'string' ? JSON.parse(source) : source
        if (Array.isArray(parsed)) {
          productData.images = parsed
        }
      } catch (e) {
        // Ignore if not parsable; images optional on create
        console.debug('[createProduct] imagesMeta parse failed:', e?.message)
      }
    }

    // Parse JSON fields
    if (req.body.specifications) {
      try {
        productData.specifications = JSON.parse(req.body.specifications)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid specifications format'
        })
      }
    }

    if (req.body.tags) {
      try {
        productData.tags = JSON.parse(req.body.tags)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tags format'
        })
      }
    }

    // Debug: log the final data that will be written to DB
    console.log('[createProduct] Creating product with data keys:', Object.keys(productData || {}))
    const product = await Product.create(productData)

    res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private (Owner/Admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    // Log incoming payload from frontend BEFORE any parsing/mutation
    try {
      const rawBodySnapshot = { ...req.body }
      const fileMeta = (req.files || []).map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
      }))
      console.log('[updateProduct] Incoming payload (raw):', {
        id: req.params.id,
        body: rawBodySnapshot,
        files: fileMeta,
      })
    } catch (e) {
      console.debug('[updateProduct] Failed to log incoming payload:', e)
    }

    // Parse JSON string fields from FormData before validation
    if (typeof req.body.deliveryOptions === 'string') {
      try {
        req.body.deliveryOptions = JSON.parse(req.body.deliveryOptions)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid deliveryOptions format'
        })
      }
    }

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    let product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      })
    }

    const updateData = { ...req.body }

    // If images arrived as a JSON string (existing metadata), parse it
    if (typeof updateData.images === 'string') {
      try {
        const parsed = JSON.parse(updateData.images)
        if (Array.isArray(parsed)) {
          updateData.images = parsed
        }
      } catch (e) {
        // keep as-is if not JSON
      }
    }

    // Parse inventory if sent as JSON string in multipart
    if (typeof updateData.inventory === 'string') {
      try {
        updateData.inventory = JSON.parse(updateData.inventory)
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid inventory format' })
      }
    }

    // Coerce inventory.quantity to number if provided
    if (updateData.inventory && typeof updateData.inventory.quantity !== 'undefined') {
      updateData.inventory.quantity = Number(updateData.inventory.quantity)
      if (Number.isNaN(updateData.inventory.quantity) || updateData.inventory.quantity < 0) {
        return res.status(400).json({ success: false, error: 'Invalid inventory.quantity' })
      }
    }

    // Validate delivery options - at least one must be true
    if (updateData.deliveryOptions) {
      const { instant, nextDay, standard } = updateData.deliveryOptions
      if (!instant && !nextDay && !standard) {
        return res.status(400).json({
          success: false,
          error: 'At least one delivery option must be selected'
        })
      }
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const images = []
      
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          folder: 'ecom-multirole/products',
          width: 800,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        })

        images.push({
          public_id: result.public_id,
          url: result.secure_url,
          isPrimary: i === 0
        })
      }

      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          await cloudinary.uploader.destroy(image.public_id)
        }
      }

      // If there were existing image entries alongside new files,
      // merge them; otherwise replace entirely with newly uploaded
      if (Array.isArray(updateData.images) && updateData.images.length > 0) {
        updateData.images = [...images, ...updateData.images]
      } else {
        updateData.images = images
      }
    }

    // Parse JSON fields
    if (req.body.specifications) {
      try {
        updateData.specifications = JSON.parse(req.body.specifications)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid specifications format'
        })
      }
    }

    if (req.body.tags) {
      try {
        updateData.tags = JSON.parse(req.body.tags)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tags format'
        })
      }
    }

    // Debug logs around the DB update
    console.log('[updateProduct] Updating product in DB:', {
      id: req.params.id,
      updateKeys: Object.keys(updateData || {}),
      hasFiles: !!(req.files && req.files.length),
    })
    console.time(`[updateProduct] DB update duration for ${req.params.id}`)

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    console.timeEnd(`[updateProduct] DB update duration for ${req.params.id}`)
    console.log('[updateProduct] DB update complete. Updated product id:', product?._id)
    const responsePayload = {
      success: true,
      data: product
    }
    console.log('[updateProduct] Response 200 JSON:', responsePayload)
    res.status(200).json(responsePayload)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Owner/Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      })
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.public_id)
      }
    }

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
