/**
 * Loading Spinner Component - Modern Design with Tailwind CSS
 * Reusable loading spinner with different sizes and styles
 */

import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  text = 'Loading...',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const variantClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    purple: 'border-purple-600',
    green: 'border-green-600',
  }

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  }

  if (fullScreen) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={containerVariants}
        className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      >
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            variants={spinnerVariants}
            animate="animate"
            className={`${sizeClasses[size]} border-4 border-gray-200 border-t-${variantClasses[variant].split('-')[1]}-600 rounded-full`}
          />
          
          {/* Inner pulse */}
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className={`absolute inset-2 border-2 border-${variantClasses[variant].split('-')[1]}-300 rounded-full`}
          />
        </div>
        
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 font-medium"
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-${variantClasses[variant].split('-')[1]}-600 rounded-full`}
        />
        
        {/* Inner pulse */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className={`absolute inset-2 border-2 border-${variantClasses[variant].split('-')[1]}-300 rounded-full`}
        />
      </div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-sm text-gray-600 font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )
}

export default LoadingSpinner




