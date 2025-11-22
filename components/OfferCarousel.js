import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Gift, Zap, Tag, TrendingUp } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

export default function OfferCarousel() {
  const [offers, setOffers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActiveOffers()
  }, [])

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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length)
  }

  const getOfferIcon = (type) => {
    switch (type) {
      case 'bogo':
      case 'buy_x_get_y':
        return <Gift className="w-12 h-12" />
      case 'percentage':
        return <Tag className="w-12 h-12" />
      case 'free_shipping':
        return <TrendingUp className="w-12 h-12" />
      default:
        return <Zap className="w-12 h-12" />
    }
  }

  const getOfferTitle = (offer) => {
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

  return (
    <section className="py-16 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            🎁 Exclusive Offers
          </h2>
          <p className="text-gray-400 text-lg">
            Limited time deals you don't want to miss
          </p>
        </motion.div>

        <div className="relative">
          {/* Carousel */}
          <div className="relative h-[400px] md:h-[500px]">
            {offers.map((offer, index) => (
              <motion.div
                key={offer._id}
                initial={false}
                animate={{
                  opacity: index === currentIndex ? 1 : 0,
                  scale: index === currentIndex ? 1 : 0.8,
                  zIndex: index === currentIndex ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="h-full bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] rounded-3xl p-8 md:p-12 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between h-full gap-8">
                    {/* Left side - Offer details */}
                    <div className="flex-1 text-center md:text-left">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 10, 0],
                          scale: [1, 1.1, 1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="inline-block mb-6 text-black"
                      >
                        {getOfferIcon(offer.type)}
                      </motion.div>

                      <h3 className="text-5xl md:text-7xl font-black mb-4 text-black">
                        {getOfferTitle(offer)}
                      </h3>
                      
                      <p className="text-xl md:text-2xl mb-6 text-black/80 font-semibold">
                        {offer.description}
                      </p>

                      {offer.code && (
                        <div className="inline-block bg-black text-[#D4AF37] px-8 py-4 rounded-xl mb-6">
                          <p className="text-sm mb-1">Use Code:</p>
                          <p className="text-3xl font-mono font-bold">{offer.code}</p>
                        </div>
                      )}

                      <div className="space-y-2 text-black/70 mb-8">
                        {offer.minPurchaseAmount > 0 && (
                          <p className="text-lg">
                            ✓ Min purchase: ₹{offer.minPurchaseAmount}
                          </p>
                        )}
                        {offer.maxDiscount && (
                          <p className="text-lg">
                            ✓ Max discount: ₹{offer.maxDiscount}
                          </p>
                        )}
                        <p className="text-lg">
                          ⏰ Valid till {new Date(offer.endDate).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>

                      <Link href="/shop">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-12 py-4 bg-black text-[#D4AF37] font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
                        >
                          Shop Now →
                        </motion.button>
                      </Link>
                    </div>

                    {/* Right side - Visual element */}
                    <div className="hidden md:block">
                      <motion.div
                        animate={{ 
                          y: [0, -20, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="text-black/20 text-[200px] font-black"
                      >
                        {offer.value}
                        {offer.type === 'percentage' ? '%' : ''}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation buttons */}
          {offers.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {offers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-3 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'bg-[#D4AF37] w-12' 
                        : 'bg-gray-600 w-3 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
