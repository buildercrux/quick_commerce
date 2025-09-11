/**
 * Vendor Slice
 * Redux slice for vendor dashboard and management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import vendorAPI from '../../services/vendorAPI'

// Initial state
const initialState = {
  dashboard: {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  },
  products: [],
  orders: [],
  analytics: {
    sales: [],
    orders: [],
    products: [],
  },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
}

// Async thunks
export const fetchVendorDashboard = createAsyncThunk(
  'vendor/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendorAPI.getDashboard()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

export const fetchVendorProducts = createAsyncThunk(
  'vendor/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await vendorAPI.getProducts(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
    }
  }
)

export const fetchVendorOrders = createAsyncThunk(
  'vendor/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await vendorAPI.getOrders(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'vendor/updateOrderStatus',
  async ({ orderId, statusData }, { rejectWithValue }) => {
    try {
      const response = await vendorAPI.updateOrderStatus(orderId, statusData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status')
    }
  }
)

export const fetchVendorAnalytics = createAsyncThunk(
  'vendor/fetchAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await vendorAPI.getAnalytics(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics')
    }
  }
)

// Vendor slice
const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard
      .addCase(fetchVendorDashboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendorDashboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.dashboard = action.payload
        state.error = null
      })
      .addCase(fetchVendorDashboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch products
      .addCase(fetchVendorProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch orders
      .addCase(fetchVendorOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.orders.findIndex(order => order._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch analytics
      .addCase(fetchVendorAnalytics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendorAnalytics.fulfilled, (state, action) => {
        state.isLoading = false
        state.analytics = action.payload
        state.error = null
      })
      .addCase(fetchVendorAnalytics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  setPagination,
} = vendorSlice.actions

// Selectors
export const selectVendorDashboard = (state) => state.vendor.dashboard
export const selectVendorProducts = (state) => state.vendor.products
export const selectVendorOrders = (state) => state.vendor.orders
export const selectVendorAnalytics = (state) => state.vendor.analytics
export const selectVendorLoading = (state) => state.vendor.isLoading
export const selectVendorError = (state) => state.vendor.error
export const selectVendorPagination = (state) => state.vendor.pagination

export default vendorSlice.reducer







