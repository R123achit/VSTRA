import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

export default function FloatingOfferNotification() {
  const [offer, setOffer] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    fetchTopOffer()
    
    const handleScroll = () => {
      if (!hasShown && window.scrollY > 800) {
        setIsVisible(true)
        setHasShown(true)
        
        // Auto hide after 10 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 10000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasShown])

  const fetchTopOffer = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      if (data.offers && data.offers.length > 0) {
        setOffer(data.offers[0])
      }
    } catch (error) {
      console.error('Failed to fetch offer')
    }
  }

  if (!offer) return null

  const getOfferText = () => {
    switch (offer.type) {
      case 'percentage':
        return `${offer.value}% OFF`
      case 'fixed':
        return `₹${offer.value} OFF`
      case 'bogo':
        return 'BOGO'
      case 'buy_x_get_y':
        return `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`
      case 'free_shipping':
        return 'FREE SHIPPING'
      default:
        return 'SPECIAL OFFER'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-8 right-8 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            {/* Animated background */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"
            />

            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 p-1 bg-black/20 hover:bg-black/30 rounded-full transition-all"
            >
              <X className="w-4 h-4 text-black" />
            </button>

            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="inline-block mb-3"
              >
                <Sparkles className="w-8 h-8 text-black" />
              </motion.div>

              <h3 className="text-2xl font-black text-black mb-2">
                {getOfferText()}
              </h3>
              
              <p className="text-black/80 text-sm mb-4 font-semibold">
                {offer.description}
              </p>

              {offer.code && (
                <div className="bg-black text-[#D4AF37] px-4 py-2 rounded-lg mb-4 inline-block">
                  <p className="text-xs mb-1">Use Code:</p>
                  <p className="font-mono font-bold text-lg">{offer.code}</p>
                </div>
              )}

              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-black text-[#D4AF37] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Shop Now →
                </motion.button>
              </Link>

              <p className="text-xs text-black/60 mt-3 text-center">
                Valid till {new Date(offer.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
