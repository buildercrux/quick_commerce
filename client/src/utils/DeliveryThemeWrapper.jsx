/**
 * Delivery Theme Wrapper Component
 * Applies delivery mode theme to the document root
 */

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentDeliveryMode } from '../features/products/productSlice'

export default function DeliveryThemeWrapper({ children }) {
  const mode = useSelector(selectCurrentDeliveryMode) // instant | nextDay | standard

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.delivery = mode
    }
  }, [mode])

  return children
}


