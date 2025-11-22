import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { findBestOffer } from '../utils/offerUtils'
import toast from 'react-hot-toast'

export default function AutoApplyOffer({ cartItems, cartTotal, onApplyOffer }) {
  const [offers, setOffers] = useState([])
  const [bestOffer, setBestOffer] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOffers()
  }, [])

  useEffect(() => {
    if (offers.length > 0 && cartItems.length > 0) {
      const best = findBestOffer(offers, cartItems, cartTotal)
      setBestOffer(best)
    }
  }, [offers, cartItems, cartTotal])

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      setOffers(data.offers)
    } catch (error) {
      console.error('Failed to fetch offers')
    }
  }

  const handleApplyBestOffer = async () => {
    if (!bestOffer || !bestOffer.code) {
      toast.error('Invalid offer code')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/offers/validate', {
        code: bestOffer.code,
        cartItems,
        cartTotal,
      })

      if (data.valid) {
        onApplyOffer(data.offer)
        toast.success(`${bestOffer.name} applied! You saved ₹${data.offer.discount}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply offer')
    } finally {
      setLoading(false)
    }
  }

  // Don't show if no offer or no discount or no code
  if (!bestOffer || bestOffer.calculatedDiscount === 0 || !bestOffer.code) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-[#D4AF37]/10 to-[#CD7F32]/10 border-2 border-[#D4AF37] rounded-lg p-4 mb-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37] text-black p-2 rounded-full flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[#0A1628] text-sm sm:text-base">💡 Best Deal Available!</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {bestOffer.name} • Code: <span className="font-mono font-bold">{bestOffer.code}</span>
              </p>
              <p className="text-xs text-green-600 font-semibold">
                Click to save ₹{bestOffer.calculatedDiscount}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApplyBestOffer}
            disabled={loading}
            className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941E] transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Applying...' : 'Apply Now'}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
