/**
 * Cart Page Component - Modern Shopping Cart Design with Tailwind CSS
 */

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrashIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  XMarkIcon,
  StarIcon,
  TagIcon,
  GiftIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  addToCartSmart as addToCart, 
  removeFromCartSmart as removeFromCart, 
  updateQuantitySmart as updateQuantity, 
  clearCartSmart as clearCart,
  selectCartItemsWithStockStatus,
  selectCartError,
  clearError,
  refreshCartProducts
} from '../features/cart/cartSlice'
import toast from 'react-hot-toast'

const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart.items)
  const cartItemsWithStock = useSelector(selectCartItemsWithStockStatus)
  const cartError = useSelector(selectCartError)
  const totalAmount = useSelector((state) => 
    state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  )
  const totalQuantity = useSelector((state) => 
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  )
  const [isRemoving, setIsRemoving] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [showPromoInput, setShowPromoInput] = useState(false)

  // Clear error when component mounts or when user interacts
  React.useEffect(() => {
    if (cartError) {
      toast.error(cartError)
      dispatch(clearError())
    }
  }, [cartError, dispatch])

  // Refresh cart products with fresh data from backend when cart page loads
  React.useEffect(() => {
    if (cartItems.length > 0) {
      console.log('🔄 Cart Page - Refreshing product data from backend...')
      dispatch(refreshCartProducts())
    }
  }, [dispatch, cartItems.length])

  // Console log the payload received from backend for stock validation
  React.useEffect(() => {
    console.log('📦 Cart Page - Product Payload from Backend:', cartItemsWithStock)
  }, [cartItemsWithStock])

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
      return
    }
    dispatch(updateQuantity({ productId: itemId, quantity: newQuantity }))
  }

  const handleRemoveItem = async (itemId) => {
    setIsRemoving(itemId)
    setTimeout(() => {
      dispatch(removeFromCart(itemId))
      setIsRemoving(null)
      toast.success('Item removed from cart')
    }, 300)
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    toast.success('Cart cleared')
  }

  const handleCheckout = () => {
    // Check if there are any out-of-stock items
    const hasOutOfStockItems = cartItemsWithStock.some(item => item.stockStatus?.isOutOfStock)
    
    if (hasOutOfStockItems) {
      toast.error('Please remove out-of-stock items before proceeding to checkout')
      return
    }
    
    navigate('/checkout')
  }

  const handleApplyPromo = () => {
    const validPromos = {
      'SAVE10': { discount: 0.1, type: 'percentage', description: '10% off' },
      'SAVE20': { discount: 0.2, type: 'percentage', description: '20% off' },
      'WELCOME': { discount: 100, type: 'fixed', description: '₹100 off' },
      'FREESHIP': { discount: 50, type: 'shipping', description: 'Free shipping' }
    }

    if (validPromos[promoCode.toUpperCase()]) {
      setAppliedPromo(validPromos[promoCode.toUpperCase()])
      toast.success('Promo code applied successfully!')
      setPromoCode('')
    } else {
      toast.error('Invalid promo code')
    }
  }

  const calculateDiscount = () => {
    if (!appliedPromo) return 0
    
    if (appliedPromo.type === 'percentage') {
      return totalAmount * appliedPromo.discount
    } else if (appliedPromo.type === 'fixed') {
      return appliedPromo.discount
    }
    return 0
  }

  const calculateShipping = () => {
    if (appliedPromo?.type === 'shipping') return 0
    return totalAmount >= 500 ? 0 : 50
  }

  const calculateTotal = () => {
    const discount = calculateDiscount()
    const shipping = calculateShipping()
    const tax = (totalAmount - discount) * 0.18
    return Math.round(totalAmount - discount + shipping + tax)
  }

  const CartItem = ({ item, stockStatus }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 ${
        isRemoving === item.product._id 
          ? 'opacity-50 scale-95' 
          : stockStatus?.isOutOfStock
          ? 'border-red-200 bg-red-50'
          : stockStatus?.isLowStock
          ? 'border-orange-200 bg-orange-50'
          : 'border-gray-200 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
            alt={item.product?.name || 'Product'}
            className="w-20 h-20 object-cover rounded-xl"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.product?.name || 'Product Name'}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {item.product?.category || 'Category'}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-2xl font-bold text-blue-600">
              ₹{item.product?.price?.toLocaleString() || '0'}
            </span>
            {item.product?.comparePrice && item.product?.comparePrice > item.product?.price && (
              <span className="text-lg text-gray-400 line-through">
                ₹{item.product?.comparePrice?.toLocaleString()}
              </span>
            )}
          </div>
          {/* Explicit inventory from backend payload */}
          {item.product?.inventory && (
            <div className="mt-1 text-xs text-gray-600">
              In stock: {item.product.inventory.quantity} {item.product.inventory.trackQuantity === false ? '(unlimited)' : ''}
            </div>
          )}
          
          {/* Inventory Warning */}
          {stockStatus?.isOutOfStock && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ This item is currently out of stock and will be removed from your cart
              </p>
            </div>
          )}
          {stockStatus?.isLowStock && !stockStatus?.isOutOfStock && (
            <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">
                ⚠️ Only {stockStatus.availableStock} units available - order soon!
              </p>
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-xl">
            <button
              onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={`p-2 rounded-l-xl transition-colors ${
                item.quantity <= 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
              disabled={!stockStatus?.canAddMore}
              title={stockStatus?.canAddMore ? 'Increase quantity' : `Max ${stockStatus?.maxQuantity ?? item.product?.inventory?.quantity ?? 0} allowed`}
              className={`p-2 rounded-r-xl transition-colors ${
                !stockStatus?.canAddMore
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          
          {/* Stock Status Indicator */}
          {stockStatus?.trackQuantity && (
            <div className="flex flex-col items-end">
              {stockStatus.isOutOfStock ? (
                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
              ) : stockStatus.isLowStock ? (
                <span className="text-xs text-orange-600 font-medium">
                  Only {stockStatus.availableStock} left
                </span>
              ) : (
                <span className="text-xs text-green-600 font-medium">
                  {stockStatus.availableStock} in stock
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Save for later"
            >
              <HeartIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleRemoveItem(item.product._id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove from cart"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const EmptyCart = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
      </p>
      <Link
        to="/products"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
      >
        <ShoppingBagIcon className="h-5 w-5 mr-2" />
        Start Shopping
      </Link>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <p className="text-gray-600">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              <AnimatePresence>
                {cartItemsWithStock.map((item) => (
                  <CartItem key={item.product._id} item={item} stockStatus={item.stockStatus} />
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
                
                {/* Promo Code Section */}
                <div className="mb-6">
                  {!appliedPromo ? (
                    <div>
                      {!showPromoInput ? (
                        <button
                          onClick={() => setShowPromoInput(true)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          <TagIcon className="h-4 w-4" />
                          <span>Have a promo code?</span>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              placeholder="Enter promo code"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={handleApplyPromo}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                          <button
                            onClick={() => setShowPromoInput(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <GiftIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {appliedPromo.description} applied
                        </span>
                      </div>
                      <button
                        onClick={() => setAppliedPromo(null)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                    <span className="font-medium">₹{totalAmount?.toLocaleString() || '0'}</span>
                  </div>
                  
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">-₹{calculateDiscount().toFixed(0)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">
                      {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping()}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">₹{Math.round(((totalAmount || 0) - calculateDiscount()) * 0.18)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: cartItemsWithStock.some(item => item.stockStatus?.isOutOfStock) ? 1 : 1.02 }}
                  whileTap={{ scale: cartItemsWithStock.some(item => item.stockStatus?.isOutOfStock) ? 1 : 0.98 }}
                  onClick={handleCheckout}
                  disabled={cartItemsWithStock.some(item => item.stockStatus?.isOutOfStock)}
                  className={`w-full font-semibold py-4 rounded-xl transition-all duration-200 mb-4 ${
                    cartItemsWithStock.some(item => item.stockStatus?.isOutOfStock)
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  {cartItemsWithStock.some(item => item.stockStatus?.isOutOfStock)
                    ? 'Remove Out-of-Stock Items First'
                    : 'Proceed to Checkout'
                  }
                </motion.button>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium py-3 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Continue Shopping
                </Link>

                {/* Available Promo Codes */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Available Promo Codes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">SAVE10</span>
                      <span className="text-green-600 font-medium">10% off</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">SAVE20</span>
                      <span className="text-green-600 font-medium">20% off</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">WELCOME</span>
                      <span className="text-green-600 font-medium">₹100 off</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">FREESHIP</span>
                      <span className="text-green-600 font-medium">Free shipping</span>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <TruckIcon className="h-5 w-5 text-blue-500" />
                    <span>Free delivery on orders over ₹500</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CreditCardIcon className="h-5 w-5 text-purple-500" />
                    <span>Multiple payment options</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <ClockIcon className="h-5 w-5 text-orange-500" />
                    <span>Estimated delivery: 2-3 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Products */}
        {cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Product {item}</h3>
                    <p className="text-sm text-gray-600 mb-3">Category</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">₹999</span>
                      <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CartPage