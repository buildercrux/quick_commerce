/**
 * Admin Dashboard Component - Modern Admin Panel Design with Tailwind CSS
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'
import { fetchDashboard } from '../../features/admin/adminSlice'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { dashboard, isLoading } = useSelector((state) => state.admin)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [dispatch])

  const statCards = [
    {
      title: 'Total Users',
      value: dashboard?.totalUsers || 0,
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'blue'
    },
    {
      title: 'Total Orders',
      value: dashboard?.totalOrders || 0,
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingBagIcon,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboard?.totalRevenue?.toLocaleString() || 0}`,
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: `${dashboard?.conversionRate || 0}%`,
      change: '-2%',
      changeType: 'negative',
      icon: ChartBarIcon,
      color: 'orange'
    }
  ]

  const recentOrders = [
    {
      id: '#12345',
      customer: 'John Doe',
      amount: 2499,
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '#12346',
      customer: 'Jane Smith',
      amount: 1899,
      status: 'processing',
      date: '2024-01-15'
    },
    {
      id: '#12347',
      customer: 'Mike Johnson',
      amount: 3299,
      status: 'pending',
      date: '2024-01-14'
    },
    {
      id: '#12348',
      customer: 'Sarah Wilson',
      amount: 1599,
      status: 'cancelled',
      date: '2024-01-14'
    }
  ]

  const topProducts = [
    {
      name: 'Wireless Headphones',
      sales: 156,
      revenue: 234000,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'Smart Watch',
      sales: 89,
      revenue: 178000,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'Laptop Stand',
      sales: 234,
      revenue: 117000,
      image: '/placeholder-product.jpg'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'processing':
        return <ClockIcon className="h-4 w-4" />
      case 'pending':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  const StatCard = ({ card }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          <div className="flex items-center mt-2">
            {card.changeType === 'positive' ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-${card.color}-100`}>
          <card.icon className={`h-6 w-6 text-${card.color}-600`} />
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex space-x-2">
            {[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          </div>

          {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
              <motion.div
              key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard card={card} />
              </motion.div>
            ))}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
                <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all
                  </button>
                </div>
                
                <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all
              </button>
            </div>
            
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-green-600">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      <span>+12%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Add Product', icon: ShoppingBagIcon, color: 'blue', href: '/admin/products' },
              { title: 'View Orders', icon: ChartBarIcon, color: 'green', href: '/admin/orders' },
              { title: 'Manage Users', icon: UsersIcon, color: 'purple', href: '/admin/users' },
              { title: 'Homepage Sections', icon: Squares2X2Icon, color: 'indigo', href: '/admin/homepage-sections' },
              { title: 'Analytics', icon: ArrowTrendingUpIcon, color: 'orange', href: '/admin/analytics' }
            ].map((action, index) => (
              <motion.a
                key={action.title}
                href={action.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard