import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sparkles, Zap, Gift, TrendingUp, Star, Crown } from 'lucide-react'
import axios from 'axios'

export default function ShopPageOfferBanner() {
  const [offers, setOffers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActiveOffers()
  }, [])

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % offers.length)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [offers.length])

  const fetchActiveOffers = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      setOffers(data.offers || [])
    } catch (error) {
      console.error('Failed to fetch offers')
    } finally {
      setIsLoading(false)
    }
  }

  const getOfferIcon = (type) => {
    switch (type) {
      case 'bogo':
      case 'buy_x_get_y':
        return Gift
      case 'percentage':
        return Star
      case 'free_shipping':
        return TrendingUp
      default:
        return Zap
    }
  }

  const getOfferText = (offer) => {
    switch (offer.type) {
      case 'percentage':
        return `${offer.value}% OFF`
      case 'fixed':
        return `₹${offer.value} OFF`
      case 'bogo':
        return 'BUY 1 GET 1 FREE'
      case 'buy_x_get_y':
        return `BUY ${offer.buyQuantity} GET ${offer.getQuantity} FREE`
      case 'free_shipping':
        return 'FREE SHIPPING'
      default:
        return offer.name
    }
  }

  if (isLoading || !offers.length) return null

  const currentOffer = offers[currentIndex]
  const Icon = getOfferIcon(currentOffer.type)

  return (
    <div className="mb-8 space-y-4">
      {/* Main Large Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#FFD700] p-8 md:p-12 shadow-2xl"
        >
          {/* Animated Background Elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="hidden md:block"
              >
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
                  <Icon className="w-12 h-12 text-[#D4AF37]" />
                </div>
              </motion.div>

              <div>
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl md:text-6xl font-black text-black mb-2"
                >
                  {getOfferText(currentOffer)}
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg md:text-2xl text-black/80 font-semibold"
                >
                  {currentOffer.description}
                </motion.p>
                {currentOffer.code && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 inline-block bg-black text-[#D4AF37] px-6 py-3 rounded-xl"
                  >
                    <p className="text-xs mb-1">Use Code:</p>
                    <p className="text-2xl font-mono font-bold">{currentOffer.code}</p>
                  </motion.div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-center hidden md:block"
            >
              <div className="text-7xl font-black text-black/10">
                {currentOffer.value}
                {currentOffer.type === 'percentage' ? '%' : ''}
              </div>
              <p className="text-xs text-black/50 mt-2">
                Valid till {new Date(currentOffer.endDate).toLocaleDateString()}
              </p>
            </motion.div>
          </div>

          {/* Progress Dots */}
          {offers.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-3 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-black w-8' : 'bg-black/40 w-3 hover:bg-black/60'
                  }`}
                  aria-label={`Go to offer ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Multiple Small Banners */}
      {offers.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.slice(0, 3).map((offer, index) => {
            const OfferIcon = getOfferIcon(offer.type)
            const gradients = [
              'from-purple-600 to-pink-600',
              'from-blue-600 to-cyan-600',
              'from-orange-600 to-red-600'
            ]
            
            return (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[index % 3]} p-6 shadow-lg`}
              >
                <div className="relative z-10">
                  <OfferIcon className="w-8 h-8 text-white mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {getOfferText(offer)}
                  </h3>
                  <p className="text-sm text-white/90 line-clamp-2">{offer.description}</p>
                  {offer.code && (
                    <div className="mt-3 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg inline-block">
                      <p className="text-xs text-white/80">Code: <span className="font-mono font-bold text-white">{offer.code}</span></p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Quick Offer Tags */}
      {offers.length > 3 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {offers.slice(3).map((offer, index) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-5 py-2 rounded-full shadow-md font-bold text-sm flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {getOfferText(offer)}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
