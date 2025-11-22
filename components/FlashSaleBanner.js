import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import axios from 'axios'

export default function FlashSaleBanner() {
  const [flashSales, setFlashSales] = useState([])
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    fetchFlashSales()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      updateTimeLeft()
    }, 1000)

    return () => clearInterval(timer)
  }, [flashSales])

  const fetchFlashSales = async () => {
    try {
      const { data } = await axios.get('/api/flash-sales/active')
      setFlashSales(data.flashSales)
    } catch (error) {
      console.error('Failed to fetch flash sales')
    }
  }

  const updateTimeLeft = () => {
    const newTimeLeft = {}
    flashSales.forEach(sale => {
      const now = new Date().getTime()
      const end = new Date(sale.endTime).getTime()
      const distance = end - now

      if (distance > 0) {
        newTimeLeft[sale._id] = {
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        }
      }
    })
    setTimeLeft(newTimeLeft)
  }

  if (flashSales.length === 0) return null

  return (
    <section className="relative bg-gradient-to-r from-[#0A1628] via-[#1A2B47] to-[#0A1628] py-16 px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {flashSales.map((sale) => (
          <div key={sale._id} className="mb-12 last:mb-0">
            <div className="text-center mb-8">
              {/* Flash Sale Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="inline-block mb-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(212, 175, 55, 0.5)',
                        '0 0 40px rgba(212, 175, 55, 0.8)',
                        '0 0 20px rgba(212, 175, 55, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider"
                  >
                    ⚡ Flash Sale ⚡
                  </motion.div>
                </div>
              </motion.div>

              {/* Title with animation */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-block"
              >
                <motion.h2 
                  className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4E4C1] to-[#D4AF37] mb-3"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% auto' }}
                >
                  {sale.name.toUpperCase()}
                </motion.h2>
                <motion.p 
                  className="text-[#F4E4C1] text-xl font-semibold"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {sale.description} 🔥
                </motion.p>
              </motion.div>

              {/* Countdown Timer */}
              {timeLeft[sale._id] && (
                <div className="mt-8">
                  <motion.p
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-red-400 font-bold text-lg mb-4 uppercase tracking-wider"
                  >
                    ⏰ Hurry! Sale Ends In:
                  </motion.p>
                  <div className="flex justify-center gap-3 md:gap-6">
                    {['hours', 'minutes', 'seconds'].map((unit, idx) => (
                      <motion.div
                        key={unit}
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: idx * 0.1, type: 'spring' }}
                        className="relative"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              '0 0 20px rgba(212, 175, 55, 0.3)',
                              '0 0 40px rgba(212, 175, 55, 0.6)',
                              '0 0 20px rgba(212, 175, 55, 0.3)',
                            ]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] text-black px-4 md:px-8 py-4 md:py-6 rounded-xl relative overflow-hidden"
                        >
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          />
                          <div className="relative z-10">
                            <div className="text-3xl md:text-5xl font-black">
                              {String(timeLeft[sale._id][unit]).padStart(2, '0')}
                            </div>
                            <div className="text-xs md:text-sm uppercase font-bold mt-1">
                              {unit}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Urgency Text */}
                  <motion.p
                    animate={{ 
                      opacity: [0.6, 1, 0.6],
                      y: [0, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[#F4E4C1] text-sm mt-4 font-semibold"
                  >
                    ⚠️ Limited Stock Available - Don't Miss Out!
                  </motion.p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sale.products.slice(0, 4).map((item, idx) => (
                <Link key={idx} href={`/product/${item.product._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.1, type: 'spring' }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 20px 40px rgba(212, 175, 55, 0.4)',
                    }}
                    className="bg-white rounded-xl overflow-hidden shadow-2xl cursor-pointer relative group"
                  >
                    {/* Discount Badge with Animation */}
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-3 right-3 z-20"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(255, 0, 0, 0.5)',
                              '0 0 20px rgba(255, 0, 0, 0.8)',
                              '0 0 10px rgba(255, 0, 0, 0.5)',
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-black"
                        >
                          -{item.discount}% OFF
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Hot Deal Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        className="bg-[#D4AF37] text-black px-2 py-1 rounded text-xs font-bold"
                      >
                        🔥 HOT
                      </motion.div>
                    </div>

                    {/* Image with Overlay */}
                    <div className="relative aspect-square overflow-hidden">
                      <motion.img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Quick View on Hover */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <button className="w-full bg-[#D4AF37] text-black py-2 rounded-lg font-bold text-sm hover:bg-[#B8941E] transition-colors">
                          Quick View
                        </button>
                      </motion.div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                        {item.product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <motion.span 
                          className="text-xl font-black text-[#D4AF37]"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ₹{item.salePrice}
                        </motion.span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.originalPrice}
                        </span>
                        <span className="text-xs text-green-600 font-bold">
                          Save ₹{item.originalPrice - item.salePrice}
                        </span>
                      </div>

                      {/* Stock Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 font-semibold">
                            {item.soldCount} sold
                          </span>
                          <motion.span 
                            className="text-red-600 font-bold"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {item.stock - item.soldCount} left!
                          </motion.span>
                        </div>
                        <div className="relative bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.soldCount / item.stock) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] h-3 rounded-full relative"
                          >
                            {/* Shine effect on progress bar */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Urgency Text */}
                      {item.stock - item.soldCount < 5 && (
                        <motion.p
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-xs text-red-600 font-bold mt-2 text-center"
                        >
                          ⚠️ Almost Sold Out!
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
