/**
 * Main App Component
 * Application routing and layout structure
 */

import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { checkAuthStatus } from './features/auth/authSlice'
import theme from './theme/theme'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleRoute from './components/auth/RoleRoute'
import AdminLayout from './components/admin/AdminLayout'

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'))
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'))
const CartPage = React.lazy(() => import('./pages/CartPage'))
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'))
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'))
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'))
const ProfilePage = React.lazy(() => import('./pages/user/ProfilePage'))

// Debug component
import APITest from './components/debug/APITest'
const OrdersPage = React.lazy(() => import('./pages/user/OrdersPage'))
const OrderDetailPage = React.lazy(() => import('./pages/user/OrderDetailPage'))
const VendorDashboard = React.lazy(() => import('./pages/vendor/Dashboard'))
const VendorProducts = React.lazy(() => import('./pages/vendor/Products'))
const VendorOrders = React.lazy(() => import('./pages/vendor/Orders'))
const VendorAnalytics = React.lazy(() => import('./pages/vendor/Analytics'))
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers = React.lazy(() => import('./pages/admin/Users'))
const AdminProducts = React.lazy(() => import('./pages/admin/Products'))
const AdminOrders = React.lazy(() => import('./pages/admin/Orders'))
const AdminAnalytics = React.lazy(() => import('./pages/admin/Analytics'))
const AdminHomepageSections = React.lazy(() => import('./pages/admin/HomepageSections'))
const AdminBanners = React.lazy(() => import('./pages/admin/Banners'))
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'))
const AdminSellers = React.lazy(() => import('./pages/admin/Sellers'))
const SellerRegisterPage = React.lazy(() => import('./pages/seller/RegisterPage'))
const SellerLoginPage = React.lazy(() => import('./pages/seller/LoginPage'))
const SellerDashboard = React.lazy(() => import('./pages/seller/Dashboard'))
const SellerProducts = React.lazy(() => import('./pages/seller/Products'))
const TestSellerNearby = React.lazy(() => import('./pages/TestSellerNearby'))
const SellerPage = React.lazy(() => import('./pages/SellerPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

function App() {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    // Check authentication status on app load, but not on login/register pages
    const currentPath = window.location.pathname
    if (currentPath !== '/login' && currentPath !== '/register') {
      dispatch(checkAuthStatus())
    }
  }, [dispatch])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-50">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/debug" element={<APITest />} />
            <Route path="/testsellernearby" element={<TestSellerNearby />} />
            <Route path="/seller/:sellerId" element={<SellerPage />} />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
              } 
            />
            <Route 
              path="/seller/login" 
              element={
                isAuthenticated && user?.role === 'seller' ? <Navigate to="/seller/dashboard" replace /> : <SellerLoginPage />
              } 
            />
            <Route 
              path="/seller/register" 
              element={
                isAuthenticated && user?.role === 'seller' ? <Navigate to="/seller/dashboard" replace /> : <SellerRegisterPage />
              } 
            />
            
            {/* Protected Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            
            {/* User Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            } />
            
            {/* Vendor Routes */}
            <Route path="/vendor" element={
              <RoleRoute allowedRoles={['vendor', 'admin']}>
                <VendorDashboard />
              </RoleRoute>
            } />
            <Route path="/vendor/products" element={
              <RoleRoute allowedRoles={['vendor', 'admin']}>
                <VendorProducts />
              </RoleRoute>
            } />
            <Route path="/vendor/orders" element={
              <RoleRoute allowedRoles={['vendor', 'admin']}>
                <VendorOrders />
              </RoleRoute>
            } />
            <Route path="/vendor/analytics" element={
              <RoleRoute allowedRoles={['vendor', 'admin']}>
                <VendorAnalytics />
              </RoleRoute>
            } />
            {/* Seller Routes (handled below with AdminLayout for identical UI) */}
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="homepage-sections" element={<AdminHomepageSections />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Seller uses same Admin UI */}
            <Route path="/seller" element={
              <RoleRoute allowedRoles={['seller']}>
                <AdminLayout />
              </RoleRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="homepage-sections" element={<AdminHomepageSections />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
    </ThemeProvider>
  )
}

export default App

