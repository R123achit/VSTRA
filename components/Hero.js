import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Button3D from './Button3D'
import WeatherRecommendations from './WeatherRecommendations'

export default function Hero() {
  const images = [
  'https://images.pexels.com/photos/8157980/pexels-photo-8157980.jpeg',
    'https://images.pexels.com/photos/351127/pexels-photo-351127.jpeg',
    'https://images.pexels.com/photos/5076726/pexels-photo-5076726.jpeg',
     'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg',
     'https://images.pexels.com/photos/3756686/pexels-photo-3756686.jpeg',
     'https://images.pexels.com/photos/27197359/pexels-photo-27197359.jpeg',
     'https://images.pexels.com/photos/20304275/pexels-photo-20304275.jpeg',
     'https://images.pexels.com/photos/12789164/pexels-photo-12789164.jpeg',
     'https://images.pexels.com/photos/31277421/pexels-photo-31277421.jpeg',
     'https://images.pexels.com/photos/28217319/pexels-photo-28217319.jpeg',
     'https://images.pexels.com/photos/1089637/pexels-photo-1089637.jpeg',
     'https://images.pexels.com/photos/8156203/pexels-photo-8156203.jpeg',
     'https://images.pexels.com/photos/12932402/pexels-photo-12932402.jpeg',
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 6000) // Change image every 6 seconds

    return () => clearInterval(interval)
  }, [images.length])
  return (
    <>
      <section className="relative h-screen w-full bg-black text-white overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 w-full h-full transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(0.6)',
              opacity: currentImageIndex === index ? 1 : 0,
              zIndex: -1
            }}
          />
        ))}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" style={{ zIndex: -1 }} />
      </div>

      {/* Content */}
      <div className="relative z-30 h-full flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-5xl">
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            VSTRA
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-3xl font-light tracking-wide mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Redefine Your Style
          </motion.p>
          
          <motion.p 
            className="text-xs sm:text-sm md:text-lg text-gray-300 font-light tracking-wider mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Premium clothing crafted for modern elegance
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button3D
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              variant="secondary"
            >
              Explore Collection
            </Button3D>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            {[
              { value: '500+', label: 'Products' },
              { value: '50K+', label: 'Customers' },
              { value: '4.9', label: 'Rating' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-12 cursor-pointer" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
          </div>
          <p className="text-xs mt-2 text-center tracking-wider">SCROLL</p>
        </div>
      </div>
    </section>

    {/* Weather-Based Recommendations Section */}
    <section className="bg-vstra-light py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <WeatherRecommendations />
      </div>
    </section>
    </>
  )
}
