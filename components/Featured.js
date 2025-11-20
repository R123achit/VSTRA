import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import Link from 'next/link'
import WishlistButton from './WishlistButton'
import { useCartStore } from '../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function ProductCard({ product, index }) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-7, 7])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const defaultSize = product.sizes?.[0] || 'M'
    const defaultColor = product.colors?.[0] || { name: 'Default', hex: '#000000' }
    
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: defaultSize,
      color: defaultColor.name,
    })
    
    toast.success(`${product.name} added to cart!`)
  }

  return (
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
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className="product-card group relative"
    >
      <Link href={`/product/${product._id}`}>
        <div className="relative overflow-hidden bg-gray-100 mb-6 aspect-[3/4] shadow-2xl cursor-pointer">
          {/* Holographic Effect */}
          <motion.div
            className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${(x.get() + 0.5) * 100}% ${(y.get() + 0.5) * 100}%, 
                rgba(168, 85, 247, 0.3) 0%, 
                rgba(236, 72, 153, 0.2) 25%, 
                transparent 50%)`
            }}
          />

          {/* Image */}
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{
              scale: isHovered ? 1.1 : 1,
              filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
            }}
            transition={{ duration: 0.7 }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 z-20"
            style={{
              boxShadow: isHovered ? '0 0 30px rgba(168, 85, 247, 0.5) inset' : 'none'
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Wishlist Button */}
          <motion.div 
            className="absolute top-4 right-4 z-30"
            initial={{ opacity: 0, scale: 0 }}
            animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WishlistButton product={product} size="md" />
          </motion.div>

          {/* Quick View Badge */}
          <motion.div
            className="absolute top-4 left-4 z-30 bg-black/80 backdrop-blur-sm text-white px-3 py-1 text-xs font-semibold"
            initial={{ opacity: 0, x: -20 }}
            animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            FEATURED
          </motion.div>

          {/* Removed particles for performance */}
        </div>
      </Link>

      {/* Product Info */}
      <motion.div 
        className="text-center space-y-3"
        style={{
          transform: isHovered ? 'translateZ(30px)' : 'translateZ(0px)',
          transformStyle: 'preserve-3d'
        }}
      >
        <Link href={`/product/${product._id}`}>
          <motion.h3 
            className="text-xl font-semibold tracking-tight mb-2 text-black cursor-pointer"
            whileHover={{ 
              scale: 1.05,
              color: '#a855f7'
            }}
          >
            {product.name}
          </motion.h3>
        </Link>
        
        <p className="text-gray-600 text-lg font-light tracking-wide">
          ₹{product.price}
        </p>

        {product.rating > 0 && (
          <div className="flex items-center justify-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.numReviews})
            </span>
          </div>
        )}

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleQuickAdd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-full bg-black text-white py-3 text-sm font-semibold tracking-wider uppercase overflow-hidden group/btn"
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
            initial={{ x: '-100%' }}
            whileHover={{ x: '0%' }}
            transition={{ duration: 0.5 }}
          />
          <span className="relative z-10">Add to Cart</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function Featured() {
  const sectionRef = useRef(null)
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products?featured=true&limit=6')
      setProducts(response.data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  return (
    <section id="featured" ref={sectionRef} className="relative py-32 px-6 lg:px-12 bg-white overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-3xl" />
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
            Featured
          </h2>
          <motion.p 
            className="text-gray-600 text-lg tracking-wide"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Handpicked essentials for the season
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase overflow-hidden group cursor-pointer"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">View All Products</span>
              
              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

