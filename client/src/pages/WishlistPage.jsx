/**
 * Wishlist Page Component
 * Displays user's wishlist products
 */

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Eye,
  Star,
  MapPin,
  Store,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { getWishlist, removeFromWishlist, clearWishlist } from '../features/wishlist/wishlistSlice'
import { addToCartSmart as addToCart } from '../features/cart/cartSlice'
import { toast } from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const WishlistPage = () => {
  const dispatch = useDispatch()
  const { products, loading, error, wishlistCount } = useSelector(state => state.wishlist)
  const { user } = useSelector(state => state.auth)
  const [removingProduct, setRemovingProduct] = useState(null)

  useEffect(() => {
    if (user) {
      dispatch(getWishlist())
    }
  }, [dispatch, user])

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingProduct(productId)
    try {
      await dispatch(removeFromWishlist(productId)).unwrap()
      toast.success('Product removed from wishlist')
    } catch (error) {
      toast.error(error || 'Failed to remove product from wishlist')
    } finally {
      setRemovingProduct(null)
    }
  }

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await dispatch(clearWishlist()).unwrap()
        toast.success('Wishlist cleared')
      } catch (error) {
        toast.error(error || 'Failed to clear wishlist')
      }
    }
  }

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ product, quantity: 1 }))
      toast.success('Product added to cart')
    } catch (error) {
      toast.error(error || 'Failed to add product to cart')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to view your wishlist.</p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => dispatch(getWishlist())}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {/* Actions */}
        {products.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {products.length} products saved
              </span>
            </div>
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Wishlist
            </button>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Store className="w-12 h-12" />
                    </div>
                  )}
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    disabled={removingProduct === product._id}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {removingProduct === product._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  {product.averageRating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(product.averageRating)}
                      <span className="text-sm text-gray-500 ml-1">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Seller Info */}
                  {product.seller && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                      <Store className="w-4 h-4" />
                      <span className="truncate">{product.seller.name}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <Link
                      to={`/products/${product._id}`}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Start adding products you love to your wishlist.
            </p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default WishlistPage
