import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('newsletterPopupSeen')
    const hasSubscribed = localStorage.getItem('newsletterSubscribed')

    if (!hasSeenPopup && !hasSubscribed) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('newsletterPopupSeen', 'true')
      }, 10000) // Show after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/newsletter/subscribe', { email })
      toast.success('🎉 Welcome! Check your email for exclusive offers')
      localStorage.setItem('newsletterSubscribed', 'true')
      setIsOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('newsletterPopupDismissed', Date.now().toString())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-gray-400 hover:text-black transition-colors bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Section */}
            <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />
              <div className="relative z-10 text-center text-white">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl sm:text-5xl md:text-6xl mb-1 sm:mb-2"
                >
                  🎁
                </motion.div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Get 15% OFF</h2>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-center">Join Our VIP Club</h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
                Subscribe to get exclusive deals, early access to sales, and style tips!
              </p>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : 'Get My 15% OFF'}
                </motion.button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4">
                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
