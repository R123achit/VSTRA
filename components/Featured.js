import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import WishlistButton from './WishlistButton'
import CompareButton from './CompareButton'
import { useCartStore } from '../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

function ProductCard({ product, index }) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * -15
    const rotateYValue = ((x - centerX) / centerX) * 15
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="group relative"
    >
      <motion.div
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <Link href={`/product/${product._id}`}>
          <div 
            className="relative overflow-hidden bg-gray-100 mb-6 aspect-[3/4] cursor-pointer rounded-lg"
            style={{
              transform: 'translateZ(50px)',
              boxShadow: isHovered 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.4)' 
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
            />

            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F4E4C1]/30 to-transparent"
              animate={{
                x: isHovered ? ['0%', '100%'] : '-100%',
              }}
              transition={{ duration: 0.6 }}
              style={{ transform: 'translateZ(60px)' }}
            />

            <motion.div 
              className="absolute top-4 right-4 z-10 flex gap-2"
              animate={{ 
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
              style={{ transform: 'translateZ(80px)' }}
            >
              <CompareButton product={product} size="md" />
              <WishlistButton product={product} size="md" />
            </motion.div>

            {product.stock < 10 && product.stock > 0 && (
              <motion.div 
                className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-semibold rounded"
                style={{ transform: 'translateZ(70px)' }}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                }}
              >
                Only {product.stock} left
              </motion.div>
            )}

            {/* 3D Border glow */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              animate={{
                boxShadow: isHovered 
                  ? 'inset 0 0 30px rgba(212, 175, 55, 0.5)' 
                  : 'inset 0 0 0px rgba(212, 175, 55, 0)',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </Link>

        <motion.div 
          className="flex flex-col space-y-3 p-4"
          style={{ transform: 'translateZ(40px)' }}
        >
          {/* Product Name */}
          <Link href={`/product/${product._id}`}>
            <motion.h3 
              className="text-lg sm:text-xl font-semibold tracking-tight text-black cursor-pointer line-clamp-2 min-h-[3.5rem]"
              whileHover={{ color: '#D4AF37', scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {product.name}
            </motion.h3>
          </Link>
          
          {/* Price Section */}
          <div className="flex items-baseline gap-2 py-2">
            <motion.p 
              className="text-xl sm:text-2xl font-bold text-black"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              ₹{product.price}
            </motion.p>
            {product.compareAtPrice && (
              <p className="text-sm text-gray-400 line-through">
                ₹{product.compareAtPrice}
              </p>
            )}
          </div>

          {/* Rating Section */}
          {product.rating > 0 && (
            <motion.div 
              className="flex items-center gap-1 py-1"
              animate={{ y: isHovered ? -3 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-yellow-500 text-base">★</span>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.numReviews} reviews)
              </span>
            </motion.div>
          )}

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleQuickAdd}
            className="w-full bg-black text-white py-3 px-4 md:py-4 text-sm md:text-base font-semibold tracking-wider uppercase rounded-lg overflow-hidden relative shadow-lg hover:shadow-xl mt-auto min-h-[48px] md:min-h-[52px] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            whileHover={{ 
              scale: 1.02,
              backgroundColor: '#1f2937',
            }}
            whileTap={{ scale: 0.98 }}
            style={{ transform: 'translateZ(60px)' }}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
              initial={{ x: '-100%' }}
              whileHover={{ x: '0%' }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">Add to Cart</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function Featured() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/products?featured=true&limit=6&_t=${Date.now()}`)
      setProducts(response.data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  return (
    <section id="featured" className="relative py-32 px-6 lg:px-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            Featured
          </h2>
          <p className="text-gray-600 text-lg tracking-wide">
            Handpicked essentials for the season
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>

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
              className="bg-black text-white px-12 py-4 md:py-5 text-sm md:text-base font-semibold tracking-widest uppercase hover:bg-gray-900 transition-all duration-300 cursor-pointer rounded-lg shadow-lg hover:shadow-xl min-h-[52px] md:min-h-[56px] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
