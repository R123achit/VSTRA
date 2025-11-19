import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import Link from 'next/link'
import { useCartStore } from '../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Featured() {
  const sectionRef = useRef(null)
  const [products, setProducts] = useState([])
  const addToCart = useCartStore((state) => state.addToCart)

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

  useEffect(() => {
    if (products.length === 0) return

    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
      })
    })

    return () => ctx.revert()
  }, [products])

  const handleQuickAdd = (product) => {
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
    <section id="featured" ref={sectionRef} className="py-32 px-6 lg:px-12 bg-vstra-light">
      <div className="max-w-7xl mx-auto">
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
          <p className="text-gray-600 text-lg tracking-wide">
            Handpicked essentials for the season
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div
              key={product._id}
              className="product-card group"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/product/${product._id}`}>
                <div className="relative overflow-hidden bg-gray-100 mb-6 aspect-[3/4] shadow-lg cursor-pointer">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                </div>
              </Link>

              <div className="text-center space-y-3">
                <Link href={`/product/${product._id}`}>
                  <h3 className="text-xl font-semibold tracking-tight mb-2 text-black hover:text-gray-600 transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gray-600 text-lg font-light tracking-wide">
                  ${product.price}
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
                  onClick={() => handleQuickAdd(product)}
                  className="w-full bg-black text-white py-3 text-sm font-semibold tracking-wider uppercase hover:bg-gray-900 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/shop">
            <span className="inline-block">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#0a0a0a' }}
                whileTap={{ scale: 0.95 }}
                className="bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase transition-all cursor-pointer"
              >
                View All Products
              </motion.button>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
