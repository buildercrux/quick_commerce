/**
 * HomePage Component - Modern E-commerce Homepage with Tailwind CSS
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProductSection from '../components/products/ProductSection'
import { fetchFeaturedProducts, fetchProducts } from '../features/products/productSlice'
import { fetchHomepageSections } from '../features/homepageSections/homepageSectionSlice'
import { fetchBanners } from '../features/banners/bannerSlice'
import DynamicSections from '../components/homepage/DynamicSections'
import BannerCarousel from '../components/layout/BannerCarousel'
import DeliveryOptions from '../components/layout/DeliveryOptions'
import FilteredProductsDisplay from '../components/homepage/FilteredProductsDisplay'

const HomePage = () => {
  const dispatch = useDispatch()
  const { 
    featuredProducts, 
    products: filteredProducts,
    isLoading: productsLoading, 
    currentDeliveryMode 
  } = useSelector((state) => state.products)
  const { sections: homepageSections, isLoading: sectionsLoading } = useSelector((state) => state.homepageSections)
  const { banners, isLoading: bannersLoading } = useSelector((state) => state.banners)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchBanners())
    
    // Fetch homepage sections with delivery filter
    dispatch(fetchHomepageSections({ delivery: currentDeliveryMode }))
    
    // Fetch filtered products for instant and next-day delivery
    if (currentDeliveryMode === 'instant' || currentDeliveryMode === 'nextDay') {
      dispatch(fetchProducts({ 
        delivery: currentDeliveryMode, 
        limit: 20 
      }))
    }
  }, [dispatch, currentDeliveryMode])


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const features = [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹999',
      color: 'blue'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: '100% secure payment processing',
      color: 'green'
    },
    {
      icon: HeartIcon,
      title: '24/7 Support',
      description: 'Round-the-clock customer support',
      color: 'red'
    },
    {
      icon: StarIcon,
      title: 'Quality Guarantee',
      description: '30-day money-back guarantee',
      color: 'yellow'
    }
  ]

  const deliveryOptions = [
    {
      icon: TruckIcon,
      title: 'Standard Delivery',
      time: '3-5 business days',
      price: 'Free',
      description: 'Perfect for regular orders'
    },
    {
      icon: SparklesIcon,
      title: 'Express Delivery',
      time: '1-2 business days',
      price: '₹99',
      description: 'Get your items faster'
    },
    {
      icon: CheckCircleIcon,
      title: 'Same Day Delivery',
      time: 'Same day',
      price: '₹199',
      description: 'Available in select cities'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Delivery Options Section */}
        <section className="py-6 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants}>
              <DeliveryOptions />
                </motion.div>
          </div>
        </section>

        {/* Banner Carousel Section */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants}>
              <BannerCarousel banners={banners} autoPlay={true} interval={5000} />
                    </motion.div>
          </div>
        </section>


        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Us?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We provide exceptional service and quality products to make your shopping experience unforgettable.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                  <motion.div
                  key={feature.title}
                    variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="text-center group"
                >
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-${feature.color}-200 transition-colors`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Options */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Fast & Reliable Delivery
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the delivery option that works best for you
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {deliveryOptions.map((option, index) => (
                <motion.div
                  key={option.title}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <option.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{option.price}</p>
                  <p className="text-gray-600 mb-4">{option.time}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Banner Carousel */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Special Offer - 50% Off
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Limited time offer on selected items. Don't miss out!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Shop Now
                </motion.button>
              </div>
              </motion.div>
          </div>
        </section>

        {/* Conditional Content Based on Delivery Mode */}
        {currentDeliveryMode === 'standard' ? (
          <>
            {/* Dynamic Homepage Sections - Normal View */}
            <DynamicSections sections={homepageSections} />
                  
            {/* Featured Products - Fallback if no sections */}
            {(!homepageSections || homepageSections.length === 0) && (
              <ProductSection
                title="Featured Products"
                products={featuredProducts}
                showViewAll={true}
                viewAllLink="/products"
                className="bg-white"
              />
            )}
          </>
        ) : (
          /* Filtered Products View for Instant/Next Day Delivery */
          <FilteredProductsDisplay 
            products={filteredProducts}
            deliveryMode={currentDeliveryMode}
            isLoading={productsLoading}
          />
        )}

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Stay Updated
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Subscribe to our newsletter and get 10% off your first order
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Subscribe
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.div>

      <Footer />
    </div>
  )
}

export default HomePage