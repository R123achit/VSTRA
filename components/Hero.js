import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Hero() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const videoRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [videoLoaded, setVideoLoaded] = useState(false)
  const { scrollY } = useScroll()
  
  const y = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Throttle mouse movement for better performance
  const handleMouseMove = useCallback((e) => {
    requestAnimationFrame(() => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      })
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animated gradient background
      gsap.to('.gradient-orb', {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 1
      })
    })

    return () => ctx.revert()
  }, [])

  // Handle video load with better error handling
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleLoad = () => {
        console.log('Video loaded successfully')
        setVideoLoaded(true)
      }
      const handleError = () => {
        console.log('Video failed to load, using background image')
        setVideoLoaded(false)
      }
      
      video.addEventListener('loadeddata', handleLoad)
      video.addEventListener('error', handleError)
      
      // Try to play the video
      video.play().catch(err => {
        console.log('Autoplay prevented:', err)
      })
      
      return () => {
        video.removeEventListener('loadeddata', handleLoad)
        video.removeEventListener('error', handleError)
      }
    }
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen w-full bg-black text-white overflow-hidden">
      {/* Full-Screen Cinematic Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Fallback Background Image - Beach Sunset Fashion Theme */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=90&fit=crop)',
            filter: 'brightness(0.6) contrast(1.15) saturate(1.1)'
          }}
        />
        
        {/* High-Quality Fashion Video - Cinematic Model Walking */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ 
            filter: 'brightness(0.6) contrast(1.15) saturate(1.1)',
            transform: 'scale(1.02)',
            opacity: videoLoaded ? 1 : 0
          }}
          onLoadedData={() => {
            console.log('✅ Video loaded successfully!')
            setVideoLoaded(true)
          }}
          onError={(e) => {
            console.log('❌ Video failed to load, using background image')
            setVideoLoaded(false)
          }}
        >
          {/* Local HD video - fastest loading (1920x1080) */}
          <source src="/videos/fashion-hero.mp4" type="video/mp4" />
          
          {/* Fallback: Free HD Fashion Videos */}
          <source src="https://videos.pexels.com/video-files/3048379/3048379-hd_1920_1080_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3765139/3765139-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        
        {/* Cinematic Gradient Overlays - Multi-Layer for Premium Look */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        
        {/* Film Grain Effect - Cinematic Texture */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{
          backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAElBMVEUAAAAAAAAAAAAAAAAAAAAAAADgKxmiAAAABnRSTlMCCwsLCwtwqBHkAAAAPklEQVQ4y2NgAAOBBgYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBQYGBgYAHhMEAQxKGPwAAAAASUVORK5CYII=)',
          backgroundRepeat: 'repeat',
          animation: 'grain 8s steps(10) infinite'
        }} />
        
        {/* Cinematic Vignette Effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)'
        }} />
        
        {/* Subtle Light Leak Effect - Fashion Photography Style */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-purple-500/10 to-transparent opacity-30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-pink-500/10 to-transparent opacity-20 blur-3xl" />
      </div>

      {/* Subtle Animated Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        <div className="gradient-orb absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="gradient-orb absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center px-6"
        style={{ opacity }}
      >
        <motion.div
          ref={titleRef}
          className="text-center max-w-5xl"
        >
          {/* Animated Title */}
          <div className="mb-6 overflow-hidden">
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
            >
              VSTRA
            </motion.h1>
          </div>
          
          {/* Subtitle */}
          <motion.p 
            className="text-lg sm:text-xl md:text-3xl font-light tracking-wide mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            Redefine Your Style
          </motion.p>
          
          <motion.p 
            className="text-xs sm:text-sm md:text-lg text-gray-300 font-light tracking-wider mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
          >
            Premium clothing crafted for modern elegance
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => {
              document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-purple-600 hover:text-white transition-all duration-300 cursor-pointer shadow-2xl"
          >
            Explore Collection
          </motion.button>

          {/* Stats Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            {[
              { value: '500+', label: 'Products' },
              { value: '50K+', label: 'Customers' },
              { value: '4.9', label: 'Rating' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div
          className="absolute bottom-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="relative cursor-pointer"
            onClick={() => {
              document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
              <motion.div 
                className="w-1 h-2 bg-white rounded-full"
                animate={{
                  y: [0, 12, 0],
                  opacity: [1, 0, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <motion.p 
              className="text-xs mt-2 text-center tracking-wider"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              SCROLL
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Additional Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-radial-gradient from-transparent via-transparent to-black/50" />
      
      {/* CSS Animation for Film Grain */}
      <style jsx>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
      `}</style>
    </section>
  )
}
