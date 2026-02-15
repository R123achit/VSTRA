import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { formatTimeLeft } from '../utils/offerUtils'

export default function ActiveOffersBar() {
  const [offers, setOffers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const barRef = useRef(null)

  useEffect(() => {
    // Notify when visibility changes, include measured height
    if (typeof window !== 'undefined') {
      const visible = isVisible && offers.length > 0
      // Delay measurement to after DOM paint so offsetHeight is accurate
      requestAnimationFrame(() => {
        const height = barRef.current ? barRef.current.offsetHeight : 0
        window.dispatchEvent(new CustomEvent('offersBarVisibility', { detail: { visible, height: visible ? height : 0 } }))
      })
    }
  }, [isVisible, offers])

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
  }, [offers])

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get('/api/offers/active')
      setOffers(data.offers)
    } catch (error) {
      console.error('Failed to fetch offers')
    }
  }

  if (!isVisible || offers.length === 0) return null

  const currentOffer = offers[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        ref={barRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        className="fixed top-0 left-0 right-0 z-[51] overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #CD7F32 25%, #D4AF37 50%, #CD7F32 75%, #D4AF37 100%)',
          backgroundSize: '200% 200%',
        }}
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            backgroundSize: '200% 100%',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: '50%',
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 py-3 relative z-10">
          <div className="flex items-center justify-between gap-4">
            {/* Animated Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="text-3xl flex-shrink-0"
            >
              🎉
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  className="text-center"
                >
                  {/* Offer Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block mb-1"
                  >
                    <span className="px-3 py-1 bg-black text-[#D4AF37] text-xs font-bold rounded-full uppercase tracking-wider">
                      🔥 Limited Time Offer
                    </span>
                  </motion.div>

                  {/* Offer Title */}
                  <motion.p 
                    className="font-black text-base md:text-xl mb-1 text-black"
                    animate={{ 
                      textShadow: [
                        '0 0 10px rgba(0,0,0,0.3)',
                        '0 0 20px rgba(0,0,0,0.5)',
                        '0 0 10px rgba(0,0,0,0.3)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentOffer.name.toUpperCase()}
                  </motion.p>

                  {/* Code and Timer */}
                  <div className="flex items-center justify-center gap-3 flex-wrap text-xs md:text-sm">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full"
                    >
                      <span className="font-semibold">Code:</span>
                      <motion.span 
                        className="font-mono font-black text-black bg-white px-2 py-0.5 rounded"
                        animate={{ 
                          boxShadow: [
                            '0 0 0px rgba(0,0,0,0)',
                            '0 0 10px rgba(0,0,0,0.5)',
                            '0 0 0px rgba(0,0,0,0)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {currentOffer.code}
                      </motion.span>
                    </motion.div>

                    {currentOffer.endDate && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-full font-bold"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{formatTimeLeft(currentOffer.endDate)}</span>
                      </motion.div>
                    )}

                    {/* Shop Now CTA */}
                    <motion.a
                      href="/shop"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-black text-[#D4AF37] px-4 py-1 rounded-full font-bold uppercase text-xs hover:bg-[#0A1628] transition-colors flex items-center gap-1"
                    >
                      Shop Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            {offers.length > 1 && (
              <div className="flex flex-col gap-2">
                {offers.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    whileHover={{ scale: 1.3 }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-black w-3 h-3' : 'bg-black/30'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Close Button */}
            <motion.button
              onClick={() => setIsVisible(false)}
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="text-black hover:text-red-600 transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
      </motion.div>
    </AnimatePresence>
  )
}
