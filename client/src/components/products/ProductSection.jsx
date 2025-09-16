/**
 * Product Section Component - Modern Product Display with Tailwind CSS
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useDispatch, useSelector } from 'react-redux'
import { addToCartSmart as addToCart } from '../../features/cart/cartSlice'
import WishlistButton from '../ui/WishlistButton'
import toast from 'react-hot-toast'

const ProductSection = ({ 
  title, 
  products = [], 
  showViewAll = true, 
  viewAllLink = '/products',
  className = '' 
}) => {
  const dispatch = useDispatch()
  const { cartItems } = useSelector((state) => state.cart)

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product, // Pass the complete product object from backend
      quantity: 1
    }))
    // Toast will be handled by the cart slice based on inventory validation
  }

  const isInCart = (productId) => {
    return cartItems.some(item => item.product._id === productId)
  }

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleAddToCart(product)}
            >
              <ShoppingCartIcon className="h-5 w-5 text-gray-700" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-5 w-5 text-gray-700" />
            </motion.button>
            
            <WishlistButton 
              productId={product._id} 
              size="md"
              className="shadow-lg"
            />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              New
            </span>
          )}
          {product.discount && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              -{product.discount}%
            </span>
          )}
          {/* Stock Status Badge */}
          {product.inventory?.trackQuantity !== false && (
            <>
              {product.inventory?.quantity <= 0 ? (
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                  Out of Stock
                </span>
              ) : product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 10) ? (
                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                  Only {product.inventory.quantity} left
                </span>
              ) : null}
            </>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-4 right-4">
          <WishlistButton 
            productId={product._id} 
            size="sm"
            className="bg-white/80 hover:bg-white"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Seller Information */}
        {product.seller && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {product.seller.sellerDetails?.sellerName || product.seller.name}
                </p>
                <p className="text-xs text-gray-600">
                  {product.seller.sellerDetails?.address?.city && product.seller.sellerDetails?.address?.state 
                    ? `${product.seller.sellerDetails.address.city}, ${product.seller.sellerDetails.address.state}`
                    : 'Professional Seller'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">
                    {product.seller.sellerDetails?.phone ? 'Verified' : 'Seller'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {product.seller.sellerDetails?.gstNumber ? 'GST Registered' : 'Individual Seller'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAddToCart(product)}
          disabled={
            isInCart(product._id) || 
            (product.inventory?.trackQuantity !== false && product.inventory?.quantity <= 0)
          }
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
            isInCart(product._id) || 
            (product.inventory?.trackQuantity !== false && product.inventory?.quantity <= 0)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          {isInCart(product._id) 
            ? 'In Cart' 
            : (product.inventory?.trackQuantity !== false && product.inventory?.quantity <= 0)
            ? 'Out of Stock'
            : 'Add to Cart'
          }
        </motion.button>
      </div>
    </motion.div>
  )

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </motion.div>
          
          {showViewAll && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to={viewAllLink}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold group"
              >
                <span>View All</span>
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </motion.div>

        {/* Empty State */}
        {products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Check back later for new products!</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default ProductSection