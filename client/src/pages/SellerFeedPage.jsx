import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Loader2, AlertCircle } from 'lucide-react'

// Components
import Header from '../components/seller/Header'
import StoryScroller from '../components/seller/StoryScroller'
import BannerCarousel from '../components/seller/BannerCarousel'
import ProductCard from '../components/seller/ProductCard'
import MasonryGrid from '../components/seller/MasonryGrid'
import Footer from '../components/layout/Footer'

const SellerFeedPage = () => {
  const { sellerId } = useParams()
  const navigate = useNavigate()
  
  const [feedData, setFeedData] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeStoryId, setActiveStoryId] = useState('my-feed')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Mock data for banners and stories (these would come from database in real app)
  const mockBannersAndStories = {
    banners: [
      { id: 1, imgUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop', alt: 'Fashion Banner' },
      { id: 2, imgUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop', alt: 'Lifestyle Banner' }
    ],
    stories: [
      { id: 'my-feed', label: 'MY FEED', category: null, imgUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop' },
      { id: 'women', label: 'WOMEN', category: 'women', imgUrl: 'https://images.unsplash.com/photo-1594633312681-425a7b9569e2?w=150&h=150&fit=crop' },
      { id: 'men', label: 'MEN', category: 'men', imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
      { id: 'girls', label: 'GIRLS', category: 'girls', imgUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=150&fit=crop' },
      { id: 'boys', label: 'BOYS', category: 'boys', imgUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop' },
      { id: 'kids', label: 'KIDS', category: 'kids', imgUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&h=150&fit=crop' },
      { id: 'beauty', label: 'BEAUTY', category: 'beauty', imgUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop' }
    ]
  }

  // Fetch feed data
  const fetchFeedData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch products from the existing API
      const response = await fetch(`http://localhost:3001/api/v1/products/seller/${sellerId}?limit=50`)
      const data = await response.json()

      if (response.ok) {
        console.log('📊 API Response:', data)
        console.log('📦 Products count:', data.data?.length || 0)
        console.log('🏪 Seller info:', data.seller)
        
        // Transform products from API response
        const transformedProducts = data.data.map(product => ({
          id: product._id,
          seller: {
            id: data.seller.id,
            name: data.seller.sellerName || data.seller.name,
            avatarUrl: data.seller.avatar || null
          },
          title: product.name,
          images: product.images || [],
          price: product.price,
          category: product.category,
          likeCount: product.sales?.count || 0, // Use sales count as like count
          liked: false // Default to false since we don't have this data
        }))

        // Store all products for filtering
        setAllProducts(transformedProducts)
        setFilteredProducts(transformedProducts) // Initially show all products

        // Transform the API response to match our UI structure
        const transformedData = {
          banners: mockBannersAndStories.banners,
          stories: mockBannersAndStories.stories.map((story, index) => ({
            ...story,
            // Use seller's info for the first story (MY FEED)
            label: index === 0 ? (data.seller?.sellerName || data.seller?.name || 'MY FEED') : story.label,
            imgUrl: index === 0 && data.seller?.avatar ? data.seller.avatar : story.imgUrl
          })),
          products: transformedProducts // This will be replaced by filteredProducts in render
        }
        
        setFeedData(transformedData)
      } else {
        setError(data.error || 'Failed to load seller products')
      }
    } catch (err) {
      console.error('Error fetching feed data:', err)
      setError('Failed to load feed data')
    } finally {
      setLoading(false)
    }
  }

  // Handle story selection
  const handleStorySelect = (storyId) => {
    setActiveStoryId(storyId)
    
    // Find the selected story to get its category
    const selectedStory = mockBannersAndStories.stories.find(story => story.id === storyId)
    const category = selectedStory?.category
    
    console.log('Selected story:', storyId, 'Category:', category)
    
    // Filter products based on category
    if (category === null || category === undefined) {
      // Show all products for "MY FEED"
      setFilteredProducts(allProducts)
    } else {
      // Filter products by category
      const filtered = allProducts.filter(product => product.category === category)
      setFilteredProducts(filtered)
      console.log(`Filtered ${filtered.length} products for category: ${category}`)
    }
  }


  // Handle product share
  const handleProductShare = async (productId) => {
    try {
      // In real implementation, you would call: POST /api/v1/shares
      console.log('Product shared:', productId)
    } catch (error) {
      console.error('Error sharing product:', error)
    }
  }

  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (sellerId) {
      fetchFeedData()
    }
  }, [sellerId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading feed...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!feedData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data</h2>
            <p className="text-gray-600">No feed data available</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <Header />
      
      {/* Main Content */}
      <main className="pt-0">
        {/* Story Scroller */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <StoryScroller
              items={feedData.stories}
              activeId={activeStoryId}
              onSelect={handleStorySelect}
            />
          </div>
        </div>

        {/* Hero Banner Carousel */}
        <div className="bg-white py-6">
          <div className="container mx-auto px-4">
            <BannerCarousel slides={feedData.banners} />
          </div>
        </div>

        {/* Product Masonry Grid */}
        <div className="bg-white py-6">
          <div className="container mx-auto px-4">
            {/* Product Count Header */}
            {filteredProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeStoryId === 'my-feed' 
                    ? `All Products (${filteredProducts.length})`
                    : `${mockBannersAndStories.stories.find(s => s.id === activeStoryId)?.label || 'Products'} (${filteredProducts.length})`
                  }
                </h3>
              </div>
            )}
            
            {filteredProducts.length > 0 ? (
              <MasonryGrid>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onShare={handleProductShare}
                  />
                ))}
              </MasonryGrid>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {activeStoryId === 'my-feed' 
                    ? "This seller doesn't have any products available at the moment."
                    : `No products found in the ${mockBannersAndStories.stories.find(s => s.id === activeStoryId)?.label || 'selected'} category.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default SellerFeedPage
