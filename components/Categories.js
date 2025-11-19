import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const categories = [
  {
    title: 'Men',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
    description: 'Refined masculinity'
  },
  {
    title: 'Women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    description: 'Elegant sophistication'
  },
  {
    title: 'New Arrivals',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=800&q=80',
    description: 'Latest collections'
  },
  {
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=800&q=80',
    description: 'Complete your look'
  }
]

export default function Categories() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.1,
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="categories" ref={sectionRef} className="py-32 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            Collections
          </h2>
          <p className="text-gray-600 text-lg tracking-wide">
            Discover your perfect style
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              ref={(el) => (cardsRef.current[index] = el)}
              onClick={() => {
                document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
              }}
              whileHover={{ y: -10 }}
              className="group relative h-[500px] overflow-hidden bg-black cursor-pointer shadow-xl"
            >
              {/* Image */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${category.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:from-black/80 transition-all duration-500" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
                <h3 className="text-4xl font-bold tracking-tight mb-2">
                  {category.title}
                </h3>
                <p className="text-sm tracking-wider text-gray-200 mb-4">
                  {category.description}
                </p>
                <div className="h-0.5 bg-white w-0 group-hover:w-16 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
