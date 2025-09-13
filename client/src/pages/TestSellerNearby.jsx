import React, { useState, useEffect } from 'react'
import { MapPin, Phone, Store, User, Clock, AlertCircle, Loader2 } from 'lucide-react'

const TestSellerNearby = () => {
  const [location, setLocation] = useState(null)
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [searchRadius, setSearchRadius] = useState(5)

  // API base URL
  const API_BASE_URL = 'http://localhost:3001/api/v1/seller-details/nearby'

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setLoading(true)
    setError(null)
    setPermissionDenied(false)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setLocation(coords)
        fetchNearbySellers(coords.latitude, coords.longitude)
      },
      (error) => {
        setLoading(false)
        let errorMessage = 'Error getting location: '
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access to find nearby sellers.'
            setPermissionDenied(true)
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = 'Unknown error occurred while getting location.'
            break
        }
        setError(errorMessage)
      },
      options
    )
  }

  // Fetch nearby sellers from API
  const fetchNearbySellers = async (lat, lng, radius = searchRadius) => {
    try {
      setLoading(true)
      setError(null)

      const url = `${API_BASE_URL}?lat=${lat}&lng=${lng}&radius=${radius}`
      console.log('Fetching nearby sellers:', url)

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setSellers(data.data || [])
        console.log('Nearby sellers:', data)
      } else {
        setError(data.error || 'Failed to fetch nearby sellers')
        setSellers([])
      }
    } catch (err) {
      console.error('Error fetching nearby sellers:', err)
      setError('Network error. Please check if the server is running.')
      setSellers([])
    } finally {
      setLoading(false)
    }
  }

  // Handle radius change
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius)
    if (location) {
      fetchNearbySellers(location.latitude, location.longitude, newRadius)
    }
  }

  // Test with sample coordinates (Delhi)
  const testWithSampleLocation = () => {
    const sampleCoords = {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 0
    }
    setLocation(sampleCoords)
    fetchNearbySellers(sampleCoords.latitude, sampleCoords.longitude)
  }

  // Format distance
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(2)}km`
  }

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'Address not available'
    
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.pincode) parts.push(address.pincode)
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🏪 Find Nearby Sellers
          </h1>
          <p className="text-lg text-gray-600">
            Discover local sellers within your area using your current location
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
                {loading ? 'Getting Location...' : '📍 Get My Location'}
              </button>

              <button
                onClick={testWithSampleLocation}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <MapPin className="w-5 h-5" />
                🧪 Test with Delhi
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="radius" className="text-sm font-medium text-gray-700">
                Search Radius:
              </label>
              <select
                id="radius"
                value={searchRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                disabled={loading}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
            {permissionDenied && (
              <div className="mt-3 text-sm text-red-700">
                <p>To enable location access:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Click the location icon in your browser's address bar</li>
                  <li>Select "Allow" for location access</li>
                  <li>Refresh the page and try again</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Current Location Info */}
        {location && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Current Location</h3>
            </div>
            <div className="text-sm text-blue-800">
              <p>Latitude: {location.latitude.toFixed(6)}</p>
              <p>Longitude: {location.longitude.toFixed(6)}</p>
              {location.accuracy && (
                <p>Accuracy: ±{Math.round(location.accuracy)}m</p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Searching for nearby sellers...</p>
          </div>
        )}

        {/* Results */}
        {!loading && sellers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Found {sellers.length} seller{sellers.length !== 1 ? 's' : ''} within {searchRadius}km
            </h2>
          </div>
        )}

        {/* Sellers List */}
        {!loading && sellers.length === 0 && location && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-600">
              No sellers found within {searchRadius}km of your location. Try increasing the search radius.
            </p>
          </div>
        )}

        {/* Seller Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller, index) => (
            <div key={seller.id || index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              {/* Seller Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {seller.sellerName || 'Unknown Seller'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {seller.user?.name || 'Seller'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                    <MapPin className="w-4 h-4" />
                    {formatDistance(seller.distance)}
                  </div>
                </div>
              </div>

              {/* Seller Details */}
              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-sm text-gray-900">
                      {formatAddress(seller.address)}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {seller.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm text-gray-900">{seller.phone}</p>
                    </div>
                  </div>
                )}

                {/* GST Number */}
                {seller.gstNumber && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">GST Number</p>
                      <p className="text-sm text-gray-900 font-mono">{seller.gstNumber}</p>
                    </div>
                  </div>
                )}

                {/* Pincode */}
                {seller.pincode && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Pincode</p>
                      <p className="text-sm text-gray-900">{seller.pincode}</p>
                    </div>
                  </div>
                )}

                {/* Coordinates */}
                {seller.location?.coordinates && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                    <p className="text-xs text-gray-700 font-mono">
                      {seller.location.coordinates[1].toFixed(6)}, {seller.location.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        {!location && !loading && !error && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-600 mb-6">
              Click "Get My Location" to find sellers near you, or use "Test with Delhi" to try with sample coordinates.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestSellerNearby
