import asyncHandler from '../middleware/asyncHandler.js'
import SellerDetails from '../models/SellerDetails.js'
import User from '../models/User.js'

// GET /api/v1/sellers/details/me
export const getMySellerDetails = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const details = await SellerDetails.findOne({ user: userId })
  res.json({ success: true, data: details || null })
})

// PUT /api/v1/sellers/details/me
export const upsertMySellerDetails = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const payload = req.body || {}
  try {
    console.log('[SellerDetails] upsert for user:', userId?.toString())
    console.log('[SellerDetails] payload:', JSON.stringify(payload))

  // Normalize payload
  const normalizedLocation = payload.location && Array.isArray(payload.location.coordinates)
    && payload.location.coordinates.length === 2
      ? payload.location
      : undefined

  const update = {
    sellerName: payload.sellerName || req.user?.name || '',
    phone: payload.phone,
    address: payload.address || {},
    location: normalizedLocation,
    pincode: payload.pincode || payload.address?.pincode,
    gstNumber: payload.gstNumber
  }

  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k])

  const updateDoc = { $set: update, $setOnInsert: { user: userId } }

  const details = await SellerDetails.findOneAndUpdate(
    { user: userId },
    updateDoc,
    { new: true, upsert: true, runValidators: true }
  )

  res.json({ success: true, data: details })
  } catch (err) {
    console.error('[SellerDetails] upsert error:', err?.message, err)
    return res.status(500).json({ success: false, error: 'Failed to save seller details' })
  }
})

// GET /api/v1/sellers/details/nearby
export const getNearbySellers = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5 } = req.query

  // Validate required parameters
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    })
  }

  // Validate coordinate values
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  const searchRadius = parseFloat(radius)

  if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates or radius values'
    })
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinate range. Latitude must be between -90 and 90, longitude between -180 and 180'
    })
  }

  try {
    // Use MongoDB aggregation pipeline with $geoNear to find nearby sellers
    const nearbySellers = await SellerDetails.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude] // MongoDB expects [lng, lat]
          },
          distanceField: 'distance',
          maxDistance: searchRadius * 1000, // Convert km to meters
          spherical: true,
          query: {
            location: { $exists: true, $ne: null } // Only include sellers with location data
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $match: {
          'userDetails.role': 'seller', // Ensure user has seller role
          'userDetails.isSuspended': { $ne: true } // Exclude suspended users
        }
      },
      {
        $project: {
          _id: 1,
          sellerName: 1,
          phone: 1,
          address: 1,
          location: 1,
          pincode: 1,
          gstNumber: 1,
          distance: 1,
          userDetails: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
            createdAt: 1
          }
        }
      },
      {
        $sort: { distance: 1 } // Sort by distance (nearest first)
      },
      {
        $limit: 50 // Limit results to prevent overwhelming response
      }
    ])

    // Log the raw aggregation result
    console.log('🔍 Raw aggregation result:', JSON.stringify(nearbySellers, null, 2))
    console.log('📊 Number of sellers found:', nearbySellers.length)

    // Format the response
    const formattedSellers = nearbySellers.map(seller => {
      const formatted = {
        id: seller._id,
        sellerName: seller.sellerName,
        phone: seller.phone,
        address: seller.address,
        location: seller.location,
        pincode: seller.pincode,
        gstNumber: seller.gstNumber,
        distance: Math.round(seller.distance / 1000 * 100) / 100, // Convert to km with 2 decimal places
        user: {
          id: seller.userDetails._id,
          name: seller.userDetails.name,
          email: seller.userDetails.email,
          avatar: seller.userDetails.avatar,
          joinedAt: seller.userDetails.createdAt
        }
      }
      
      // Log each formatted seller
      console.log('🏪 Formatted seller:', JSON.stringify(formatted, null, 2))
      
      return formatted
    })

    const response = {
      success: true,
      count: formattedSellers.length,
      data: formattedSellers,
      searchParams: {
        latitude,
        longitude,
        radius: searchRadius
      }
    }

    // Log the final response
    console.log('📤 Final API response:', JSON.stringify(response, null, 2))
    console.log('📈 Response summary:', {
      success: response.success,
      count: response.count,
      searchParams: response.searchParams
    })

    res.json(response)

  } catch (error) {
    console.error('[SellerDetails] getNearbySellers error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby sellers'
    })
  }
})


