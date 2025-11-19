import { motion } from 'framer-motion'
import { useWishlistStore, useAuthStore } from '../store/useStore'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function WishlistButton({ product, size = 'md', showLabel = false }) {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product._id)

  const handleToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      router.push('/auth/login')
      return
    }

    try {
      if (inWishlist) {
        await axios.delete(`/api/wishlist/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        removeFromWishlist(product._id)
        toast.success('Removed from wishlist')
      } else {
        await axios.post(
          '/api/wishlist',
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        addToWishlist(product)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Something went wrong')
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className={`${sizeClasses[size]} rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow ${
        showLabel ? 'px-4 w-auto gap-2' : ''
      }`}
    >
      <svg
        className={`${iconSizes[size]} transition-colors ${
          inWishlist ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-black'
        }`}
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span className="text-sm font-medium text-black">
          {inWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </motion.button>
  )
}
