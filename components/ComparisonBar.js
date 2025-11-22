import { motion, AnimatePresence } from 'framer-motion'
import { useComparisonStore } from '../store/useComparisonStore'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ComparisonBar() {
  const router = useRouter()
  const { items, removeFromComparison, clearComparison } = useComparisonStore()

  if (items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A1628] text-white shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="font-semibold">Compare Products ({items.length}/4)</span>
            </div>

            <div className="flex items-center gap-4 flex-1 overflow-x-auto">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative flex-shrink-0"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <button
                    onClick={() => removeFromComparison(item._id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/compare">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941E] transition-all"
                >
                  Compare Now
                </motion.button>
              </Link>
              <button
                onClick={clearComparison}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
