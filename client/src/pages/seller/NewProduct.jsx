/**
 * Seller New Product Page
 * Simple form to create a product linked to the current seller
 */

import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import sellerAPI from '../../services/sellerAPI'

const NewProduct = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inventory: { quantity: 0, trackQuantity: true },
    deliveryOptions: { instant: false, nextDay: false, standard: true },
    status: 'active'
  })
  const [files, setFiles] = useState([])
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    const num = value === '' ? '' : Number(value)
    setForm((prev) => ({ ...prev, [name]: num }))
  }

  const handleInventoryChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [name]: type === 'checkbox' ? checked : Number(value)
      }
    }))
  }

  const handleDeliveryChange = (e) => {
    const { name, checked } = e.target
    setForm((prev) => ({
      ...prev,
      deliveryOptions: { ...prev.deliveryOptions, [name]: checked }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        inventory: {
          quantity: Number(form.inventory.quantity) || 0,
          trackQuantity: !!form.inventory.trackQuantity,
        },
        deliveryOptions: {
          instant: !!form.deliveryOptions.instant,
          nextDay: !!form.deliveryOptions.nextDay,
          standard: !!form.deliveryOptions.standard,
        },
        status: form.status,
      }
      const createRes = await sellerAPI.createProduct(payload)
      const productId = createRes?.data?.data?._id

      // Upload images if provided using seller image endpoint
      if (productId && files.length > 0) {
        const fd = new FormData()
        files.forEach((file) => fd.append('images', file))
        await sellerAPI.uploadImages(productId, fd)
      }

      navigate('/seller/products')
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
        
        {/* Fixed height container with scrollable content */}
        <div className="bg-white rounded-lg shadow max-h-[80vh] flex flex-col">
          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" rows={4} required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleNumberChange} className="mt-1 w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input name="category" value={form.category} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
                </div>
              </div>

              {/* Images Section - Fixed height with scroll */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-1 w-full"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
                {previews.length > 0 && (
                  <div className="mt-3 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">Up to 5 images. First image becomes primary.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input name="quantity" type="number" value={form.inventory.quantity} onChange={handleInventoryChange} className="mt-1 w-full border rounded px-3 py-2" />
                  <div className="mt-2 flex items-center space-x-2">
                    <input id="trackQuantity" name="trackQuantity" type="checkbox" checked={form.inventory.trackQuantity} onChange={handleInventoryChange} />
                    <label htmlFor="trackQuantity" className="text-sm text-gray-700">Track quantity</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Options</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="instant" checked={form.deliveryOptions.instant} onChange={handleDeliveryChange} />
                    <span className="text-sm">Instant</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="nextDay" checked={form.deliveryOptions.nextDay} onChange={handleDeliveryChange} />
                    <span className="text-sm">Next Day</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="standard" checked={form.deliveryOptions.standard} onChange={handleDeliveryChange} />
                    <span className="text-sm">Standard</span>
                  </label>
                </div>
              </div>
            </form>
          </div>
          
          {/* Fixed footer with buttons */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-2">
            <button 
              type="button" 
              className="px-4 py-2 rounded border hover:bg-gray-50 transition-colors" 
              onClick={() => navigate('/seller/products')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60 hover:bg-indigo-700 transition-colors"
              onClick={handleSubmit}
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProduct


