/**
 * Redux Store Configuration
 * Centralized state management with Redux Toolkit and persistence
 */

import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import feature reducers
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'
import productReducer from '../features/products/productSlice'
import orderReducer from '../features/orders/orderSlice'
import userReducer from '../features/user/userSlice'
import adminReducer from '../features/admin/adminSlice'
import vendorReducer from '../features/vendor/vendorSlice'
import sellerReducer from '../features/seller/sellerSlice'
import homepageSectionReducer from '../features/homepageSections/homepageSectionSlice'
import bannerReducer from '../features/banners/bannerSlice'
import wishlistReducer from '../features/wishlist/wishlistSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'], // Only persist auth and cart
}

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productReducer,
  orders: orderReducer,
  user: userReducer,
  admin: adminReducer,
  vendor: vendorReducer,
  seller: sellerReducer,
  homepageSections: homepageSectionReducer,
  banners: bannerReducer,
  wishlist: wishlistReducer,
})

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Persistor
export const persistor = persistStore(store)
