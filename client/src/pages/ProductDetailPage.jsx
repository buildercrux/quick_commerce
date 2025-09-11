/**
 * Product Detail Page Component
 * Individual product view with reviews and add to cart
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  RotateCcw,
  Minus,
  Plus,
  Share2
} from 'lucide-react'
import { fetchProduct, clearCurrentProduct } from '../features/products/productSlice'
import { addToCart } from '../features/cart/cartSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ProductDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  
  const { currentProduct, isLoading } = useSelector((state) => state.products)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id))
    }
    
    return () => {
      dispatch(clearCurrentProduct())
    }
  }, [dispatch, id])

  const handleAddToCart = () => {
    if (currentProduct) {
      dispatch(addToCart({ product: currentProduct, quantity }))
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    const availableStock = currentProduct?.inventory?.quantity || 0
    const trackQuantity = currentProduct?.inventory?.trackQuantity !== false
    
    if (newQuantity >= 1) {
      if (trackQuantity && newQuantity > availableStock) {
        // Don't allow quantity to exceed available stock
        return
      }
      setQuantity(newQuantity)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={currentProduct.images[selectedImage]?.url || '/placeholder-product.jpg'}
                alt={currentProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${currentProduct.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentProduct.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(currentProduct.ratings.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {currentProduct.ratings.average} ({currentProduct.ratings.count} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Sold by {currentProduct.owner?.vendorProfile?.businessName || currentProduct.owner?.name}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary-600">
                ${currentProduct.price}
              </span>
              {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${currentProduct.originalPrice}
                  </span>
                  <span className="bg-error-100 text-error-800 px-2 py-1 rounded-full text-sm font-semibold">
                    Save ${currentProduct.originalPrice - currentProduct.price}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {currentProduct.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <span className="text-success-600 font-medium">
                    In Stock ({currentProduct.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                  <span className="text-error-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (currentProduct.inventory?.quantity || 0)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {/* Stock Status */}
                {currentProduct.inventory?.trackQuantity !== false && (
                  <div className="text-sm text-gray-600">
                    {currentProduct.inventory?.quantity <= 0 ? (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    ) : currentProduct.inventory?.quantity <= (currentProduct.inventory?.lowStockThreshold || 10) ? (
                      <span className="text-orange-600 font-medium">
                        Only {currentProduct.inventory.quantity} left
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        {currentProduct.inventory.quantity} in stock
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    !isAuthenticated || 
                    (currentProduct.inventory?.trackQuantity !== false && currentProduct.inventory?.quantity <= 0)
                  }
                  className={`btn-lg flex-1 flex items-center justify-center ${
                    !isAuthenticated || 
                    (currentProduct.inventory?.trackQuantity !== false && currentProduct.inventory?.quantity <= 0)
                      ? 'btn-disabled'
                      : 'btn-primary'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {!isAuthenticated 
                    ? 'Login to Add to Cart'
                    : (currentProduct.inventory?.trackQuantity !== false && currentProduct.inventory?.quantity <= 0)
                    ? 'Out of Stock'
                    : 'Add to Cart'
                  }
                </button>
                <button className="btn-outline btn-lg p-3">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="btn-outline btn-lg p-3">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Free Shipping</div>
                  <div className="text-sm text-gray-600">On orders over $50</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Secure Payment</div>
                  <div className="text-sm text-gray-600">100% protected</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-6 w-6 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Easy Returns</div>
                  <div className="text-sm text-gray-600">30-day policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {currentProduct.description}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentProduct.specifications?.map((spec, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">{spec.name}</span>
                    <span className="text-gray-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customer Reviews
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {currentProduct.ratings.average}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(currentProduct.ratings.average)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {currentProduct.ratings.count} reviews
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Sample review - in real app, fetch from API */}
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">JD</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">John Doe</div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Great product! Exactly as described and fast shipping. 
                      Would definitely recommend to others.
                    </p>
                    <div className="text-sm text-gray-500 mt-2">
                      Verified Purchase • 2 days ago
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage






