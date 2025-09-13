/**
 * Navbar Component - Modern E-commerce Design with Tailwind CSS
 */

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  BellIcon,
  ChevronDownIcon,
  TagIcon,
  SparklesIcon,
  TruckIcon,
  GiftIcon,
  PhoneIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  HomeIcon as HomeCategoryIcon,
  HeartIcon as BeautyIcon,
  BookOpenIcon,
  AcademicCapIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { logout } from '../../features/auth/authSlice'
import authAPI from '../../services/authAPI'
import Logo from './Logo'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] })
  const { wishlistCount } = useSelector((state) => state.wishlist || { wishlistCount: 0 })
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      dispatch(logout())
      navigate('/')
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const getCartItemsCount = () => {
    return cartItems?.reduce((total, item) => total + item.quantity, 0) || 0
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const categories = [
    { name: 'Electronics', icon: ComputerDesktopIcon, href: '/products?category=electronics' },
    { name: 'Mobile Phones', icon: DevicePhoneMobileIcon, href: '/products?category=mobile' },
    { name: 'Fashion', icon: TagIcon, href: '/products?category=fashion' },
    { name: 'Home & Living', icon: HomeCategoryIcon, href: '/products?category=home' },
    { name: 'Beauty & Personal Care', icon: BeautyIcon, href: '/products?category=beauty' },
    { name: 'Sports & Fitness', icon: AcademicCapIcon, href: '/products?category=sports' },
    { name: 'Books & Stationery', icon: BookOpenIcon, href: '/products?category=books' },
    { name: 'Gifts', icon: GiftIcon, href: '/products?category=gifts' }
  ]

  const NavLink = ({ to, children, icon, onClick }) => (
    <button
      onClick={onClick || (() => navigate(to))}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive(to) 
          ? 'bg-brand/10 text-brand shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      <span className="text-sm">{children}</span>
    </button>
  )

  return (
    <nav className="sticky top-0 z-50 bg-navbar-bg/95 backdrop-blur-lg border-b border-theme shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="cursor-pointer group"
          >
            <Logo className="group-hover:shadow-lg transition-all duration-300" />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink to="/" icon={<HomeIcon />}>
              Home
            </NavLink>
            
            {/* Categories Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <TagIcon className="h-4 w-4" />
                <span>Categories</span>
                <ChevronDownIcon className="h-3 w-3" />
              </motion.button>

              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50"
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <div className="grid grid-cols-2 gap-1 px-3">
                      {categories.map((category, index) => (
                        <motion.button
                          key={category.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            navigate(category.href)
                            setIsCategoriesOpen(false)
                          }}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <category.icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/products" icon={<BuildingStorefrontIcon />}>
                Products
            </NavLink>
            
            <NavLink to="/testsellernearby" icon={<MapPinIcon />}>
                Test Nearby
            </NavLink>
            
            {user?.role === 'seller' && (
              <NavLink to="/seller/dashboard" icon={<BuildingStorefrontIcon />}>
                Seller Admin
              </NavLink>
            )}

              {user?.role === 'admin' && (
              <NavLink to="/admin" icon={<Cog6ToothIcon />}>
                  Admin
              </NavLink>
              )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-16 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                />
                <button
                type="submit"
                  className="absolute inset-y-0 right-0 pr-2 flex items-center"
                >
                  <div className="px-3 py-1 bg-brand text-white rounded-md text-xs font-medium hover:bg-brand-hover transition-colors">
                    Search
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1">
            {/* Mobile Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </motion.button>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/favorites')}
              className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <HeartIcon className="h-5 w-5" />
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {getCartItemsCount()}
                </span>
              )}
            </motion.button>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/wishlist')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4" />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {user?.role}
                        </span>
                      </div>
                      
                      <div className="py-2">
                        <NavLink to="/profile" icon={<UserIcon />} onClick={() => setIsUserMenuOpen(false)}>
                    Profile
                        </NavLink>
                        <NavLink to="/favorites" icon={<HeartIcon />} onClick={() => setIsUserMenuOpen(false)}>
                    Favorites
                        </NavLink>
                        <NavLink to="/orders" icon={<BellIcon />} onClick={() => setIsUserMenuOpen(false)}>
                    Orders
                        </NavLink>
                        {user?.role === 'seller' && (
                          <NavLink to="/seller/dashboard" icon={<BuildingStorefrontIcon />} onClick={() => setIsUserMenuOpen(false)}>
                            Seller Admin
                          </NavLink>
                        )}
                  {user?.role === 'admin' && (
                          <NavLink to="/admin" icon={<Cog6ToothIcon />} onClick={() => setIsUserMenuOpen(false)}>
                      Admin Panel
                          </NavLink>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                >
                  Sign Up
                </motion.button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-white py-3"
            >
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  >
                    <div className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
                      Search
                    </div>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4 space-y-2">
                <NavLink to="/" icon={<HomeIcon />} onClick={() => setIsMenuOpen(false)}>
                  Home
                </NavLink>
                
                {/* Mobile Categories */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category.name}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          navigate(category.href)
                          setIsMenuOpen(false)
                        }}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <category.icon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <NavLink to="/products" icon={<BuildingStorefrontIcon />} onClick={() => setIsMenuOpen(false)}>
                  All Products
                </NavLink>
                
                <NavLink to="/testsellernearby" icon={<MapPinIcon />} onClick={() => setIsMenuOpen(false)}>
                  Test Nearby
                </NavLink>
                
              {user?.role === 'seller' && (
                  <NavLink to="/seller/dashboard" icon={<BuildingStorefrontIcon />} onClick={() => setIsMenuOpen(false)}>
                  Seller Admin
                  </NavLink>
              )}
                
              {user?.role === 'admin' && (
                  <NavLink to="/admin" icon={<Cog6ToothIcon />} onClick={() => setIsMenuOpen(false)}>
                  Admin
                  </NavLink>
              )}
              </div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar