import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Gift, Sparkles } from 'lucide-react'
import axios from 'axios'

export default function StickyOfferSidebar() {
  const [offers, setOffers] = useState([])
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchActiveOffers()
  }, [])

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % offers.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [offers.length])

  const fetchActiveOffers = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      setOffers(data.offers || [])
    } catch (error) {
      console.error('Failed to fetch offers')
    }
  }

  if (!offers.length || !isVisible) return null

  const currentOffer = offers[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 max-w-xs"
      >
        <div className="relative">
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -left-8 top-4 bg-white rounded-l-lg p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Main card */}
          <motion.div
            key={currentIndex}
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#FFD700] rounded-l-3xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 10,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"
            />

            <div className="relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="mb-4"
              >
                <Gift className="w-12 h-12 text-black" />
              </motion.div>

              <h3 className="text-3xl font-black text-black mb-2">
                {currentOffer.type === 'percentage' && `${currentOffer.value}% OFF`}
                {currentOffer.type === 'fixed' && `₹${currentOffer.value} OFF`}
                {currentOffer.type === 'bogo' && 'BOGO'}
                {currentOffer.type === 'buy_x_get_y' && `Buy ${currentOffer.buyQuantity} Get ${currentOffer.getQuantity}`}
              </h3>

              <p className="text-sm text-black/80 mb-4 font-semibold">
                {currentOffer.description}
              </p>

              {currentOffer.code && (
                <div className="bg-black text-[#D4AF37] px-4 py-3 rounded-xl mb-4">
                  <p className="text-xs mb-1">Code:</p>
                  <p className="text-lg font-mono font-bold">{currentOffer.code}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-black/60">
                <Sparkles className="w-3 h-3" />
                <span>Valid till {new Date(currentOffer.endDate).toLocaleDateString()}</span>
              </div>

              {/* Indicator dots */}
              {offers.length > 1 && (
                <div className="flex gap-1 mt-4 justify-center">
                  {offers.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex ? 'bg-black w-6' : 'bg-black/30 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
