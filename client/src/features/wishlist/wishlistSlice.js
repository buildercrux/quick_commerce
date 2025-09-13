/**
 * Wishlist Redux Slice
 * Manages wishlist state and actions
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import wishlistAPI from '../../services/wishlistAPI'

// Async thunks
export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlist()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch wishlist')
    }
  }
)

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.addToWishlist(productId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add to wishlist')
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(productId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove from wishlist')
    }
  }
)

export const checkWishlist = createAsyncThunk(
  'wishlist/checkWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.checkWishlist(productId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to check wishlist')
    }
  }
)

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.clearWishlist()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear wishlist')
    }
  }
)

const initialState = {
  products: [],
  loading: false,
  error: null,
  wishlistCount: 0
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateWishlistCount: (state, action) => {
      state.wishlistCount = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get wishlist
      .addCase(getWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.data || []
        state.wishlistCount = action.payload.count || 0
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.wishlistCount = action.payload.data.wishlistCount
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.wishlistCount = action.payload.data.wishlistCount
        // Remove product from local state if it exists
        state.products = state.products.filter(
          product => product._id !== action.payload.data.productId
        )
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Check wishlist
      .addCase(checkWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkWishlist.fulfilled, (state, action) => {
        state.loading = false
        // This is handled by individual components
      })
      .addCase(checkWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.products = []
        state.wishlistCount = 0
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, updateWishlistCount } = wishlistSlice.actions
export default wishlistSlice.reducer
