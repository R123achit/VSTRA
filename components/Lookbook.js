import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const lookbookImages = [
  { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', span: 'row-span-2', title: 'Urban Elegance' },
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', span: '', title: 'Street Style' },
  { url: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80', span: '', title: 'Classic Look' },
  { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', span: 'row-span-2', title: 'Modern Chic' },
  { url: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=600&q=80', span: '', title: 'Casual Vibes' },
  { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', span: '', title: 'Bold Statement' },
]

function LookbookItem({ item, index }) {
  const itemRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useTransform(y, [-100, 100], [5, -5])
  const rotateY = useTransform(x, [-100, 100], [-5, 5])

  const handleMouseMove = (e) => {
    if (!itemRef.current) return
    const rect = itemRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className={`lookbook-item group relative overflow-hidden cursor-pointer shadow-2xl ${item.span}`}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Image with Parallax */}
        <motion.img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover"
          style={{
            scale: isHovered ? 1.15 : 1,
            filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)'
          }}
          transition={{ duration: 0.7 }}
        />
        
        {/* Gradient Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          animate={isHovered ? { opacity: 1 } : { opacity: 0.5 }}
          transition={{ duration: 0.5 }}
        />

        {/* Simplified overlay */}
        <div 
          className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Removed particles for performance */}

        {/* Content */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            transform: isHovered ? 'translateZ(40px)' : 'translateZ(0px)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Title */}
          <motion.h3
            className="text-white text-xl md:text-2xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {item.title}
          </motion.h3>

          {/* View Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative bg-white text-black px-6 py-2 text-xs font-semibold tracking-widest uppercase overflow-hidden group/btn"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 group-hover/btn:text-white transition-colors">
                View Details
              </span>
            </motion.button>
          </motion.div>

          {/* Animated Icon */}
          <motion.div
            className="absolute top-4 right-4"
            initial={{ opacity: 0, rotate: -180 }}
            animate={isHovered ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: -180 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Border Glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: isHovered ? '0 0 40px rgba(168, 85, 247, 0.6) inset' : 'none'
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

export default function Lookbook() {
  const sectionRef = useRef(null)

  return (
    <section id="lookbook" ref={sectionRef} className="relative py-32 px-6 lg:px-12 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-600 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            Lookbook
          </h2>
          <motion.p 
            className="text-gray-600 text-lg tracking-wide"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Style inspiration for every occasion
          </motion.p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[300px] gap-4">
          {lookbookImages.map((item, index) => (
            <LookbookItem key={index} item={item} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative border-2 border-black text-black px-12 py-4 text-sm font-semibold tracking-widest uppercase overflow-hidden group cursor-pointer"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: '0%' }}
              transition={{ duration: 0.5 }}
            />
            <span className="relative z-10 group-hover:text-white transition-colors">
              Explore Full Lookbook
            </span>
            
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-200%', '200%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

