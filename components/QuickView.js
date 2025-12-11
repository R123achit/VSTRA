import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useCartStore } from '../store/useStore'
import WishlistButton from './WishlistButton'
import CompareButton from './CompareButton'
import toast from 'react-hot-toast'

export default function QuickView({ product, isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null)
  const [selectedImage, setSelectedImage] = useState(0)
  const addToCart = useCartStore((state) => state.addToCart)

  if (!product) return null

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor?.name || 'Default',
    })

    toast.success('Added to cart!')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
              {/* Images */}
              <div>
                <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3 sm:mb-4">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
                      <CompareButton product={product} size="md" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
                      <WishlistButton product={product} size="md" />
                    </div>
                  </div>
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-black scale-105'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <button
                  onClick={onClose}
                  className="self-end text-gray-400 hover:text-black transition-colors mb-2 sm:mb-4"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">{product.name}</h2>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <p className="text-xl sm:text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.numReviews})
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">{product.description}</p>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Select Size</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                            selectedSize === size
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Select Color</label>
                    <div className="flex gap-2 sm:gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                            selectedColor?.name === color.name
                              ? 'border-black scale-110 shadow-lg'
                              : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                <div className="mb-4 sm:mb-6">
                  {product.stock > 0 ? (
                    <p className="text-green-600 text-xs sm:text-sm font-medium">
                      ✓ In Stock ({product.stock} available)
                    </p>
                  ) : (
                    <p className="text-red-600 text-xs sm:text-sm font-medium">✗ Out of Stock</p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-2 sm:space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full bg-black text-white py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <a
                    href={`/product/${product._id}`}
                    className="block w-full text-center border-2 border-black text-black py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-black hover:text-white transition-colors"
                  >
                    View Full Details
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
