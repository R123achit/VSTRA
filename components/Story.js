import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Story() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Removed pin effect for better performance
      
      // Simplified text animation
      gsap.from(textRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        x: -30,
        opacity: 0,
        duration: 0.8,
      })

      // Removed parallax for better performance
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="story" ref={sectionRef} className="relative h-screen bg-black text-white overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        ref={imageRef}
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80')",
          transform: 'scale(1.2)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-6 lg:px-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            <motion.div
              ref={textRef}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-none">
                Our Story
              </h2>
              
              <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-gray-300">
                <p>
                  VSTRA blends minimalism with modern street fashion, creating timeless pieces that transcend trends.
                </p>
                <p>
                  Founded on the principle that less is more, we craft each garment with meticulous attention to detail, using only the finest materials.
                </p>
                <p>
                  Our vision is simple: redefine elegance for the modern era.
                </p>
              </div>

              <motion.button
                onClick={() => {
                  document.getElementById('lookbook')?.scrollIntoView({ behavior: 'smooth' })
                }}
                whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
                whileTap={{ scale: 0.95 }}
                className="mt-12 border-2 border-white text-white px-10 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-300 cursor-pointer"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        viewport={{ once: true }}
        className="absolute bottom-10 right-10 text-[200px] font-bold tracking-tighter leading-none pointer-events-none hidden lg:block"
      >
        V
      </motion.div>
    </section>
  )
}
