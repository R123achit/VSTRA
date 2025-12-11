import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCartStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState([])
  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    setRecentProducts(recent.slice(0, 4))
  }, [])

  const handleQuickAdd = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to cart!')
  }

  if (recentProducts.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Recently Viewed</h2>
            <p className="text-sm sm:text-base text-gray-600">Pick up where you left off</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('recentlyViewed')
              setRecentProducts([])
              toast.success('History cleared')
            }}
            className="text-xs sm:text-sm text-gray-600 hover:text-black transition-colors whitespace-nowrap"
          >
            Clear History
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {recentProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <Link href={`/product/${product._id}`}>
                <div className="relative aspect-[3/4] overflow-hidden cursor-pointer">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              <div className="p-3 sm:p-4">
                <Link href={`/product/${product._id}`}>
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-2 hover:text-gray-600 transition-colors cursor-pointer line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">₹{product.price.toFixed(2)}</p>
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="w-full bg-black text-white py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-900 transition-colors"
                >
                  Quick Add
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
