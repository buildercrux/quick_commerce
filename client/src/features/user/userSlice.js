/**
 * User Slice
 * Redux slice for user profile and preferences management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userAPI from '../../services/userAPI'

// Initial state
const initialState = {
  profile: null,
  shippingAddresses: [],
  preferences: {
    newsletter: true,
    notifications: {
      email: true,
      sms: false,
    },
  },
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const fetchShippingAddresses = createAsyncThunk(
  'user/fetchShippingAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getShippingAddresses()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses')
    }
  }
)

export const addShippingAddress = createAsyncThunk(
  'user/addShippingAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await userAPI.addShippingAddress(addressData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address')
    }
  }
)

export const updateShippingAddress = createAsyncThunk(
  'user/updateShippingAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateShippingAddress(addressId, addressData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address')
    }
  }
)

export const deleteShippingAddress = createAsyncThunk(
  'user/deleteShippingAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      await userAPI.deleteShippingAddress(addressId)
      return addressId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address')
    }
  }
)

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userAPI.updatePreferences(preferences)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences')
    }
  }
)

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setDefaultAddress: (state, action) => {
      const addressId = action.payload
      state.shippingAddresses.forEach(address => {
        address.isDefault = address._id === addressId
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload.user
        state.shippingAddresses = action.payload.user.shippingAddresses || []
        state.preferences = action.payload.user.preferences || state.preferences
        state.error = null
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload.user
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch shipping addresses
      .addCase(fetchShippingAddresses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchShippingAddresses.fulfilled, (state, action) => {
        state.isLoading = false
        state.shippingAddresses = action.payload
        state.error = null
      })
      .addCase(fetchShippingAddresses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Add shipping address
      .addCase(addShippingAddress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addShippingAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.shippingAddresses.push(action.payload)
        state.error = null
      })
      .addCase(addShippingAddress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update shipping address
      .addCase(updateShippingAddress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.shippingAddresses.findIndex(
          address => address._id === action.payload._id
        )
        if (index !== -1) {
          state.shippingAddresses[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateShippingAddress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete shipping address
      .addCase(deleteShippingAddress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteShippingAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.shippingAddresses = state.shippingAddresses.filter(
          address => address._id !== action.payload
        )
        state.error = null
      })
      .addCase(deleteShippingAddress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update preferences
      .addCase(updatePreferences.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.isLoading = false
        state.preferences = action.payload.preferences
        state.error = null
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  setDefaultAddress,
} = userSlice.actions

// Selectors
export const selectUserProfile = (state) => state.user.profile
export const selectShippingAddresses = (state) => state.user.shippingAddresses
export const selectDefaultAddress = (state) => 
  state.user.shippingAddresses.find(address => address.isDefault)
export const selectUserPreferences = (state) => state.user.preferences
export const selectUserLoading = (state) => state.user.isLoading
export const selectUserError = (state) => state.user.error

export default userSlice.reducer
















