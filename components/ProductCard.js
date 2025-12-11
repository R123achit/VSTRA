import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '../store/useStore'
import WishlistButton from './WishlistButton'
import CompareButton from './CompareButton'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0, onQuickView }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleQuickAdd = (e) => {
    e.preventDefault()
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

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-gray-100">
          {/* Skeleton Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          )}
          
          {/* Product Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.stock < 10 && product.stock > 0 && (
              <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                Only {product.stock} left
              </span>
            )}
            {discount > 0 && (
              <span className="bg-green-600 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                {discount}% OFF
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-900 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                Out of Stock
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                onQuickView?.(product)
              }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
              title="Quick View"
            >
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </motion.button>
            <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
              <CompareButton product={product} size="md" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
              <WishlistButton product={product} size="md" />
            </div>
          </div>
          
          {/* Quick Add Button - Bottom */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="absolute bottom-4 left-4 right-4 bg-black text-white py-3 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
          </motion.button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <Link href={`/product/${product._id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-gray-600 transition-colors cursor-pointer line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-xl font-bold text-black">
            ₹{Math.max(product.price, 99).toFixed(2)}
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="text-sm text-gray-400 line-through">
              ₹{Math.max(product.compareAtPrice, 99).toFixed(2)}
            </p>
          )}
        </div>
        
        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-base ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-500' 
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              {product.rating.toFixed(1)} ({product.numReviews || 0})
            </span>
          </div>
        )}
        
        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.sizes.slice(0, 4).map((size) => (
              <motion.span 
                key={size}
                whileHover={{ scale: 1.1, borderColor: '#000' }}
                className="text-xs border-2 border-gray-300 bg-white px-2.5 py-1.5 rounded font-semibold hover:border-black transition-all duration-300 cursor-pointer"
              >
                {size}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
