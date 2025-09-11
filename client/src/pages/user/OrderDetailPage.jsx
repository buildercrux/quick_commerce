/**
 * Order Detail Page Component
 * Individual order view with tracking and actions
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  CreditCard,
  RefreshCw,
  Download
} from 'lucide-react'
import { fetchOrder } from '../../features/orders/orderSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const OrderDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentOrder, isLoading } = useSelector((state) => state.orders)

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id))
    }
  }, [dispatch, id])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-500" />
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-primary-500" />
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-success-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-500" />
      case 'canceled':
        return <XCircle className="h-5 w-5 text-error-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-100 text-warning-800'
      case 'confirmed':
        return 'bg-primary-100 text-primary-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-success-100 text-success-800'
      case 'completed':
        return 'bg-success-100 text-success-800'
      case 'canceled':
        return 'bg-error-100 text-error-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{currentOrder.orderNumber}
                </h1>
                <p className="text-gray-600 mt-1">
                  Placed on {formatDate(currentOrder.createdAt)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentOrder.status)}
                  <span className={`badge ${getStatusColor(currentOrder.status)}`}>
                    {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                  </span>
                </div>
                <button className="btn-outline btn-sm flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Invoice
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Sold by {item.vendor?.vendorProfile?.businessName || item.vendor?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Tracking */}
              {currentOrder.tracking && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h2>
                  <div className="space-y-4">
                    {currentOrder.tracking.carrier && (
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {currentOrder.tracking.carrier}
                          </p>
                          <p className="text-sm text-gray-600">
                            Tracking: {currentOrder.tracking.trackingNumber}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentOrder.tracking.estimatedDelivery && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Estimated Delivery</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(currentOrder.tracking.estimatedDelivery)}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentOrder.tracking.deliveredAt && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success-500" />
                        <div>
                          <p className="font-medium text-gray-900">Delivered</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(currentOrder.tracking.deliveredAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${currentOrder.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${currentOrder.pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {currentOrder.pricing.shippingFee === 0 ? 'Free' : `$${currentOrder.pricing.shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary-600">${currentOrder.pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{currentOrder.shippingAddress.name}</p>
                    <p className="text-gray-600">
                      {currentOrder.shippingAddress.street}<br />
                      {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}<br />
                      {currentOrder.shippingAddress.country}
                    </p>
                    {currentOrder.shippingAddress.phone && (
                      <p className="text-gray-600 mt-1">{currentOrder.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {currentOrder.paymentInfo.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {currentOrder.paymentInfo.paymentStatus}
                    </p>
                    {currentOrder.paymentInfo.paidAt && (
                      <p className="text-sm text-gray-600">
                        Paid on {formatDate(currentOrder.paymentInfo.paidAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {currentOrder.status === 'pending' && (
                    <button className="btn-outline btn-sm w-full flex items-center justify-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Order
                    </button>
                  )}
                  {currentOrder.status === 'delivered' && (
                    <button className="btn-outline btn-sm w-full flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Return Item
                    </button>
                  )}
                  <button className="btn-primary btn-sm w-full flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage




