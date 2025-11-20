import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import Link from 'next/link'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const categories = [
  {
    title: 'Men',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
    description: 'Refined masculinity',
    link: '/shop?category=men',
    color: 'from-blue-600/20 to-purple-600/20'
  },
  {
    title: 'Women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    description: 'Elegant sophistication',
    link: '/shop?category=women',
    color: 'from-pink-600/20 to-rose-600/20'
  },
  {
    title: 'New Arrivals',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=800&q=80',
    description: 'Latest collections',
    link: '/shop?category=new-arrivals',
    color: 'from-purple-600/20 to-indigo-600/20'
  },
  {
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=800&q=80',
    description: 'Complete your look',
    link: '/shop?category=accessories',
    color: 'from-amber-600/20 to-orange-600/20'
  }
]

function CategoryCard({ category, index }) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <Link href={category.link}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -8 }}
        className="group relative h-[500px] overflow-hidden bg-black cursor-pointer shadow-2xl"
      >
        {/* Simplified Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10`} />

        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url('${category.image}')`,
              scale: isHovered ? 1.15 : 1
            }}
            transition={{ duration: 0.7 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:from-black/90 transition-all duration-500" />
        </div>

        {/* Removed shine effect for performance */}

        {/* Reduced particles for performance */}
        {isHovered && (
          <div className="absolute inset-0 z-20 hidden md:block">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 0
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-30 h-full flex flex-col justify-end p-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h3 
              className="text-4xl font-bold tracking-tight mb-2"
              animate={isHovered ? {
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.5)',
                  '0 0 40px rgba(255,255,255,0.8)',
                  '0 0 20px rgba(255,255,255,0.5)'
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {category.title}
            </motion.h3>
            <p className="text-sm tracking-wider text-gray-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {category.description}
            </p>
            
            {/* Animated Line */}
            <motion.div 
              className="h-0.5 bg-white"
              initial={{ width: 0 }}
              whileInView={{ width: isHovered ? 64 : 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Arrow Icon */}
            <motion.div
              className="mt-4 opacity-0 group-hover:opacity-100"
              initial={{ x: -20 }}
              animate={isHovered ? { x: 0 } : { x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Border Glow */}
        <div
          className={`absolute inset-0 z-40 pointer-events-none transition-all duration-300 ${
            isHovered ? 'shadow-[0_0_30px_rgba(255,255,255,0.3)_inset]' : ''
          }`}
        />
      </motion.div>
    </Link>
  )
}

export default function Categories() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="categories" ref={sectionRef} className="relative py-32 px-6 lg:px-12 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={titleRef}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
            Collections
          </h2>
          <motion.p 
            className="text-gray-400 text-lg tracking-wide"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover your perfect style
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.title} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

