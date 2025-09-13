/**
 * Wishlist Button Component
 * Handles adding/removing products from wishlist
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Heart, Loader2 } from 'lucide-react'
import { addToWishlist, removeFromWishlist, checkWishlist } from '../../features/wishlist/wishlistSlice'
import { toast } from 'react-hot-toast'

const WishlistButton = ({ productId, className = '', size = 'sm' }) => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)

  // Check if product is in wishlist when component mounts
  useEffect(() => {
    if (user && productId) {
      setChecking(true)
      dispatch(checkWishlist(productId))
        .unwrap()
        .then((response) => {
          setIsInWishlist(response.data.isInWishlist)
        })
        .catch(() => {
          // Silently fail - user might not be logged in
        })
        .finally(() => {
          setChecking(false)
        })
    }
  }, [dispatch, user, productId])

  const handleToggleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Please log in to add items to wishlist')
      return
    }

    setLoading(true)
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap()
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await dispatch(addToWishlist(productId)).unwrap()
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error(error || 'Failed to update wishlist')
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (checking) {
    return (
      <button
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 ${className}`}
        disabled
      >
        <Loader2 className={`${iconSizeClasses[size]} animate-spin text-gray-400`} />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 ${className}`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <Loader2 className={`${iconSizeClasses[size]} animate-spin text-gray-400`} />
      ) : (
        <Heart 
          className={`${iconSizeClasses[size]} ${
            isInWishlist 
              ? 'text-red-500 fill-current' 
              : 'text-gray-400 hover:text-red-500'
          } transition-colors`} 
        />
      )}
    </button>
  )
}

export default WishlistButton
