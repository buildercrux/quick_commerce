/**
 * Admin Products Page Component - Tailwind/Vanilla CSS
 * Product management for administrators with add/edit functionality
 */

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAllProducts, deleteProduct, createProduct, updateProduct } from '../../features/products/productSlice'
import { getSellerProducts as fetchMine, deleteProduct as deleteMine, updateProduct as updateMine } from '../../features/seller/sellerSlice'
import ImageUpload from '../../components/ui/ImageUpload'
import sellerAPI from '../../services/sellerAPI'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const dispatch = useDispatch()
  const role = useSelector((state) => state.auth?.user?.role)
  const productsState = useSelector((state) => state.products)
  const sellerState = useSelector((state) => state.seller)
  const products = role === 'seller' ? (sellerState?.products || []) : (productsState?.products || [])
  const isLoading = role === 'seller' ? !!sellerState?.loading : !!productsState?.isLoading
  const error = role === 'seller' ? sellerState?.error : productsState?.error
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [page, setPage] = useState(1)
  const [viewMode] = useState('cards') // cards view only

  useEffect(() => {
    if (role === 'seller') {
      dispatch(fetchMine())
    } else {
      dispatch(fetchAllProducts({ page, limit: 20 }))
    }
  }, [dispatch, page, role])

  const handleAddProduct = () => {
    setShowAddDialog(true)
    setEditingProduct(null)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowAddDialog(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      if (role === 'seller') {
        await dispatch(deleteMine(productId))
        dispatch(fetchMine())
      } else {
        await dispatch(deleteProduct(productId))
        dispatch(fetchAllProducts({ page, limit: 20 }))
      }
    }
  }


  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget)
    setSelectedProduct(product)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProduct(null)
  }

  const list = Array.isArray(products) ? products : []
  const filteredProducts = list.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && product.status === 'active') ||
                         (statusFilter === 'inactive' && product.status === 'inactive')
    
    return matchesSearch && matchesCategory && matchesStatus
  }) || []

  const categories = [...new Set(products?.map(p => p.category) || [])]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Product Management</h1>
            <p className="text-gray-500">Manage all products across the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <span className="text-lg">＋</span>
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <button
                    onClick={() => role === 'seller' ? dispatch(fetchMine()) : dispatch(fetchAllProducts({ page, limit: 20 }))}
                className="w-full rounded-md border px-3 py-2 hover:bg-gray-50"
                  >
                    Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
            <div className="col-span-full flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
                ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">No products found</div>
                ) : (
                  filteredProducts.map((product) => (
              <div key={product._id} className="rounded-lg border bg-white overflow-hidden flex flex-col">
                <div className="relative aspect-video bg-gray-100">
                  <img
                            src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {product.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-3 flex-1 grid gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold truncate" title={product.name}>{product.name}</h3>
                    <div className="text-sm font-bold">₹{product.price?.toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                            {product.vendor?.businessName || product.vendor?.name || 'Unknown'}
                  </div>
                  {role !== 'seller' && product.seller && (
                    <div className="text-xs text-blue-600 truncate flex items-center gap-1" title={`Seller: ${product.seller?.storeName || product.seller?.name || product.seller?.email || ''}`}>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100">Seller-added</span>
                      <span className="truncate">{product.seller?.storeName || product.seller?.name || product.seller?.email}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="truncate">{product.category}</span>
                    <span>Stock: {product.inventory?.quantity ?? product.stock ?? 0}</span>
                  </div>
                </div>
                <div className="p-3 pt-0 flex items-center gap-2">
                  <button
                              onClick={() => handleEditProduct(product)}
                    className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="flex-1 rounded-md border border-red-300 text-red-600 px-3 py-2 text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Prev
          </button>
          <div className="rounded-md border px-3 py-2 text-sm bg-gray-50">Page {page}</div>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Next
          </button>
        </div>

        {/* Add/Edit Product Modal */}
        <ProductFormDialog
          open={showAddDialog}
          onClose={() => {
            setShowAddDialog(false)
            setEditingProduct(null)
          }}
          product={editingProduct}
          onSave={async (productData) => {
            if (editingProduct) {
              try {
                if (role === 'seller') {
                  await dispatch(updateMine({ productId: editingProduct._id, productData })).unwrap()
                  await dispatch(fetchMine()).unwrap()
                } else {
                  await dispatch(updateProduct({ id: editingProduct._id, productData })).unwrap()
                  await dispatch(fetchAllProducts({ page, limit: 20 })).unwrap()
                }
                toast.success('Product updated successfully!')
              } catch (error) {
                toast.error('Failed to update product: ' + (error.message || 'Unknown error'))
              }
            } else {
              try {
                // If current role is seller, use seller create+image endpoints for Cloudinary upload parity
                const state = window.__APP_STORE__?.getState?.()
                const role = state?.auth?.user?.role
                if (role === 'seller') {
                  const res = await sellerAPI.createProduct(productData)
                  const newId = res?.data?.data?._id
                  if (newId && productData.images?.length) {
                    // If images is an array of File objects from ImageUpload
                    const fd = new FormData()
                    productData.images.forEach((img) => {
                      if (img instanceof File) fd.append('images', img)
                    })
                    if ([...fd.keys()].length) {
                      await sellerAPI.uploadImages(newId, fd)
                    }
                  }
                  await dispatch(fetchMine()).unwrap()
                } else {
                  await dispatch(createProduct(productData)).unwrap()
                  dispatch(fetchAllProducts({ page, limit: 20 }))
                }
              } catch (error) {
                toast.error('Failed to create product')
              }
            }
            setShowAddDialog(false)
            setEditingProduct(null)
          }}
        />
      </div>
    </div>
  )
}

// Product Form Dialog Component
const ProductFormDialog = ({ open, onClose, product, onSave }) => {
  // Tailwind modal doesn't need useTheme/useMediaQuery
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    isActive: true,
    images: [],
    deliveryOptions: {
      instant: false,
      nextDay: false,
      standard: true
    }
  })

  const [errors, setErrors] = useState({})

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stock: (() => {
          const qty = product.inventory?.quantity ?? product.stock
          if (qty === 0) return 0
          return qty ?? ''
        })(),
        isActive: product.status === 'active',
        images: product.images || [],
        deliveryOptions: {
          instant: product.deliveryOptions?.instant || false,
          nextDay: product.deliveryOptions?.nextDay || false,
          standard: product.deliveryOptions?.standard ?? true
        }
      })
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        isActive: true,
        images: [],
        deliveryOptions: {
          instant: false,
          nextDay: false,
          standard: true
        }
      })
    }
    // Clear errors when product changes
    setErrors({})
  }, [product])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setErrors({})
    }
  }, [open])

  const categories = [
    'electronics', 'fashion', 'home', 'books', 'sports', 'beauty', 
    'toys', 'automotive', 'grocery', 'health'
  ]

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDeliveryOptionChange = (option) => (event) => {
    const value = event.target.checked
    setFormData(prev => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [option]: value
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required'
    
    // Delivery options validation - at least one must be selected
    const hasDeliveryOption = formData.deliveryOptions.instant || 
                             formData.deliveryOptions.nextDay || 
                             formData.deliveryOptions.standard
    if (!hasDeliveryOption) {
      newErrors.deliveryOptions = 'At least one delivery option must be selected'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Convert string values to appropriate types
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      // Map UI 'stock' into backend 'inventory.quantity'
      inventory: {
        ...(product?.inventory || {}),
        quantity: parseInt(formData.stock)
      }
    }
    // Map UI 'isActive' boolean to backend 'status' enum
    processedData.status = formData.isActive ? 'active' : 'inactive'
    delete processedData.stock
    delete processedData.isActive
    
    console.log('Form data being submitted:', processedData)
    console.log('Product being edited:', product)
    onSave(processedData)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] rounded-lg bg-white shadow-lg flex flex-col">
        {/* Fixed Header */}
        <div className="border-b px-4 py-3 flex-shrink-0">
          <h2 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  value={formData.name}
                  onChange={handleChange('name')}
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={handleChange('description')}
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="flex items-center rounded-md border border-gray-300 focus-within:ring-1 focus-within:ring-blue-500">
                  <span className="px-3 text-gray-500">₹</span>
                  <input
                  type="number"
                  value={formData.price}
                  onChange={handleChange('price')}
                    className="w-full rounded-r-md focus:outline-none px-2 py-2"
                  required
                />
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={handleChange('stock')}
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    value={formData.category}
                    onChange={handleChange('category')}
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                    <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                      checked={formData.isActive}
                      onChange={handleChange('isActive')}
                  id="activeStatus"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="activeStatus" className="text-sm text-gray-700">Active Status</label>
              </div>
              
              <div className="md:col-span-2">
                <div className="my-2 h-px bg-gray-200" />
                <p className="text-sm font-medium text-gray-700 mb-2">Delivery Options</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['instant','nextDay','standard'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!formData.deliveryOptions[opt]}
                        onChange={handleDeliveryOptionChange(opt)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">{opt === 'nextDay' ? 'Next Day' : opt}</span>
                    </label>
                  ))}
                </div>
                {errors.deliveryOptions && <p className="mt-1 text-xs text-red-600">{errors.deliveryOptions}</p>}
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Product Images</p>
                <div className="max-h-64 overflow-y-auto">
                  <ImageUpload
                    value={formData.images}
                    onChange={(images) => setFormData(prev => ({ ...prev, images }))}
                    multiple={true}
                    maxFiles={5}
                    folder="ecom-multirole/products"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Fixed Footer */}
        <div className="border-t px-4 py-3 flex justify-end gap-2 flex-shrink-0">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 hover:bg-gray-50">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProducts

