/**
 * Dynamic Homepage Sections Component
 * Renders dynamic sections from the backend
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../features/cart/cartSlice'
import toast from 'react-hot-toast'

const DynamicSections = ({ sections = [] }) => {
  const dispatch = useDispatch()
  const { items: cartItems = [] } = useSelector((state) => state.cart)


  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product, // Pass the complete product object from backend
      quantity: 1
    }))
    // Toast will be handled by the cart slice based on inventory validation
  }

  const isInCart = (productId) => {
    return cartItems?.some(item => item.product._id === productId) || false
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
          src={product.images?.[0]?.url || '/placeholder-product.jpg'}
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
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
            >
              <HeartIcon className="h-5 w-5 text-gray-700" />
            </motion.button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.featured && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <HeartIcon className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
        
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.ratings?.average || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            ({product.ratings?.count || 0})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAddToCart(product)}
          disabled={isInCart(product._id)}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
            isInCart(product._id)
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          {isInCart(product._id) ? 'In Cart' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  )

  const BannerSection = ({ section }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 text-white"
    >
      {section.bannerImage && (
        <img
          src={section.bannerImage.url}
          alt={section.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      <div className="relative z-10 p-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{section.title}</h2>
        {section.description && (
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">{section.description}</p>
        )}
        {section.bannerText && (
          <p className="text-lg mb-8 opacity-80">{section.bannerText}</p>
        )}
        {section.bannerLink && (
          <motion.a
            href={section.bannerLink}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Learn More
          </motion.a>
        )}
      </div>
    </motion.div>
  )

  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <div className="space-y-16">
      {sections.map((section, sectionIndex) => (
          <motion.section
          key={section._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: sectionIndex * 0.1 }}
          className={`py-16 ${sectionIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{section.title}</h2>
                {section.description && (
                  <p className="text-lg text-gray-600 max-w-2xl">{section.description}</p>
                )}
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-4"></div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products${section.category ? `?category=${section.category}` : ''}`}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold group"
                >
                  <span>View All</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Section Content */}
            {section.type === 'banner' ? (
              <BannerSection section={section} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {section.products?.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {section.products?.length === 0 && section.type !== 'banner' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products in this section</h3>
                <p className="text-gray-600">Products will appear here when added by admin.</p>
              </motion.div>
            )}
          </div>
        </motion.section>
      ))}
    </div>
  )
}

export default DynamicSections
