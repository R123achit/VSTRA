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
    color: 'from-[#0A1628]/30 to-[#D4AF37]/20'
  },
  {
    title: 'Women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    description: 'Elegant sophistication',
    link: '/shop?category=women',
    color: 'from-[#CD7F32]/20 to-[#F4E4C1]/20'
  },
  {
    title: 'New Arrivals',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=800&q=80',
    description: 'Latest collections',
    link: '/shop?category=new-arrivals',
    color: 'from-[#D4AF37]/25 to-[#B8941E]/20'
  },
  {
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=800&q=80',
    description: 'Complete your look',
    link: '/shop?category=accessories',
    color: 'from-[#C0C0C0]/20 to-[#2C2C2C]/25'
  }
]

function CategoryCard({ category, index }) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * -12
    const rotateYValue = ((x - centerX) / centerX) * 12
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <Link href={category.link}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
        className="group relative h-[500px] overflow-hidden bg-black cursor-pointer"
      >
        <motion.div
          animate={{
            rotateX: rotateX,
            rotateY: rotateY,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: isHovered 
              ? '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.6)' 
              : '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
            transition: 'box-shadow 0.3s ease',
          }}
          className="h-full rounded-xl overflow-hidden"
        >
          {/* 3D Gradient Overlay */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-br ${category.color} z-10`}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ transform: 'translateZ(30px)' }}
          />

          {/* Image with 3D depth */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${category.image}')`,
                transform: 'translateZ(10px)',
              }}
              animate={{
                scale: isHovered ? 1.15 : 1,
              }}
              transition={{ duration: 0.7 }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
              animate={{
                background: isHovered 
                  ? 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.5), transparent)',
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* 3D Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20"
            animate={{
              x: isHovered ? ['0%', '100%'] : '-100%',
            }}
            transition={{ duration: 0.8 }}
            style={{ transform: 'translateZ(70px)' }}
          />

          {/* 3D Particles */}
          {isHovered && (
            <div className="absolute inset-0 z-20 hidden md:block" style={{ transform: 'translateZ(60px)' }}>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    background: 'linear-gradient(135deg, #D4AF37, #F4E4C1)',
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Content with 3D layering */}
          <div 
            className="relative z-30 h-full flex flex-col justify-end p-8 text-white"
            style={{ transform: 'translateZ(80px)' }}
          >
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
                  ],
                  scale: 1.05,
                } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {category.title}
              </motion.h3>
              <motion.p 
                className="text-sm tracking-wider text-gray-200 mb-4"
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                transition={{ duration: 0.3 }}
              >
                {category.description}
              </motion.p>
              
              {/* Animated Line */}
              <motion.div 
                className="h-0.5 bg-white"
                animate={{ width: isHovered ? 64 : 0 }}
                transition={{ duration: 0.5 }}
              />

              {/* Arrow Icon with 3D effect */}
              <motion.div
                className="mt-4"
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  x: isHovered ? 0 : -20,
                  scale: isHovered ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{ transform: 'translateZ(100px)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          {/* 3D Border Glow */}
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none rounded-xl"
            animate={{
              boxShadow: isHovered 
                ? 'inset 0 0 40px rgba(212, 175, 55, 0.7), inset 0 0 80px rgba(244, 228, 193, 0.3)' 
                : 'inset 0 0 0px rgba(212, 175, 55, 0)',
            }}
            transition={{ duration: 0.3 }}
            style={{ transform: 'translateZ(90px)' }}
          />

          {/* Holographic edge effect */}
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none rounded-xl"
            style={{
              background: isHovered 
                ? 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)'
                : 'transparent',
              backgroundSize: '200% 200%',
            }}
            animate={isHovered ? {
              backgroundPosition: ['0% 0%', '100% 100%'],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
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
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#CD7F32]/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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

