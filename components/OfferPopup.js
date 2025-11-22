import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Sparkles, Copy, Check } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function OfferPopup() {
  const [offers, setOffers] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('offerPopupSeen')
    if (!hasSeenPopup) {
      fetchTopOffers()
    }
  }, [])

  const fetchTopOffers = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      const topOffers = (data.offers || []).slice(0, 3)
      if (topOffers.length > 0) {
        setOffers(topOffers)
        setTimeout(() => setIsVisible(true), 2000) // Show after 2 seconds
      }
    } catch (error) {
      console.error('Failed to fetch offers')
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('offerPopupSeen', 'true')
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Code copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getOfferValue = (offer) => {
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-br from-white via-[#FFF9E6] to-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative p-8">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="w-16 h-16 text-[#D4AF37]" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] bg-clip-text text-transparent">
                  Exclusive Offers Just For You!
                </h2>
                <p className="text-gray-600">Don't miss out on these amazing deals</p>
              </motion.div>

              {/* Offers */}
              <div className="space-y-4 mb-6">
                {offers.map((offer, index) => (
                  <motion.div
                    key={offer._id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-lg border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-[#D4AF37]">
                            {getOfferValue(offer)}
                          </span>
                          {offer.maxDiscount && (
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                              Max ₹{offer.maxDiscount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{offer.description}</p>
                        {offer.minPurchaseAmount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Min purchase: ₹{offer.minPurchaseAmount}
                          </p>
                        )}
                      </div>
                    </div>

                    {offer.code && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 bg-gradient-to-r from-[#D4AF37]/10 to-[#F4D03F]/10 border-2 border-dashed border-[#D4AF37] rounded-lg px-4 py-2">
                          <p className="text-xs text-gray-600 mb-1">Use Code:</p>
                          <p className="font-mono font-bold text-lg">{offer.code}</p>
                        </div>
                        <button
                          onClick={() => copyCode(offer.code)}
                          className="p-3 bg-[#D4AF37] hover:bg-[#B8941F] text-white rounded-lg transition-all"
                        >
                          {copiedCode === offer.code ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2 text-right">
                      Valid till {new Date(offer.endDate).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Shopping Now! 🛍️
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
