/**
 * Dynamic Logo Component
 * Changes logo based on delivery mode
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentDeliveryMode } from '../../features/products/productSlice'
import standardLogo from '../../assets/logo-standard.svg'
import instantLogo from '../../assets/logo-instant.svg'
import nextDayLogo from '../../assets/logo-nextDay.svg'

export default function Logo({ className = '' }) {
  const mode = useSelector(selectCurrentDeliveryMode)
  
  const getLogoSrc = () => {
    switch (mode) {
      case 'instant':
        return instantLogo
      case 'nextDay':
        return nextDayLogo
      default:
        return standardLogo
    }
  }

  return (
    <img 
      src={getLogoSrc()} 
      alt="EcomMulti Logo" 
      className={`h-8 transition-all duration-300 ${className}`} 
    />
  )
}


