/**
 * Theme Switch Tests
 * Tests for delivery mode theme switching functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import HomePage from '../pages/HomePage'
import DeliveryOptions from '../components/layout/DeliveryOptions'
import DeliveryThemeWrapper from '../utils/DeliveryThemeWrapper'
import productSlice from '../features/products/productSlice'
import authSlice from '../features/auth/authSlice'
import cartSlice from '../features/cart/cartSlice'
import homepageSectionSlice from '../features/homepageSections/homepageSectionSlice'
import bannerSlice from '../features/banners/bannerSlice'

// Mock store setup
const createTestStore = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      products: productSlice,
      auth: authSlice,
      cart: cartSlice,
      homepageSections: homepageSectionSlice,
      banners: bannerSlice,
    },
    preloadedState: initialState,
  })
  return store
}

// Test wrapper component
const TestWrapper = ({ children, store }) => {
  const persistor = persistStore(store)
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <DeliveryThemeWrapper>
            {children}
          </DeliveryThemeWrapper>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

describe('Theme Switch Functionality', () => {
  let store

  beforeEach(() => {
    // Reset document dataset
    document.documentElement.dataset.delivery = ''
    
    // Create fresh store for each test
    store = createTestStore({
      products: {
        currentDeliveryMode: 'standard',
        products: [],
        featuredProducts: [],
        isLoading: false,
        error: null
      },
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      },
      cart: {
        items: [],
        totalAmount: 0,
        totalQuantity: 0,
        isLoading: false,
        error: null
      },
      homepageSections: {
        sections: [],
        isLoading: false,
        error: null
      },
      banners: {
        banners: [],
        isLoading: false,
        error: null
      }
    })
  })

  afterEach(() => {
    // Clean up
    document.documentElement.dataset.delivery = ''
  })

  test('should apply standard theme by default', () => {
    render(
      <TestWrapper store={store}>
        <div data-testid="test-element">Test</div>
      </TestWrapper>
    )

    expect(document.documentElement.dataset.delivery).toBe('standard')
  })

  test('should switch to instant theme when instant delivery is selected', async () => {
    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Find and click the instant delivery button
    const instantButton = screen.getByText('Instant')
    fireEvent.click(instantButton)

    // Wait for the theme to be applied
    await waitFor(() => {
      expect(document.documentElement.dataset.delivery).toBe('instant')
    })
  })

  test('should switch to nextDay theme when next day delivery is selected', async () => {
    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Find and click the next day delivery button
    const nextDayButton = screen.getByText('Next-Day')
    fireEvent.click(nextDayButton)

    // Wait for the theme to be applied
    await waitFor(() => {
      expect(document.documentElement.dataset.delivery).toBe('nextDay')
    })
  })

  test('should switch back to standard theme when standard delivery is selected', async () => {
    // Start with instant theme
    store = createTestStore({
      products: {
        currentDeliveryMode: 'instant',
        products: [],
        featuredProducts: [],
        isLoading: false,
        error: null
      },
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      },
      cart: {
        items: [],
        totalAmount: 0,
        totalQuantity: 0,
        isLoading: false,
        error: null
      },
      homepageSections: {
        sections: [],
        isLoading: false,
        error: null
      },
      banners: {
        banners: [],
        isLoading: false,
        error: null
      }
    })

    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Verify initial state
    expect(document.documentElement.dataset.delivery).toBe('instant')

    // Find and click the standard delivery button
    const standardButton = screen.getByText('Standard')
    fireEvent.click(standardButton)

    // Wait for the theme to be applied
    await waitFor(() => {
      expect(document.documentElement.dataset.delivery).toBe('standard')
    })
  })

  test('should persist theme selection across component re-renders', async () => {
    const { rerender } = render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Switch to instant theme
    const instantButton = screen.getByText('Instant')
    fireEvent.click(instantButton)

    await waitFor(() => {
      expect(document.documentElement.dataset.delivery).toBe('instant')
    })

    // Re-render the component
    rerender(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Theme should still be instant
    expect(document.documentElement.dataset.delivery).toBe('instant')
  })

  test('should apply correct CSS custom properties for instant theme', async () => {
    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Switch to instant theme
    const instantButton = screen.getByText('Instant')
    fireEvent.click(instantButton)

    await waitFor(() => {
      expect(document.documentElement.dataset.delivery).toBe('instant')
    })

    // Check that CSS custom properties are applied
    const computedStyle = getComputedStyle(document.documentElement)
    expect(computedStyle.getPropertyValue('--brand')).toBe('rgb(22, 163, 74)') // #16a34a
    expect(computedStyle.getPropertyValue('--bg')).toBe('rgb(240, 253, 244)') // #f0fdf4
  })

  test('should apply correct CSS custom properties for nextDay theme', async () => {
    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Switch to next day theme
    const nextDayButton = screen.getByText('Next-Day')
    fireEvent.click(nextDayButton)

    await waitFor(() => {
      expect(document.documentElement.dataset.delivery).toBe('nextDay')
    })

    // Check that CSS custom properties are applied
    const computedStyle = getComputedStyle(document.documentElement)
    expect(computedStyle.getPropertyValue('--brand')).toBe('rgb(245, 158, 11)') // #f59e0b
    expect(computedStyle.getPropertyValue('--bg')).toBe('rgb(255, 251, 235)') // #fffbeb
  })

  test('should apply correct CSS custom properties for standard theme', () => {
    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    // Check that CSS custom properties are applied for standard theme
    const computedStyle = getComputedStyle(document.documentElement)
    expect(computedStyle.getPropertyValue('--brand')).toBe('rgb(37, 99, 235)') // #2563eb
    expect(computedStyle.getPropertyValue('--bg')).toBe('rgb(255, 255, 255)') // #ffffff
  })
})

describe('DeliveryOptions Component', () => {
  let store

  beforeEach(() => {
    store = createTestStore({
      products: {
        currentDeliveryMode: 'standard',
        products: [],
        featuredProducts: [],
        isLoading: false,
        error: null
      },
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      },
      cart: {
        items: [],
        totalAmount: 0,
        totalQuantity: 0,
        isLoading: false,
        error: null
      },
      homepageSections: {
        sections: [],
        isLoading: false,
        error: null
      },
      banners: {
        banners: [],
        isLoading: false,
        error: null
      }
    })
  })

  test('should render all three delivery options', () => {
    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    expect(screen.getByText('Instant')).toBeInTheDocument()
    expect(screen.getByText('Next-Day')).toBeInTheDocument()
    expect(screen.getByText('Standard')).toBeInTheDocument()
  })

  test('should highlight the active delivery option', () => {
    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    const standardButton = screen.getByText('Standard')
    expect(standardButton.closest('button')).toHaveClass('bg-green-100')
  })

  test('should show loading state when products are being fetched', () => {
    store = createTestStore({
      products: {
        currentDeliveryMode: 'standard',
        products: [],
        featuredProducts: [],
        isLoading: true,
        error: null
      },
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      },
      cart: {
        items: [],
        totalAmount: 0,
        totalQuantity: 0,
        isLoading: false,
        error: null
      },
      homepageSections: {
        sections: [],
        isLoading: false,
        error: null
      },
      banners: {
        banners: [],
        isLoading: false,
        error: null
      }
    })

    render(
      <TestWrapper store={store}>
        <DeliveryOptions />
      </TestWrapper>
    )

    expect(screen.getByText('Loading products...')).toBeInTheDocument()
  })
})


