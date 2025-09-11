/**
 * Primary Button Component
 * Theme-aware button that adapts to delivery mode
 */

import React from 'react'

export default function PrimaryButton({ 
  children, 
  className = '', 
  disabled = false,
  type = 'button',
  ...rest 
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        bg-brand hover:bg-brand-hover 
        text-white 
        rounded-lg 
        px-4 py-2 
        font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  )
}


