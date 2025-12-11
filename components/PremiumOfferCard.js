import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function PremiumOfferCard({ offer, index = 0 }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!offer.endDate) return

    const timer = setInterval(() => {
      const end = new Date(offer.endDate).getTime()
      const now = new Date().getTime()
      const distance = end - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft(null)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [offer.endDate])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getGradient = () => {
    const gradients = [
      'from-purple-600 via-pink-600 to-red-600',
      'from-blue-600 via-cyan-600 to-teal-600',
      'from-orange-600 via-red-600 to-pink-600',
      'from-green-600 via-emerald-600 to-teal-600',
      'from-indigo-600 via-purple-600 to-pink-600',
    ]
    return gradients[index % gradients.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      {/* Card */}
      <div className={`relative bg-gradient-to-br ${getGradient()} rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </motion.div>
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2">{offer.name}</h3>

          {/* Description */}
          {offer.description && (
            <p className="text-white/90 text-sm sm:text-base mb-6 line-clamp-2">{offer.description}</p>
          )}

          {/* Code Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs mb-1">Coupon Code</p>
                <p className="text-white text-xl sm:text-2xl font-bold tracking-wider">{offer.code}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyCode}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied
                  </span>
                ) : (
                  'Copy'
                )}
              </motion.button>
            </div>
          </div>

          {/* Timer */}
          {timeLeft && (
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {['days', 'hours', 'minutes', 'seconds'].map((unit, idx) => (
                <div key={unit} className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2 min-w-[50px] sm:min-w-[60px]">
                    <p className="text-white text-xl sm:text-2xl font-bold">
                      {String(timeLeft[unit]).padStart(2, '0')}
                    </p>
                  </div>
                  <p className="text-white/70 text-xs mt-1 capitalize">{unit}</p>
                </div>
              ))}
            </div>
          )}

          {/* Minimum Purchase */}
          {offer.minPurchase > 0 && (
            <div className="mt-4 flex items-center gap-2 text-white/80 text-xs sm:text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Min. purchase: ₹{offer.minPurchase}</span>
            </div>
          )}
        </div>

        {/* Corner Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 blur-2xl" />
      </div>
    </motion.div>
  )
}
