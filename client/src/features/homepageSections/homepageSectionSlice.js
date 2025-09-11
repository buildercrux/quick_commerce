/**
 * Homepage Section Slice
 * Redux slice for homepage section state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import homepageSectionAPI from '../../services/homepageSectionAPI'

// Initial state
const initialState = {
  sections: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  }
}

// Async thunks
export const fetchHomepageSections = createAsyncThunk(
  'homepageSections/fetchHomepageSections',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await homepageSectionAPI.getHomepageSections(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch homepage sections')
    }
  }
)

export const fetchAllHomepageSections = createAsyncThunk(
  'homepageSections/fetchAllHomepageSections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await homepageSectionAPI.getAllHomepageSections()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all homepage sections')
    }
  }
)

export const createHomepageSection = createAsyncThunk(
  'homepageSections/createHomepageSection',
  async (sectionData, { rejectWithValue }) => {
    try {
      const response = await homepageSectionAPI.createHomepageSection(sectionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create homepage section')
    }
  }
)

export const updateHomepageSection = createAsyncThunk(
  'homepageSections/updateHomepageSection',
  async ({ sectionId, sectionData }, { rejectWithValue }) => {
    try {
      const response = await homepageSectionAPI.updateHomepageSection(sectionId, sectionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update homepage section')
    }
  }
)

export const deleteHomepageSection = createAsyncThunk(
  'homepageSections/deleteHomepageSection',
  async (sectionId, { rejectWithValue }) => {
    try {
      await homepageSectionAPI.deleteHomepageSection(sectionId)
      return sectionId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete homepage section')
    }
  }
)

export const addProductToSection = createAsyncThunk(
  'homepageSections/addProductToSection',
  async ({ sectionId, productId }, { rejectWithValue }) => {
    try {
      const response = await homepageSectionAPI.addProductToSection(sectionId, productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product to section')
    }
  }
)

export const removeProductFromSection = createAsyncThunk(
  'homepageSections/removeProductFromSection',
  async ({ sectionId, productId }, { rejectWithValue }) => {
    try {
      await homepageSectionAPI.removeProductFromSection(sectionId, productId)
      return { sectionId, productId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove product from section')
    }
  }
)

export const reorderProductsInSection = createAsyncThunk(
  'homepageSections/reorderProductsInSection',
  async ({ sectionId, productIds }, { rejectWithValue }) => {
    try {
      const response = await homepageSectionAPI.reorderProductsInSection(sectionId, productIds)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder products')
    }
  }
)

export const reorderSections = createAsyncThunk(
  'homepageSections/reorderSections',
  async (sectionOrders, { rejectWithValue }) => {
    try {
      const response = await homepageSectionAPI.reorderSections(sectionOrders)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder sections')
    }
  }
)

// Slice
const homepageSectionSlice = createSlice({
  name: 'homepageSections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSections: (state) => {
      state.sections = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch homepage sections
      .addCase(fetchHomepageSections.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchHomepageSections.fulfilled, (state, action) => {
        state.isLoading = false
        state.sections = action.payload.data
        state.error = null
      })
      .addCase(fetchHomepageSections.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch all homepage sections (admin)
      .addCase(fetchAllHomepageSections.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllHomepageSections.fulfilled, (state, action) => {
        state.isLoading = false
        state.sections = action.payload.data
        state.error = null
      })
      .addCase(fetchAllHomepageSections.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create homepage section
      .addCase(createHomepageSection.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createHomepageSection.fulfilled, (state, action) => {
        state.isLoading = false
        state.sections.push(action.payload.data)
        state.error = null
      })
      .addCase(createHomepageSection.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update homepage section
      .addCase(updateHomepageSection.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateHomepageSection.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.sections.findIndex(section => section._id === action.payload.data._id)
        if (index !== -1) {
          state.sections[index] = action.payload.data
        }
        state.error = null
      })
      .addCase(updateHomepageSection.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete homepage section
      .addCase(deleteHomepageSection.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteHomepageSection.fulfilled, (state, action) => {
        state.isLoading = false
        state.sections = state.sections.filter(section => section._id !== action.payload)
        state.error = null
      })
      .addCase(deleteHomepageSection.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Add product to section
      .addCase(addProductToSection.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addProductToSection.fulfilled, (state, action) => {
        state.isLoading = false
        const section = state.sections.find(s => s._id === action.payload.data._id)
        if (section) {
          section.products = action.payload.data.products
        }
        state.error = null
      })
      .addCase(addProductToSection.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Remove product from section
      .addCase(removeProductFromSection.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeProductFromSection.fulfilled, (state, action) => {
        state.isLoading = false
        const section = state.sections.find(s => s._id === action.payload.sectionId)
        if (section) {
          section.products = section.products.filter(p => p._id !== action.payload.productId)
        }
        state.error = null
      })
      .addCase(removeProductFromSection.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reorder products in section
      .addCase(reorderProductsInSection.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(reorderProductsInSection.fulfilled, (state, action) => {
        state.isLoading = false
        const section = state.sections.find(s => s._id === action.payload.data._id)
        if (section) {
          section.products = action.payload.data.products
        }
        state.error = null
      })
      .addCase(reorderProductsInSection.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reorder sections
      .addCase(reorderSections.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(reorderSections.fulfilled, (state, action) => {
        state.isLoading = false
        state.sections = action.payload.data
        state.error = null
      })
      .addCase(reorderSections.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearSections } = homepageSectionSlice.actions
export default homepageSectionSlice.reducer