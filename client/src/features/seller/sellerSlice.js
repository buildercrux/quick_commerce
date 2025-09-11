/**
 * Seller Slice
 * Redux slice for seller-specific state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import sellerAPI from '../../services/sellerAPI'

// Initial state
const initialState = {
  seller: null,
  products: [],
  dashboardStats: null,
  orders: [],
  loading: false,
  error: null,
}

// Async thunks
export const getSellerProfile = createAsyncThunk(
  'seller/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.getProfile()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller profile')
    }
  }
)

export const updateSellerProfile = createAsyncThunk(
  'seller/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.updateProfile(profileData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const getSellerDashboardStats = createAsyncThunk(
  'seller/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.getDashboardStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  }
)

export const getSellerProducts = createAsyncThunk(
  'seller/getProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.getProducts(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
    }
  }
)

export const createProduct = createAsyncThunk(
  'seller/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.createProduct(productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product')
    }
  }
)

export const updateProduct = createAsyncThunk(
  'seller/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.updateProduct(productId, productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product')
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'seller/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await sellerAPI.deleteProduct(productId)
      return productId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product')
    }
  }
)

export const getSellerOrders = createAsyncThunk(
  'seller/getOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.getOrders(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const getProductAnalytics = createAsyncThunk(
  'seller/getProductAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sellerAPI.getProductAnalytics()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics')
    }
  }
)

// Slice
const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSeller: (state) => {
      state.seller = null
      state.products = []
      state.dashboardStats = null
      state.orders = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Get seller profile
      .addCase(getSellerProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSellerProfile.fulfilled, (state, action) => {
        state.loading = false
        state.seller = action.payload
      })
      .addCase(getSellerProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update seller profile
      .addCase(updateSellerProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSellerProfile.fulfilled, (state, action) => {
        state.loading = false
        state.seller = action.payload
      })
      .addCase(updateSellerProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get dashboard stats
      .addCase(getSellerDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSellerDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardStats = action.payload
      })
      .addCase(getSellerDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get seller products
      .addCase(getSellerProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSellerProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(getSellerProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.products.unshift(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
        const index = state.products.findIndex(product => product._id === action.payload._id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false
        state.products = state.products.filter(product => product._id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get seller orders
      .addCase(getSellerOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSellerOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(getSellerOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get product analytics
      .addCase(getProductAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.analytics = action.payload
      })
      .addCase(getProductAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearSeller } = sellerSlice.actions
export default sellerSlice.reducer
