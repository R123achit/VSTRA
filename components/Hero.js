import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Hero() {
  const slides = [
    {
      video: '/videos/139997-774012678.mp4',
      duration: 23000, // 23 seconds
      headline: (
        <>
          THE<br />TRAVEL EDIT
        </>
      ),
      cta: 'SHOP WOMAN',
      ctaLink: '/shop?category=women',
      label: 'Woman'
    },
    {
      video: '/videos/istockphoto-1323005489-640_adpp_is.mp4',
      duration: 5000, // fallback duration
      headline: (
        <>
          THE<br />SUMMER DROP
        </>
      ),
      cta: 'SHOP MAN',
      ctaLink: '/shop?category=men',
      label: 'Man'
    },
    {
      video: '/videos/fashion-hero.mp4',
      duration: 5000, // fallback duration
      headline: (
        <>
          NEW<br />COLLECTION
        </>
      ),
      cta: 'SHOP NOW',
      ctaLink: '/shop',
      label: 'Fashion'
    }
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [offersBarVisible, setOffersBarVisible] = useState(true)
  const videoRef = useRef(null)

  useEffect(() => {
    const handleOffersBarVisibility = (e) => setOffersBarVisible(e.detail.visible)
    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    return () => window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
  }, [])

  useEffect(() => {
    // Wait for video to end before moving to next slide
    const handleVideoEnd = () => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd)
      return () => videoElement.removeEventListener('ended', handleVideoEnd)
    }
  }, [currentSlide, slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section 
      className="relative w-full h-screen overflow-hidden transition-all duration-300"
    >
      <div className="relative w-full h-full group">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {slides[currentSlide].video ? (
              <video
                ref={videoRef}
                key={slides[currentSlide].video}
                src={slides[currentSlide].video}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={slides[currentSlide].image}
                alt="Hero Slide"
                className="w-full h-full object-cover object-center"
              />
            )}
            {/* Subtle Gradient for Text Optionality */}
            <div className="absolute inset-0 bg-black/10"></div>
          </motion.div>
        </AnimatePresence>

        {/* Text Area (Minimalistic) */}
        <div className="absolute top-[45%] -translate-y-1/2 left-[12%] md:left-[15%] lg:left-[18%] flex flex-col items-center md:items-center text-center text-white p-4 drop-shadow-md z-10 w-full max-w-[500px]">
          <h1 className="text-[54px] md:text-[72px] lg:text-[85px] leading-[1.05] font-light tracking-wide mb-8">
            {slides[currentSlide].headline}
          </h1>
          <Link href={slides[currentSlide].ctaLink}>
            <button className="text-white text-[13px] tracking-[0.2em] font-medium uppercase hover:text-gray-300 transition-colors duration-300 select-none">
              {slides[currentSlide].cta}
            </button>
          </Link>
        </div>

        {/* Vertical Slider Navigation (Left Side) */}
        <div className="absolute left-8 bottom-12 flex flex-col items-start gap-4 z-20">
          <div className="origin-top-left -rotate-90 translate-y-[60px] translate-x-[4px] w-[100px] text-[13px] tracking-[0.1em] text-white font-medium">
            {slides[currentSlide].label}
          </div>
          <div className="flex flex-col gap-1 mt-[80px]">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 transition-all duration-300 flex items-center justify-center`}
              >
                <div className={`transition-all duration-300 ${
                  currentSlide === idx ? 'w-2.5 h-2.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Arrows (Right Side) */}
        <button 
          onClick={prevSlide}
          className="absolute right-0 top-[45%] -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-0 top-[55%] -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
