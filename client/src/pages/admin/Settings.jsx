/**
 * Admin Settings Page
 * General settings and configuration for the admin panel
 */

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import sellerAPI from '../../services/sellerAPI'
import userAPI from '../../services/userAPI'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

const AdminSettings = () => {
  const { user } = useSelector((state) => state.auth)
  const [settings, setSettings] = useState({
    siteName: 'Ecommerce Store',
    siteDescription: 'Your one-stop shop for everything',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    theme: 'light',
    timezone: 'UTC',
    currency: 'INR'
  })

  const [sellerDetails, setSellerDetails] = useState(null)
  const [sellerForm, setSellerForm] = useState({
    sellerName: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    gstNumber: '',
    latitude: '',
    longitude: ''
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadDetails = async () => {
      if (user?.role !== 'seller') return
      try {
        const { data } = await sellerAPI.getSellerDetails()
        if (data?.data) {
          setSellerDetails(data.data)
          setSellerForm({
            sellerName: data.data.sellerName || '',
            phone: data.data.phone || '',
            address: {
              street: data.data.address?.street || '',
              city: data.data.address?.city || '',
              state: data.data.address?.state || '',
              pincode: data.data.address?.pincode || '',
              country: data.data.address?.country || 'India',
            },
            gstNumber: data.data.gstNumber || '',
            latitude: typeof data.data.location?.coordinates?.[1] === 'number' ? String(data.data.location.coordinates[1]) : '',
            longitude: typeof data.data.location?.coordinates?.[0] === 'number' ? String(data.data.location.coordinates[0]) : ''
          })
        }
      } catch (e) {
        // ignore
      }
    }
    loadDetails()
  }, [user])

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings)
    toast.success('Settings saved')
  }

  const handleSellerSave = async () => {
    try {
      const payload = {
        ...sellerForm,
        pincode: sellerForm.address.pincode
      }
      const lat = parseFloat(sellerForm.latitude)
      const lng = parseFloat(sellerForm.longitude)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        payload.location = { type: 'Point', coordinates: [lng, lat] }
      }
      delete payload.latitude
      delete payload.longitude
      const { data } = await sellerAPI.upsertSellerDetails(payload)
      setSellerDetails(data.data)
      toast.success('Seller details updated')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update seller details')
    }
  }

  const settingsSections = [
    {
      title: 'General Settings',
      icon: Cog6ToothIcon,
      fields: [
        {
          label: 'Site Name',
          type: 'text',
          value: settings.siteName,
          onChange: (value) => setSettings({ ...settings, siteName: value })
        },
        {
          label: 'Site Description',
          type: 'textarea',
          value: settings.siteDescription,
          onChange: (value) => setSettings({ ...settings, siteDescription: value })
        },
        {
          label: 'Maintenance Mode',
          type: 'checkbox',
          value: settings.maintenanceMode,
          onChange: (value) => setSettings({ ...settings, maintenanceMode: value })
        }
      ]
    },
    {
      title: 'User Settings',
      icon: ShieldCheckIcon,
      fields: [
        {
          label: 'Allow Registration',
          type: 'checkbox',
          value: settings.allowRegistration,
          onChange: (value) => setSettings({ ...settings, allowRegistration: value })
        },
        {
          label: 'Email Notifications',
          type: 'checkbox',
          value: settings.emailNotifications,
          onChange: (value) => setSettings({ ...settings, emailNotifications: value })
        }
      ]
    },
    {
      title: 'Appearance',
      icon: PaintBrushIcon,
      fields: [
        {
          label: 'Theme',
          type: 'select',
          value: settings.theme,
          options: ['light', 'dark', 'auto'],
          onChange: (value) => setSettings({ ...settings, theme: value })
        }
      ]
    },
    {
      title: 'Regional Settings',
      icon: GlobeAltIcon,
      fields: [
        {
          label: 'Timezone',
          type: 'select',
          value: settings.timezone,
          options: ['UTC', 'IST', 'EST', 'PST'],
          onChange: (value) => setSettings({ ...settings, timezone: value })
        },
        {
          label: 'Currency',
          type: 'select',
          value: settings.currency,
          options: ['INR', 'USD', 'EUR', 'GBP'],
          onChange: (value) => setSettings({ ...settings, currency: value })
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your store settings and preferences</p>
      </div>

      <div className="space-y-8">
        {user?.role === 'seller' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <KeyIcon className="h-6 w-6 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Seller Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={sellerForm.latitude}
                    onChange={(e) => setSellerForm((p) => ({ ...p, latitude: e.target.value }))}
                    placeholder="e.g., 26.7606"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={sellerForm.longitude}
                    onChange={(e) => setSellerForm((p) => ({ ...p, longitude: e.target.value }))}
                    placeholder="e.g., 83.3732"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!('geolocation' in navigator)) return
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const { latitude, longitude } = pos.coords
                        setSellerForm((p) => ({ ...p, latitude: String(latitude), longitude: String(longitude) }))
                      },
                      () => {
                        // silently ignore or you can add a toast
                      },
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
                    )
                  }}
                  className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
                >
                  Use my current location
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seller Name</label>
                  <input
                    value={sellerForm.sellerName}
                    onChange={(e) => setSellerForm((p) => ({ ...p, sellerName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    value={sellerForm.phone}
                    onChange={(e) => setSellerForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street</label>
                  <input
                    value={sellerForm.address.street}
                    onChange={(e) => setSellerForm((p) => ({ ...p, address: { ...p.address, street: e.target.value } }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    value={sellerForm.address.city}
                    onChange={(e) => setSellerForm((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    value={sellerForm.address.state}
                    onChange={(e) => setSellerForm((p) => ({ ...p, address: { ...p.address, state: e.target.value } }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input
                    value={sellerForm.address.pincode}
                    onChange={(e) => setSellerForm((p) => ({ ...p, address: { ...p.address, pincode: e.target.value } }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GST Number</label>
                <input
                  value={sellerForm.gstNumber}
                  onChange={(e) => setSellerForm((p) => ({ ...p, gstNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSellerSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  Save Seller Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <section.icon className="h-6 w-6 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    {field.type === 'checkbox' && (
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {field.value ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    )}
                    {field.type === 'select' && (
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-end"
      >
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
        >
          Save Settings
        </button>
      </motion.div>
    </div>
  )
}

export default AdminSettings