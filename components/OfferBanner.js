import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Gift, Zap, Tag, TrendingUp } from 'lucide-react'
import axios from 'axios'

export default function OfferBanner() {
  const [offers, setOffers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActiveOffers()
  }, [])

  useEffect(() => {
    // Notify navbar about offer banner visibility
    window.dispatchEvent(new CustomEvent('offersBarVisibility', { detail: { visible: isVisible && offers.length > 0 } }))
  }, [isVisible, offers.length])

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
      console.log('OfferBanner - Fetched offers:', data)
      setOffers(data.offers || [])
    } catch (error) {
      console.error('OfferBanner - Failed to fetch offers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOfferIcon = (type) => {
    switch (type) {
      case 'bogo':
      case 'buy_x_get_y':
        return <Gift className="w-5 h-5" />
      case 'percentage':
        return <Tag className="w-5 h-5" />
      case 'free_shipping':
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getOfferText = (offer) => {
    switch (offer.type) {
      case 'percentage':
        return `${offer.value}% OFF ${offer.code ? `- Use Code: ${offer.code}` : ''}`
      case 'fixed':
        return `₹${offer.value} OFF ${offer.code ? `- Use Code: ${offer.code}` : ''}`
      case 'bogo':
        return `BUY 1 GET 1 FREE ${offer.code ? `- Code: ${offer.code}` : ''}`
      case 'buy_x_get_y':
        return `BUY ${offer.buyQuantity} GET ${offer.getQuantity} FREE ${offer.code ? `- Code: ${offer.code}` : ''}`
      case 'free_shipping':
        return `FREE SHIPPING ${offer.minPurchaseAmount ? `on orders above ₹${offer.minPurchaseAmount}` : ''}`
      default:
        return offer.name
    }
  }

  if (isLoading || !offers.length || !isVisible) return null

  const currentOffer = offers[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] text-black shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {getOfferIcon(currentOffer.type)}
              </motion.div>
              
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <p className="font-bold text-sm md:text-base">
                  🎉 {getOfferText(currentOffer)}
                </p>
                <p className="text-xs opacity-90 hidden md:block">
                  {currentOffer.description} • Valid till {new Date(currentOffer.endDate).toLocaleDateString()}
                </p>
              </motion.div>
            </div>

            {offers.length > 1 && (
              <div className="flex gap-1 mx-4">
                {offers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-black w-6' : 'bg-black/30'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setIsVisible(false)
                window.dispatchEvent(new CustomEvent('offersBarVisibility', { detail: { visible: false } }))
              }}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Animated border */}
        <motion.div
          className="h-1 bg-black"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
