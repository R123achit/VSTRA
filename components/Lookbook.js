import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const lookbookImages = [
  { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', span: 'row-span-2' },
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', span: '' },
  { url: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80', span: '' },
  { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', span: 'row-span-2' },
  { url: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=600&q=80', span: '' },
  { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', span: '' },
]

export default function Lookbook() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lookbook-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="lookbook" ref={sectionRef} className="py-32 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
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
          <p className="text-gray-600 text-lg tracking-wide">
            Style inspiration for every occasion
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[300px] gap-4">
          {lookbookImages.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                alert(`Lookbook Image ${index + 1}\n\nThis would open a full-screen gallery view in a complete ecommerce site.`)
              }}
              className={`lookbook-item group relative overflow-hidden cursor-pointer shadow-lg ${item.span}`}
            >
              {/* Grayscale to Color Effect */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={item.url}
                  alt={`Lookbook ${index + 1}`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                
                {/* Hover Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white text-center">
                    <p className="text-sm font-semibold tracking-widest uppercase bg-white text-black px-6 py-2">
                      View Details
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
            onClick={() => {
              alert('Explore Full Lookbook\n\nThis would navigate to a dedicated lookbook gallery page in a complete ecommerce site.')
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-black text-black px-12 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
          >
            Explore Full Lookbook
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
