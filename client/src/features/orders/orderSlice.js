/**
 * Order Slice
 * Redux slice for order state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import orderAPI from '../../services/orderAPI'

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
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
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder(orderData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order')
    }
  }
)

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrders(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrder(orderId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order')
    }
  }
)

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(orderId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order')
    }
  }
)

export const requestReturn = createAsyncThunk(
  'orders/requestReturn',
  async ({ orderId, returnData }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.requestReturn(orderId, returnData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request return')
    }
  }
)

// Order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders.unshift(action.payload.data)
        state.error = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch single order
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload.data
        state.error = null
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.orders.findIndex(order => order._id === action.payload.data._id)
        if (index !== -1) {
          state.orders[index] = action.payload.data
        }
        if (state.currentOrder && state.currentOrder._id === action.payload.data._id) {
          state.currentOrder = action.payload.data
        }
        state.error = null
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Request return
      .addCase(requestReturn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestReturn.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.currentOrder && state.currentOrder._id === action.payload.orderId) {
          state.currentOrder.returnInfo.returnRequests.push(action.payload.data)
        }
        state.error = null
      })
      .addCase(requestReturn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  clearCurrentOrder,
  setPagination,
} = orderSlice.actions

// Selectors
export const selectOrders = (state) => state.orders.orders
export const selectCurrentOrder = (state) => state.orders.currentOrder
export const selectOrderLoading = (state) => state.orders.isLoading
export const selectOrderError = (state) => state.orders.error
export const selectOrderPagination = (state) => state.orders.pagination

export default orderSlice.reducer








