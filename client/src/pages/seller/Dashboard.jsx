/**
 * Seller Dashboard
 * Main dashboard for sellers to manage their business
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { getSellerDashboardStats } from '../../features/seller/sellerSlice'
import sellerAPI from '../../services/sellerAPI'
import { toast } from 'react-hot-toast'

const SellerDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { dashboardStats, loading } = useSelector(state => state.seller)

  const statsDefault = {
    products: { total: 0, active: 0 },
    orders: { total: 0, today: 0, revenue: { total: 0, today: 0 } },
    recentOrders: []
  }
  const [stats, setStats] = useState(statsDefault)
  const [sellerDetails, setSellerDetails] = useState(null)
  const [detailsForm, setDetailsForm] = useState({
    sellerName: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    pincode: '',
  })

  useEffect(() => {
    if (user && user.role === 'seller') {
      dispatch(getSellerDashboardStats())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (dashboardStats) {
      // API returns { success, data } – use data payload only
      setStats(dashboardStats.data || statsDefault)
    }
  }, [dashboardStats])

  useEffect(() => {
    // Load seller details
    const loadDetails = async () => {
      try {
        const { data } = await sellerAPI.getSellerDetails()
        if (data?.data) {
          setSellerDetails(data.data)
        }
      } catch (e) {
        // ignore
      }
    }
    if (user?.role === 'seller') loadDetails()
  }, [user])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setDetailsForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }))
    } else {
      setDetailsForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSaveDetails = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...detailsForm, pincode: detailsForm.address.pincode }
      const { data } = await sellerAPI.upsertSellerDetails(payload)
      setSellerDetails(data.data)
    } catch (err) {
      // optionally toast
    }
  }

  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {changeType === 'increase' ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    )}
                    <span className="sr-only">{changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, href, color = 'blue' }) => (
    <Link
      to={href}
      className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div>
        <span className={`rounded-lg inline-flex p-3 ring-4 ring-white bg-${color}-50 text-${color}-700`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-medium">
          <span className="absolute inset-0" />
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
      <span
        className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
        aria-hidden="true"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4h1a1 1 0 00-1-1v1zm-1 3a1 1 0 102 0V6h-2v1zM8 4a1 1 0 000 2V4zm0 3a1 1 0 102 0V6H8v1zM3 4a1 1 0 000 2V4zm0 3a1 1 0 102 0V6H3v1z" />
        </svg>
      </span>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // First-time seller profile setup UI
  if (user?.role === 'seller' && !sellerDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto py-10 px-4">
          <h2 className="text-2xl font-bold mb-6">Complete your seller profile</h2>
          <form onSubmit={handleSaveDetails} className="bg-white p-6 rounded-lg shadow space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Seller Name</label>
              <input name="sellerName" value={detailsForm.sellerName} onChange={handleFormChange} className="mt-1 w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={detailsForm.phone} onChange={handleFormChange} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <input name="address.street" value={detailsForm.address.street} onChange={handleFormChange} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input name="address.city" value={detailsForm.address.city} onChange={handleFormChange} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input name="address.state" value={detailsForm.address.state} onChange={handleFormChange} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input name="address.pincode" value={detailsForm.address.pincode} onChange={handleFormChange} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome back, {user?.name}!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Here's what's happening with your store today.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/seller/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Products"
            value={stats.products?.total ?? 0}
            icon={ShoppingBagIcon}
            color="blue"
          />
          <StatCard
            title="Active Products"
            value={stats.products?.active ?? 0}
            icon={EyeIcon}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats.orders?.total ?? 0}
            icon={ChartBarIcon}
            color="purple"
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${(stats.orders?.revenue?.today ?? 0).toLocaleString()}`}
            icon={CurrencyDollarIcon}
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Add Product"
              description="Create a new product listing"
              icon={PlusIcon}
              href="/seller/products/new"
              color="blue"
            />
            <QuickActionCard
              title="Manage Products"
              description="View and edit your products"
              icon={ShoppingBagIcon}
              href="/seller/products"
              color="green"
            />
            <QuickActionCard
              title="View Orders"
              description="Check your recent orders"
              icon={ChartBarIcon}
              href="/seller/orders"
              color="purple"
            />
            <QuickActionCard
              title="Analytics"
              description="View sales analytics"
              icon={ChartBarIcon}
              href="/seller/analytics"
              color="yellow"
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <li key={order._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {order.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user?.name} • {order.items?.length} item(s)
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{order.totalAmount?.toLocaleString()}
                          </p>
                          <p className={`text-sm ${
                            order.status === 'pending' ? 'text-yellow-600' :
                            order.status === 'confirmed' ? 'text-blue-600' :
                            order.status === 'shipped' ? 'text-purple-600' :
                            order.status === 'delivered' ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent orders</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Orders will appear here once customers start purchasing your products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
