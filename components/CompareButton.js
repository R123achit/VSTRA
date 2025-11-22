import { motion } from 'framer-motion'
import { useComparisonStore } from '../store/useComparisonStore'
import toast from 'react-hot-toast'

export default function CompareButton({ product, size = 'md' }) {
  const { addToComparison, removeFromComparison, isInComparison } = useComparisonStore()
  const inComparison = isInComparison(product._id)

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (inComparison) {
      removeFromComparison(product._id)
      toast.success('Removed from comparison')
    } else {
      const result = addToComparison(product)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
        inComparison
          ? 'bg-[#D4AF37] text-black shadow-lg'
          : 'bg-white/90 text-gray-700 hover:bg-[#D4AF37] hover:text-black'
      }`}
      title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    </motion.button>
  )
}
