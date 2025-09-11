/**
 * Banner Slice
 * Redux slice for managing banner state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import bannerAPI from '../../services/bannerAPI'

// Initial state
const initialState = {
  banners: [],
  adminBanners: [],
  isLoading: false,
  isAdminLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
}

// Async thunks
export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bannerAPI.getBanners()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banners')
    }
  }
)

export const fetchAllBanners = createAsyncThunk(
  'banners/fetchAllBanners',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bannerAPI.getAllBanners(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all banners')
    }
  }
)

export const createBanner = createAsyncThunk(
  'banners/createBanner',
  async (bannerData, { rejectWithValue }) => {
    try {
      const response = await bannerAPI.createBanner(bannerData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create banner')
    }
  }
)

export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async ({ id, bannerData }, { rejectWithValue }) => {
    try {
      const response = await bannerAPI.updateBanner(id, bannerData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update banner')
    }
  }
)

export const deleteBanner = createAsyncThunk(
  'banners/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      await bannerAPI.deleteBanner(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete banner')
    }
  }
)

export const toggleBannerStatus = createAsyncThunk(
  'banners/toggleBannerStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bannerAPI.toggleBannerStatus(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle banner status')
    }
  }
)

export const reorderBanners = createAsyncThunk(
  'banners/reorderBanners',
  async (bannerOrders, { rejectWithValue }) => {
    try {
      await bannerAPI.reorderBanners(bannerOrders)
      return bannerOrders
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder banners')
    }
  }
)

// Banner slice
const bannerSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearBannerError: (state) => {
      state.error = null
    },
    clearBanners: (state) => {
      state.banners = []
      state.adminBanners = []
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch banners
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false
        state.banners = action.payload.data
        state.error = null
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch all banners (admin)
      .addCase(fetchAllBanners.pending, (state) => {
        state.isAdminLoading = true
        state.error = null
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.isAdminLoading = false
        state.adminBanners = action.payload.data
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.pages,
          totalItems: action.payload.total,
          itemsPerPage: 10
        }
        state.error = null
      })
      .addCase(fetchAllBanners.rejected, (state, action) => {
        state.isAdminLoading = false
        state.error = action.payload
      })
      
      // Create banner
      .addCase(createBanner.pending, (state) => {
        state.isAdminLoading = true
        state.error = null
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.isAdminLoading = false
        state.adminBanners.unshift(action.payload.data)
        state.error = null
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isAdminLoading = false
        state.error = action.payload
      })
      
      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.isAdminLoading = true
        state.error = null
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isAdminLoading = false
        const index = state.adminBanners.findIndex(banner => banner._id === action.payload.data._id)
        if (index !== -1) {
          state.adminBanners[index] = action.payload.data
        }
        state.error = null
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isAdminLoading = false
        state.error = action.payload
      })
      
      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.isAdminLoading = true
        state.error = null
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.isAdminLoading = false
        state.adminBanners = state.adminBanners.filter(banner => banner._id !== action.payload)
        state.error = null
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.isAdminLoading = false
        state.error = action.payload
      })
      
      // Toggle banner status
      .addCase(toggleBannerStatus.pending, (state) => {
        state.isAdminLoading = true
        state.error = null
      })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        state.isAdminLoading = false
        const index = state.adminBanners.findIndex(banner => banner._id === action.payload.data._id)
        if (index !== -1) {
          state.adminBanners[index] = action.payload.data
        }
        state.error = null
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.isAdminLoading = false
        state.error = action.payload
      })
      
      // Reorder banners
      .addCase(reorderBanners.pending, (state) => {
        state.isAdminLoading = true
        state.error = null
      })
      .addCase(reorderBanners.fulfilled, (state, action) => {
        state.isAdminLoading = false
        // Update the order of banners based on the reorder data
        const reorderData = action.payload
        reorderData.forEach(({ id, order }) => {
          const banner = state.adminBanners.find(b => b._id === id)
          if (banner) {
            banner.order = order
          }
        })
        // Sort by order
        state.adminBanners.sort((a, b) => a.order - b.order)
        state.error = null
      })
      .addCase(reorderBanners.rejected, (state, action) => {
        state.isAdminLoading = false
        state.error = action.payload
      })
  }
})

export const { clearBannerError, clearBanners } = bannerSlice.actions
export default bannerSlice.reducer
