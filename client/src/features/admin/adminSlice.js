/**
 * Admin Slice
 * Redux slice for admin dashboard and management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminAPI from '../../services/adminAPI'

// Initial state
const initialState = {
  dashboard: {
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  },
  users: [],
  sellers: [],
  products: [],
  orders: [],
  analytics: {
    sales: [],
    users: [],
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
export const fetchDashboard = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getDashboard()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUser(userId, userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user')
    }
  }
)

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAnalytics(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics')
    }
  }
)

export const fetchSellers = createAsyncThunk(
  'admin/fetchSellers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getSellers(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sellers')
    }
  }
)

export const updateSellerStatus = createAsyncThunk(
  'admin/updateSellerStatus',
  async ({ sellerId, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateSellerStatus(sellerId, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update seller status')
    }
  }
)

export const deleteSeller = createAsyncThunk(
  'admin/deleteSeller',
  async (sellerId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteSeller(sellerId)
      return sellerId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete seller')
    }
  }
)

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
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
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.dashboard = action.payload
        state.error = null
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Fetch sellers
      .addCase(fetchSellers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSellers.fulfilled, (state, action) => {
        state.isLoading = false
        state.sellers = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchSellers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update seller status
      .addCase(updateSellerStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSellerStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.sellers.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.sellers[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateSellerStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete seller
      .addCase(deleteSeller.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteSeller.fulfilled, (state, action) => {
        state.isLoading = false
        state.sellers = state.sellers.filter(s => s._id !== action.payload)
        state.error = null
      })
      .addCase(deleteSeller.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.users.findIndex(user => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false
        state.analytics = action.payload
        state.error = null
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  setPagination,
} = adminSlice.actions

// Selectors
export const selectAdminDashboard = (state) => state.admin.dashboard
export const selectAdminUsers = (state) => state.admin.users
export const selectAdminSellers = (state) => state.admin.sellers
export const selectAdminAnalytics = (state) => state.admin.analytics
export const selectAdminLoading = (state) => state.admin.isLoading
export const selectAdminError = (state) => state.admin.error
export const selectAdminPagination = (state) => state.admin.pagination

export default adminSlice.reducer






