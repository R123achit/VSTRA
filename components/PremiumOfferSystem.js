import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'

export default function PremiumOfferSystem() {
  const [offers, setOffers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    fetchOffers()
  }, [])

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % offers.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [offers.length])

  useEffect(() => {
    if (offers.length === 0) return

    const timer = setInterval(() => {
      const newTimeLeft = {}
      offers.forEach((offer) => {
        if (offer.endDate) {
          const end = new Date(offer.endDate).getTime()
          const now = new Date().getTime()
          const distance = end - now

          if (distance > 0) {
            newTimeLeft[offer._id] = {
              days: Math.floor(distance / (1000 * 60 * 60 * 24)),
              hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
              seconds: Math.floor((distance % (1000 * 60)) / 1000),
            }
          }
        }
      })
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [offers])

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      const activeOffers = (data.offers || []).filter(
        (offer) => offer.isActive && (!offer.endDate || new Date(offer.endDate) > new Date())
      )
      setOffers(activeOffers)
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('offerBarDismissed', 'true')
    window.dispatchEvent(new CustomEvent('offersBarVisibility', { detail: { visible: false } }))
  }

  // Check if user previously dismissed
  useEffect(() => {
    const dismissed = sessionStorage.getItem('offerBarDismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  useEffect(() => {
    const hasOffers = isVisible && offers.length > 0
    window.dispatchEvent(
      new CustomEvent('offersBarVisibility', { detail: { visible: hasOffers } })
    )
    
    // Update body padding to prevent content jump
    if (hasOffers) {
      document.body.style.paddingTop = '0'
    } else {
      document.body.style.paddingTop = '0'
    }
  }, [isVisible, offers.length])

  if (!isVisible || offers.length === 0) return null

  const currentOffer = offers[currentIndex]

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-[60] overflow-hidden"
    >
      <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Left: Offer Icon */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden sm:flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.div>

              <div className="flex flex-col">
                <span className="text-yellow-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  {currentOffer.type === 'percentage' ? `${currentOffer.value}% OFF` : `₹${currentOffer.value} OFF`}
                </span>
                <span className="text-white text-xs sm:text-sm font-medium">
                  Code: <span className="font-bold text-yellow-400">{currentOffer.code}</span>
                </span>
              </div>
            </div>

            {/* Center: Offer Details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex-1 mx-4 sm:mx-8 text-center"
              >
                <p className="text-white text-xs sm:text-sm md:text-base font-medium line-clamp-1">
                  {currentOffer.name}
                </p>
                {currentOffer.description && (
                  <p className="text-gray-300 text-xs hidden sm:block line-clamp-1">
                    {currentOffer.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Right: Timer & Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Countdown Timer */}
              {timeLeft[currentOffer._id] && (
                <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex items-center gap-1 text-white text-xs font-mono">
                    <span className="font-bold">{String(timeLeft[currentOffer._id].hours).padStart(2, '0')}</span>
                    <span>:</span>
                    <span className="font-bold">{String(timeLeft[currentOffer._id].minutes).padStart(2, '0')}</span>
                    <span>:</span>
                    <span className="font-bold">{String(timeLeft[currentOffer._id].seconds).padStart(2, '0')}</span>
                  </div>
                </div>
              )}

              {/* Shop Now Button */}
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Shop Now
                </motion.button>
              </Link>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Close offer banner"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Indicators */}
          {offers.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-2">
              {offers.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentIndex ? 'w-8 bg-yellow-400' : 'w-1 bg-gray-600 hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Glow Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
      </div>
    </motion.div>
  )
}
