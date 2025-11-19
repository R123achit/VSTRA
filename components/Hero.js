import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Removed 3D Cube for better performance

export default function Hero() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2
      })

      // Removed parallax scroll effect for better performance
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen w-full bg-black text-white overflow-hidden">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
      </div>

      {/* Removed 3D Element for better performance */}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <motion.div
          ref={titleRef}
          className="text-center max-w-5xl"
        >
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 leading-none"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            VSTRA
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-3xl font-light tracking-wide mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Redefine Your Style
          </motion.p>
          
          <motion.p 
            className="text-xs sm:text-sm md:text-lg text-gray-300 font-light tracking-wider mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Premium clothing crafted for modern elegance
          </motion.p>

          <motion.button
            onClick={() => {
              document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:shadow-2xl cursor-pointer"
          >
            Explore Collection
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
