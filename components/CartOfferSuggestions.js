import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Gift, TrendingUp, Tag, Copy, Check } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CartOfferSuggestions({ cartTotal, onApplyCode }) {
  const [offers, setOffers] = useState([])
  const [copiedCode, setCopiedCode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApplicableOffers()
  }, [cartTotal])

  const fetchApplicableOffers = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      // Filter offers applicable to current cart
      const applicable = (data.offers || []).filter(offer => {
        if (offer.minPurchaseAmount && cartTotal < offer.minPurchaseAmount) {
          return false
        }
        return true
      })
      setOffers(applicable.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch offers')
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Code copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const applyOffer = (code) => {
    if (onApplyCode) {
      onApplyCode(code)
    }
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

  const getIcon = (type) => {
    switch (type) {
      case 'bogo':
      case 'buy_x_get_y':
        return <Gift className="w-6 h-6" />
      case 'percentage':
      case 'fixed':
        return <Tag className="w-6 h-6" />
      default:
        return <TrendingUp className="w-6 h-6" />
    }
  }

  const calculateSavings = (offer) => {
    if (offer.type === 'percentage') {
      const savings = (cartTotal * offer.value) / 100
      return Math.min(savings, offer.maxDiscount || savings)
    } else if (offer.type === 'fixed') {
      return Math.min(offer.value, cartTotal)
    }
    return 0
  }

  if (isLoading || !offers.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#FFF9E6] to-white border-2 border-[#D4AF37]/30 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Gift className="w-6 h-6 text-[#D4AF37]" />
        </motion.div>
        <h3 className="text-xl font-bold">Available Offers for You!</h3>
      </div>

      <div className="space-y-3">
        {offers.map((offer, index) => {
          const savings = calculateSavings(offer)
          const isEligible = !offer.minPurchaseAmount || cartTotal >= offer.minPurchaseAmount
          const amountNeeded = offer.minPurchaseAmount ? offer.minPurchaseAmount - cartTotal : 0

          return (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-4 border-2 transition-all ${
                isEligible 
                  ? 'border-[#D4AF37] shadow-md' 
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={isEligible ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className={`${isEligible ? 'text-[#D4AF37]' : 'text-gray-400'}`}
                >
                  {getIcon(offer.type)}
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-[#D4AF37]">
                      {getOfferValue(offer)}
                    </span>
                    {savings > 0 && isEligible && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                        Save ₹{savings.toFixed(0)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{offer.description}</p>

                  {!isEligible && amountNeeded > 0 && (
                    <p className="text-xs text-orange-600 font-semibold mb-2">
                      Add ₹{amountNeeded.toFixed(0)} more to unlock this offer!
                    </p>
                  )}

                  {offer.code && isEligible && (
                    <div className="mt-3 space-y-2">
                      <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#F4D03F]/10 border border-dashed border-[#D4AF37] rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-600 mb-1">Coupon Code</p>
                        <p className="font-mono font-bold text-base">{offer.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyCode(offer.code)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#D4AF37] hover:bg-[#B8941F] text-white text-sm font-semibold rounded-lg transition-all"
                        >
                          {copiedCode === offer.code ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Code
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => applyOffer(offer.code)}
                          className="flex-1 py-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-all"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Valid till {new Date(offer.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-3 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/30"
      >
        <p className="text-sm text-center text-gray-700">
          💡 <span className="font-semibold">Pro Tip:</span> Stack offers for maximum savings!
        </p>
      </motion.div>
    </motion.div>
  )
}
