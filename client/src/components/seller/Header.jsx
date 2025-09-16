import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu,
  X
} from 'lucide-react'
import Logo from '../layout/Logo'

const Header = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const primaryMenuItems = ['WOMEN', 'MEN', 'KIDS', 'HOME', 'BEAUTY', 'SPORTS']
  const subMenuItems = ['WOMEN', 'MEN', 'GIRLS', 'BOYS']

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <div className="sticky top-0 z-40 shadow-sm bg-white/80 backdrop-blur">
      {/* TopBar - 64px */}
      <div className="h-16 border-b border-gray-200">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
              className="cursor-pointer"
            >
              <Logo />
            </motion.div>

            {/* Primary Menu Items - Centered */}
            <div className="hidden lg:flex items-center space-x-8">
              {primaryMenuItems.map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {item}
                </motion.button>
              ))}
            </div>

            {/* Utility Icons - Right */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Scrapbook */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/wishlist')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5" />
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/cart')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>

              {/* Profile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* SubMenuBar - 48px */}
      <div className="h-12 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center h-full">
            <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
              {subMenuItems.map((item, index) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  className={`text-sm font-medium px-2 py-1 border-b-2 transition-colors whitespace-nowrap ${
                    index === 0 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white border-b border-gray-200"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>

              {/* Mobile Menu Items */}
              <div className="space-y-2">
                {primaryMenuItems.map((item) => (
                  <motion.button
                    key={item}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Header




