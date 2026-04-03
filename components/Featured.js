import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import WishlistButton from './WishlistButton'
import { useCartStore } from '../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

function FeaturedCard({ product, index }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to bag', {
      style: { background: '#000', color: '#fff', fontSize: '13px', letterSpacing: '0.5px' },
      iconTheme: { primary: '#fff', secondary: '#000' },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group"
    >
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5] cursor-pointer">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Wishlist */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} size="md" />
          </div>

          {/* Quick Add on hover */}
          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className="w-full bg-black/90 text-white py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-black transition-colors disabled:bg-gray-400"
            >
              {product.stock === 0 ? 'Sold Out' : 'Quick Add'}
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="pt-3 pb-1">
        <p className="text-[11px] text-gray-400 tracking-[0.08em] uppercase mb-0.5">
          {product.brand || 'VSTRA'}
        </p>
        <Link href={`/product/${product._id}`}>
          <h3 className="text-[13px] text-black leading-snug cursor-pointer hover:underline underline-offset-2 line-clamp-2 mb-1.5">
            {product.name}
          </h3>
        </Link>
        {product.colors && product.colors.length > 1 && (
          <div className="flex gap-1 mb-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                className="w-3 h-3 border border-gray-200"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}
        <p className="text-[14px] text-black">
          ₹ {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
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
      const response = await axios.get(`/api/products?featured=true&limit=8&_t=${Date.now()}`)
      setProducts(response.data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  if (products.length === 0) return null

  return (
    <section className="bg-white py-20 px-4 lg:px-8">
      <div className="max-w-[1440px] mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-10 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-[13px] tracking-[0.3em] uppercase text-gray-400 mb-2">
              Curated
            </h2>
            <p className="text-2xl md:text-3xl text-black font-normal tracking-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Handpicked for you
            </p>
          </div>
          <Link href="/shop">
            <span className="text-[12px] tracking-[0.2em] uppercase text-black border-b border-black pb-0.5 cursor-pointer hover:text-gray-500 hover:border-gray-500 transition-colors hidden md:inline">
              View All
            </span>
          </Link>
        </div>

        {/* Product grid — 4 columns like Westside */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[2px] gap-y-8">
          {products.map((product, index) => (
            <FeaturedCard key={product._id} product={product} index={index} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-10 md:hidden">
          <Link href="/shop">
            <span className="text-[12px] tracking-[0.2em] uppercase text-black border-b border-black pb-0.5 cursor-pointer">
              View All Products
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
