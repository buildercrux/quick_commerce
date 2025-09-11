/**
 * Delivery Options Component
 * 3-way toggle for delivery speed selection
 */

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  BoltIcon, 
  TruckIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'
import { setDeliveryMode, fetchProducts } from '../../features/products/productSlice'

const DeliveryOptions = () => {
  const dispatch = useDispatch()
  const { currentDeliveryMode, isLoading } = useSelector((state) => state.products)

  const deliveryOptions = [
    {
      id: 'instant',
      label: 'Instant',
      description: 'Within hours',
      icon: BoltIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      activeBgColor: 'bg-red-100',
      activeBorderColor: 'border-red-500'
    },
    {
      id: 'nextDay',
      label: 'Next Day',
      description: 'Tomorrow',
      icon: TruckIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      activeBgColor: 'bg-blue-100',
      activeBorderColor: 'border-blue-500'
    },
    {
      id: 'standard',
      label: 'Standard',
      description: '2-3 days',
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      activeBgColor: 'bg-green-100',
      activeBorderColor: 'border-green-500'
    }
  ]

  const handleDeliveryModeChange = (mode) => {
    dispatch(setDeliveryMode(mode))
    
    // Fetch filtered products for instant and next-day delivery
    if (mode === 'instant' || mode === 'nextDay') {
      dispatch(fetchProducts({ 
        delivery: mode, 
        limit: 20 
      }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Speed</h3>
        <span className="text-sm text-gray-500">Choose your preferred delivery option</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {deliveryOptions.map((option) => {
          const Icon = option.icon
          const isActive = currentDeliveryMode === option.id
          
          return (
            <motion.button
              key={option.id}
              onClick={() => handleDeliveryModeChange(option.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isActive 
                  ? `${option.activeBgColor} ${option.activeBorderColor} shadow-md` 
                  : `${option.bgColor} ${option.borderColor} hover:shadow-sm`
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${isActive ? 'bg-white shadow-sm' : 'bg-white/50'}
                `}>
                  <Icon className={`h-5 w-5 ${option.color}`} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className={`
                    font-medium text-sm
                    ${isActive ? option.color : 'text-gray-700'}
                  `}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </div>
              
              {isActive && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className={`
                    w-3 h-3 rounded-full
                    ${option.id === 'instant' ? 'bg-red-500' : 
                      option.id === 'nextDay' ? 'bg-blue-500' : 'bg-green-500'}
                  `} />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Loading products...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                {currentDeliveryMode === 'instant' && '⚡ Instant delivery available for select items'}
                {currentDeliveryMode === 'nextDay' && '🚚 Next-day delivery available for most items'}
                {currentDeliveryMode === 'standard' && '📦 Standard delivery available for all items'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryOptions