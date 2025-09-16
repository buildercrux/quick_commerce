/**
 * Cart Slice
 * Redux slice for shopping cart state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productAPI from '../../services/productAPI.js'
import cartAPI from '../../services/cartAPI.js'

// Server cart thunks
export const fetchServerCart = createAsyncThunk(
  'cart/fetchServerCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartAPI.getMyCart()
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch server cart')
    }
  }
)

export const replaceServerCart = createAsyncThunk(
  'cart/replaceServerCart',
  async (items, { rejectWithValue }) => {
    try {
      const payload = items.map(i => ({ product: i.product._id || i.product, quantity: i.quantity }))
      const res = await cartAPI.replaceMyCart(payload)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to replace server cart')
    }
  }
)

export const addItemServer = createAsyncThunk(
  'cart/addItemServer',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await cartAPI.addItem(productId, quantity)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to server cart')
    }
  }
)

export const updateItemServer = createAsyncThunk(
  'cart/updateItemServer',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartAPI.updateItem(productId, quantity)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update server cart item')
    }
  }
)

export const clearServerCart = createAsyncThunk(
  'cart/clearServerCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartAPI.clear()
      return true
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear server cart')
    }
  }
)

// Smart thunks: route to server when authenticated, otherwise local reducers
export const addToCartSmart = (payload) => async (dispatch, getState) => {
  const { auth } = getState()
  const { product, quantity = 1 } = payload
  if (auth?.isAuthenticated) {
    try {
      await dispatch(addItemServer({ productId: product._id, quantity }))
    } catch {
      // Fallback to local if server fails
      dispatch(addToCart({ product, quantity }))
    }
  } else {
    dispatch(addToCart({ product, quantity }))
  }
}

export const updateQuantitySmart = ({ productId, quantity }) => async (dispatch, getState) => {
  const { auth } = getState()
  if (auth?.isAuthenticated) {
    try {
      await dispatch(updateItemServer({ productId, quantity }))
    } catch {
      dispatch(updateQuantity({ productId, quantity }))
    }
  } else {
    dispatch(updateQuantity({ productId, quantity }))
  }
}

export const removeFromCartSmart = (productId) => async (dispatch, getState) => {
  const { auth } = getState()
  if (auth?.isAuthenticated) {
    try {
      await dispatch(updateItemServer({ productId, quantity: 0 }))
    } catch {
      dispatch(removeFromCart(productId))
    }
  } else {
    dispatch(removeFromCart(productId))
  }
}

export const clearCartSmart = () => async (dispatch, getState) => {
  const { auth } = getState()
  if (auth?.isAuthenticated) {
    try {
      await dispatch(clearServerCart())
    } catch {
      dispatch(clearCart())
    }
  } else {
    dispatch(clearCart())
  }
}

// Helper functions
const saveCartToStorage = (cartItems) => {
  localStorage.setItem('cartItems', JSON.stringify(cartItems))
}

const loadCartFromStorage = () => {
  try {
    const cartItems = localStorage.getItem('cartItems')
    return cartItems ? JSON.parse(cartItems) : []
  } catch (error) {
    console.error('Error loading cart from storage:', error)
    return []
  }
}

// Async thunk to fetch fresh product data for cart items
export const refreshCartProducts = createAsyncThunk(
  'cart/refreshCartProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const cartItems = state.cart.items
      
      if (cartItems.length === 0) {
        return []
      }
      
      // Extract product IDs from cart items
      const productIds = cartItems.map(item => item.product._id)
      
      console.log('🔄 Fetching fresh product data for cart items:', productIds)
      
      // Fetch fresh product data from backend
      const response = await productAPI.getProductsByIds(productIds)
      
      // Backend returns shape: { success, data: [...] }
      const products = response?.data?.data ?? []
      
      // eslint-disable-next-line no-console
      console.log('✅ Fresh product data received (normalized):', products)
      
      return products
    } catch (error) {
      console.error('❌ Error fetching fresh product data:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product data')
    }
  }
)

// Initial state
const initialState = {
  items: loadCartFromStorage(),
  isLoading: false,
  error: null,
}

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload
      const existingItem = state.items.find(item => item.product._id === product._id)
      
      // Check inventory availability
      const availableStock = product.inventory?.quantity || 0
      const trackQuantity = product.inventory?.trackQuantity !== false
      
      if (trackQuantity && availableStock <= 0) {
        state.error = `Sorry, "${product.name}" is currently out of stock`
        return
      }
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        
        // Validate against available stock
        if (trackQuantity && newQuantity > availableStock) {
          const maxAllowed = availableStock - existingItem.quantity
          if (maxAllowed <= 0) {
            state.error = `Sorry, only ${availableStock} units of "${product.name}" are available`
            return
          }
          existingItem.quantity = availableStock
          state.error = `Only ${availableStock} units of "${product.name}" are available. Quantity adjusted.`
        } else {
          existingItem.quantity = newQuantity
        }
      } else {
        // For new items, check if requested quantity exceeds available stock
        const finalQuantity = trackQuantity && quantity > availableStock ? availableStock : quantity
        
        if (trackQuantity && quantity > availableStock) {
          state.error = `Only ${availableStock} units of "${product.name}" are available. Quantity adjusted.`
        }
        
        state.items.push({
          product,
          quantity: finalQuantity,
          addedAt: new Date().toISOString(),
        })
      }
      
      saveCartToStorage(state.items)
    },
    
    removeFromCart: (state, action) => {
      const productId = action.payload
      state.items = state.items.filter(item => item.product._id !== productId)
      saveCartToStorage(state.items)
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload
      const item = state.items.find(item => item.product._id === productId)
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.product._id !== productId)
        } else {
          // Check inventory availability before updating quantity
          const availableStock = item.product.inventory?.quantity || 0
          const trackQuantity = item.product.inventory?.trackQuantity !== false
          
          if (trackQuantity && quantity > availableStock) {
            // Set quantity to maximum available stock
            item.quantity = availableStock
            state.error = `Only ${availableStock} units of "${item.product.name}" are available. Quantity adjusted.`
          } else {
            item.quantity = quantity
          }
        }
        saveCartToStorage(state.items)
      }
    },
    
    clearCart: (state) => {
      state.items = []
      saveCartToStorage(state.items)
    },
    
    setCartItems: (state, action) => {
      state.items = action.payload
      saveCartToStorage(state.items)
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    validateCartInventory: (state, action) => {
      // This action can be called to re-validate all cart items against current inventory
      const updatedProducts = action.payload || []
      
      state.items = state.items.map(item => {
        const updatedProduct = updatedProducts.find(p => p._id === item.product._id)
        if (updatedProduct) {
          const availableStock = updatedProduct.inventory?.quantity || 0
          const trackQuantity = updatedProduct.inventory?.trackQuantity !== false
          
          if (trackQuantity && item.quantity > availableStock) {
            item.quantity = Math.max(0, availableStock)
            state.error = `Inventory updated for "${item.product.name}". Quantity adjusted to available stock.`
          }
          
          // Update the product data with latest inventory info
          item.product = updatedProduct
        }
        return item
      }).filter(item => item.quantity > 0) // Remove items with zero quantity
      
      saveCartToStorage(state.items)
    },
    
    refreshCartItems: (state, action) => {
      // Replace cart items with fresh product data from backend
      const freshProducts = action.payload || []
      
      state.items = state.items.map(cartItem => {
        const freshProduct = freshProducts.find(p => p._id === cartItem.product._id)
        if (freshProduct) {
          return {
            ...cartItem,
            product: freshProduct // Replace with complete product data from backend
          }
        }
        return cartItem
      })
      
      saveCartToStorage(state.items)
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync with server: fetch my cart
      .addCase(fetchServerCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchServerCart.fulfilled, (state, action) => {
        state.isLoading = false
        const serverItems = (action.payload?.items || []).map(ci => ({
          product: ci.product,
          quantity: ci.quantity,
          addedAt: ci.addedAt || new Date().toISOString(),
        }))
        state.items = serverItems
        saveCartToStorage(state.items)
      })
      .addCase(fetchServerCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Sync: replace server cart
      .addCase(replaceServerCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(replaceServerCart.fulfilled, (state, action) => {
        state.isLoading = false
        const serverItems = (action.payload?.items || []).map(ci => ({
          product: ci.product,
          quantity: ci.quantity,
          addedAt: ci.addedAt || new Date().toISOString(),
        }))
        state.items = serverItems
        saveCartToStorage(state.items)
      })
      .addCase(replaceServerCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Sync: add item to server
      .addCase(addItemServer.fulfilled, (state, action) => {
        const serverItems = (action.payload?.items || []).map(ci => ({
          product: ci.product,
          quantity: ci.quantity,
          addedAt: ci.addedAt || new Date().toISOString(),
        }))
        state.items = serverItems
        saveCartToStorage(state.items)
      })
      .addCase(updateItemServer.fulfilled, (state, action) => {
        const serverItems = (action.payload?.items || []).map(ci => ({
          product: ci.product,
          quantity: ci.quantity,
          addedAt: ci.addedAt || new Date().toISOString(),
        }))
        state.items = serverItems
        saveCartToStorage(state.items)
      })
      .addCase(clearServerCart.fulfilled, (state) => {
        state.items = []
        saveCartToStorage(state.items)
      })
      .addCase(refreshCartProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(refreshCartProducts.fulfilled, (state, action) => {
        state.isLoading = false
        const freshProducts = action.payload
        
        // Update cart items with fresh product data
        state.items = state.items.map(cartItem => {
          const freshProduct = freshProducts.find(p => p._id === cartItem.product._id)
          if (freshProduct) {
            console.log('🔄 Updating cart item with fresh data:', {
              productName: freshProduct.name,
              oldInventory: cartItem.product.inventory,
              newInventory: freshProduct.inventory
            })
            return {
              ...cartItem,
              product: freshProduct // Replace with complete fresh product data
            }
          }
          return cartItem
        })
        
        saveCartToStorage(state.items)
      })
      .addCase(refreshCartProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartItems,
  setLoading,
  setError,
  clearError,
  validateCartInventory,
  refreshCartItems,
} = cartSlice.actions

// Selectors
export const selectCartItems = (state) => state.cart.items
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0)
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
export const selectCartSubtotal = (state) => selectCartTotal(state)
export const selectCartTax = (state) => selectCartSubtotal(state) * 0.085 // 8.5% tax
export const selectCartShipping = (state) => 
  selectCartSubtotal(state) > 50 ? 0 : 9.99
export const selectCartGrandTotal = (state) => 
  selectCartSubtotal(state) + selectCartTax(state) + selectCartShipping(state)
export const selectIsCartEmpty = (state) => state.cart.items.length === 0
export const selectCartLoading = (state) => state.cart.isLoading
export const selectCartError = (state) => state.cart.error

// Helper selectors
export const selectCartItemById = (productId) => (state) =>
  state.cart.items.find(item => item.product._id === productId)

export const selectCartItemQuantity = (productId) => (state) => {
  const item = selectCartItemById(productId)(state)
  return item ? item.quantity : 0
}

export const selectIsInCart = (productId) => (state) =>
  state.cart.items.some(item => item.product._id === productId)

// Inventory validation selectors
export const selectCartItemStockStatus = (productId) => (state) => {
  const item = selectCartItemById(productId)(state)
  if (!item) return null
  
  const availableStock = item.product.inventory?.quantity || 0
  const trackQuantity = item.product.inventory?.trackQuantity !== false
  const isOutOfStock = trackQuantity && availableStock <= 0
  const isLowStock = trackQuantity && availableStock <= (item.product.inventory?.lowStockThreshold || 10)
  const canAddMore = !trackQuantity || item.quantity < availableStock
  
  return {
    availableStock,
    trackQuantity,
    isOutOfStock,
    isLowStock,
    canAddMore,
    maxQuantity: trackQuantity ? availableStock : Infinity
  }
}

export const selectCartItemsWithStockStatus = (state) => 
  state.cart.items.map(item => ({
    ...item,
    stockStatus: selectCartItemStockStatus(item.product._id)(state)
  }))

export default cartSlice.reducer






