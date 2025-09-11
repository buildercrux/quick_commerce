/**
 * Admin Homepage Sections Management
 * Complete admin interface for managing dynamic homepage sections
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShoppingCartIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { 
  fetchAllHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  addProductToSection,
  removeProductFromSection,
  clearError
} from '../../features/homepageSections/homepageSectionSlice'
import { fetchProducts } from '../../features/products/productSlice'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const HomepageSections = () => {
  const dispatch = useDispatch()
  const { sections, isLoading, error } = useSelector((state) => state.homepageSections)
  const { products } = useSelector((state) => state.products)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'category',
    category: '',
    maxProducts: 6,
    order: 0,
    isVisible: true,
    bannerText: '',
    bannerLink: ''
  })

  useEffect(() => {
    dispatch(fetchAllHomepageSections())
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleCreateSection = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createHomepageSection(formData)).unwrap()
      toast.success('Section created successfully!')
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to create section')
    }
  }

  const handleUpdateSection = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateHomepageSection({ 
        sectionId: selectedSection._id, 
        sectionData: formData 
      })).unwrap()
      toast.success('Section updated successfully!')
      setShowEditModal(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to update section')
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await dispatch(deleteHomepageSection(sectionId)).unwrap()
        toast.success('Section deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete section')
      }
    }
  }

  const handleAddProduct = async (productId) => {
    try {
      await dispatch(addProductToSection({ 
        sectionId: selectedSection._id, 
        productId 
      })).unwrap()
      toast.success('Product added to section!')
      setShowProductModal(false)
    } catch (error) {
      toast.error('Failed to add product')
    }
  }

  const handleRemoveProduct = async (productId) => {
    try {
      await dispatch(removeProductFromSection({ 
        sectionId: selectedSection._id, 
        productId 
      })).unwrap()
      toast.success('Product removed from section!')
    } catch (error) {
      toast.error('Failed to remove product')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'category',
      category: '',
      maxProducts: 6,
      order: 0,
      isVisible: true,
      bannerText: '',
      bannerLink: ''
    })
    setSelectedSection(null)
  }

  const openEditModal = (section) => {
    setSelectedSection(section)
    setFormData({
      title: section.title,
      description: section.description || '',
      type: section.type,
      category: section.category || '',
      maxProducts: section.maxProducts,
      order: section.order,
      isVisible: section.isVisible,
      bannerText: section.bannerText || '',
      bannerLink: section.bannerLink || ''
    })
    setShowEditModal(true)
  }

  const openProductModal = (section) => {
    setSelectedSection(section)
    setShowProductModal(true)
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading homepage sections..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Homepage Sections</h1>
            <p className="text-gray-600 mt-2">Manage dynamic sections for your homepage</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Section</span>
          </button>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {sections?.map((section, index) => (
              <motion.div
                key={section._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Section Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          section.isVisible 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {section.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          section.type === 'banner' ? 'bg-purple-100 text-purple-700' :
                          section.type === 'category' ? 'bg-blue-100 text-blue-700' :
                          section.type === 'featured' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {section.type}
                        </span>
                      </div>
                      {section.description && (
                        <p className="text-gray-600 mb-3">{section.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Order: {section.order}</span>
                        <span>Products: {section.products?.length || 0}/{section.maxProducts}</span>
                        {section.category && <span>Category: {section.category}</span>}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openProductModal(section)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Manage Products"
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(section)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit Section"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Section"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products Preview */}
                {section.products && section.products.length > 0 && (
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Products in this section:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {section.products.slice(0, 4).map((product) => (
                        <div key={product._id} className="relative group">
                          <img
                            src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => handleRemoveProduct(product._id)}
                              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{product.name}</p>
                        </div>
                      ))}
                      {section.products.length > 4 && (
                        <div className="flex items-center justify-center h-20 bg-gray-100 rounded-lg">
                          <span className="text-sm text-gray-500">+{section.products.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sections?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bars3Icon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sections created yet</h3>
            <p className="text-gray-600 mb-6">Create your first homepage section to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create First Section
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create New Section</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateSection} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Section title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="category">Category</option>
                        <option value="featured">Featured</option>
                        <option value="custom">Custom</option>
                        <option value="banner">Banner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Section description"
                      />
                    </div>

                    {formData.type === 'category' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Product category"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Products
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.maxProducts}
                        onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Visible on homepage</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        resetForm()
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Create Section
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Edit Section</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdateSection} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Section title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="category">Category</option>
                        <option value="featured">Featured</option>
                        <option value="custom">Custom</option>
                        <option value="banner">Banner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Section description"
                      />
                    </div>

                    {formData.type === 'category' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Product category"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Products
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.maxProducts}
                        onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Visible on homepage</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        resetForm()
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Update Section
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Manage Products - {selectedSection?.title}
                  </h2>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products?.filter(product => 
                    !selectedSection?.products?.some(p => p._id === product._id)
                  ).map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <img
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">₹{product.price?.toLocaleString()}</p>
                      <button
                        onClick={() => handleAddProduct(product._id)}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add to Section
                      </button>
                    </div>
                  ))}
                </div>
                
                {products?.filter(product => 
                  !selectedSection?.products?.some(p => p._id === product._id)
                ).length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No available products</h3>
                    <p className="text-gray-600">All products are already added to this section.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomepageSections