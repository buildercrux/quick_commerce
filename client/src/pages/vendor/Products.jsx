/**
 * Vendor Products Page Component
 * Product management for vendors
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react'
import { fetchVendorProducts } from '../../features/vendor/vendorSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const VendorProducts = () => {
  const dispatch = useDispatch()
  const { products, isLoading, pagination } = useSelector((state) => state.vendor)

  useEffect(() => {
    dispatch(fetchVendorProducts({ page: 1, limit: 12 }))
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                <p className="text-gray-600 mt-2">
                  Manage your product inventory and listings
                </p>
              </div>
              <button className="btn-primary btn-lg mt-4 sm:mt-0 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select className="form-select">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Books</option>
                </select>
                <select className="form-select">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Draft</option>
                </select>
                <button className="btn-outline flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-6">
                <Package className="h-24 w-24 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No products yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your store by adding your first product. It's easy and takes just a few minutes.
              </p>
              <button className="btn-primary btn-lg inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-soft overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={product.images[0]?.url || '/placeholder-product.jpg'}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-lg font-semibold text-primary-600 mb-3">
                      ${product.price}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-error-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.views || 0} views
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page === 1}
                  className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`btn-sm ${
                          page === pagination.page
                            ? 'btn-primary'
                            : 'btn-outline'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (
                    page === pagination.page - 2 ||
                    page === pagination.page + 2
                  ) {
                    return <span key={page} className="px-2">...</span>
                  }
                  return null
                })}
                
                <button
                  disabled={pagination.page === pagination.pages}
                  className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VendorProducts






