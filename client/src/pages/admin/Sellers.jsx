/**
 * Admin Sellers Management Page
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchSellers,
  updateSellerStatus,
  deleteSeller,
  selectAdminSellers,
  selectAdminLoading,
  selectAdminPagination
} from '../../features/admin/adminSlice'
import { toast } from 'react-hot-toast'

const Sellers = () => {
  const dispatch = useDispatch()
  const sellers = useSelector(selectAdminSellers)
  const loading = useSelector(selectAdminLoading)
  const pagination = useSelector(selectAdminPagination)

  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchSellers({ status, search, page: pagination.page, limit: pagination.limit }))
  }, [dispatch, status, search])

  const handleApprove = async (sellerId, approve) => {
    try {
      await dispatch(updateSellerStatus({ sellerId, data: { isApproved: approve } })).unwrap()
      toast.success(approve ? 'Seller approved' : 'Approval removed')
    } catch (e) {
      toast.error(e || 'Failed to update seller')
    }
  }

  const handleSuspend = async (sellerId, suspend) => {
    try {
      await dispatch(updateSellerStatus({ sellerId, data: { isSuspended: suspend } })).unwrap()
      toast.success(suspend ? 'Seller suspended' : 'Seller unsuspended')
    } catch (e) {
      toast.error(e || 'Failed to update seller')
    }
  }

  const handleDelete = async (sellerId) => {
    if (!window.confirm('Delete this seller? They must have no products.')) return
    try {
      await dispatch(deleteSeller(sellerId)).unwrap()
      toast.success('Seller deleted')
    } catch (e) {
      toast.error(e || 'Failed to delete seller')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Sellers</h2>
        <p className="text-gray-600">Approve, suspend, or remove sellers.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="name, email, store..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers?.map(seller => (
              <tr key={seller._id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                  <div className="text-sm text-gray-500">{seller.email} • {seller.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{seller.storeName}</div>
                  <div className="text-sm text-gray-500">{seller.address?.city}, {seller.address?.state} {seller.address?.pincode}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {seller.isApproved ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Approved</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>
                    )}
                    {seller.isSuspended && (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Suspended</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <div className="inline-flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(seller._id, !seller.isApproved)}
                      className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {seller.isApproved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleSuspend(seller._id, !seller.isSuspended)}
                      className="px-3 py-1 rounded-md bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      {seller.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button
                      onClick={() => handleDelete(seller._id)}
                      className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}
      </div>
    </div>
  )
}

export default Sellers
