import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import WishlistButton from './WishlistButton'
import { useCartStore } from '../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

function ProductCard({ product, index }) {
  const [isHovered, setIsHovered] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link href={`/product/${product._id}`}>
        <div className="relative overflow-hidden bg-gray-100 mb-6 aspect-[3/4] cursor-pointer">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton product={product} size="md" />
          </div>

          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-semibold">
              Only {product.stock} left
            </div>
          )}
        </div>
      </Link>

      <div className="text-center space-y-3">
        <Link href={`/product/${product._id}`}>
          <h3 className="text-xl font-semibold tracking-tight mb-2 text-black cursor-pointer hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
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

        <button
          onClick={handleQuickAdd}
          className="w-full bg-black text-white py-3 text-sm font-semibold tracking-wider uppercase hover:bg-purple-600 transition-colors"
        >
          Add to Cart
        </button>
      </div>
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
      const response = await axios.get('/api/products?featured=true&limit=6')
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <button className="bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-purple-600 transition-colors cursor-pointer">
              View All Products
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
