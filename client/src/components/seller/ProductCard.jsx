import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Share2, Plus } from 'lucide-react'
import WishlistButton from '../ui/WishlistButton'

const ProductCard = ({ product, onShare }) => {
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleProductClick = () => {
    navigate(`/products/${product.id}`)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out this product: ${product.title}`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        // You might want to show a toast notification here
        console.log('Link copied to clipboard')
      }
      
      if (onShare) {
        await onShare(product.id)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const images = product.images || []
  const sideThumbnails = images.slice(1, 5) // Show up to 4 side thumbnails
  const remainingCount = Math.max(0, images.length - 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={handleProductClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Header: Seller Info */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
          {product.seller?.avatarUrl ? (
            <img
              src={product.seller.avatarUrl}
              alt={product.seller.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {product.seller?.name?.charAt(0) || 'S'}
              </span>
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">
          By {product.seller?.name || 'Seller'}
        </span>
      </div>

      {/* Main Image and Side Thumbnails */}
      <div className="relative">
        {/* Main Image */}
        <div className="w-full h-64 bg-gray-100 relative">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]?.url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No Image</span>
            </div>
          )}

          {/* Side Thumbnails - Desktop Only */}
          <div className="hidden md:block absolute right-2 top-2 space-y-1">
            {sideThumbnails.map((image, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentImageIndex(index + 1)}
                className={`w-8 h-8 rounded overflow-hidden border-2 ${
                  currentImageIndex === index + 1 ? 'border-blue-500' : 'border-white'
                }`}
              >
                <img
                  src={image.url}
                  alt={`${product.title} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
            
            {/* +N Overlay */}
            {remainingCount > 0 && (
              <div className="w-8 h-8 rounded bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold">+{remainingCount}</span>
              </div>
            )}
          </div>

          {/* +N Overlay for Mobile - Bottom Right */}
          {remainingCount > 0 && (
            <div className="md:hidden absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div onClick={(e) => e.stopPropagation()}>
            <WishlistButton 
              productId={product.id} 
              size="sm"
              className="shadow-lg"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
            className="p-2 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Share product"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Footer: Product Info */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
