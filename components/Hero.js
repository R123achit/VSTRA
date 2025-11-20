import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative h-screen w-full bg-black text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/8157980/pexels-photo-8157980.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.6)'
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
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

          <motion.button
            onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white text-black px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
          >
            Explore Collection
          </motion.button>

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
  )
}
