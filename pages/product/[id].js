import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import WishlistButton from '../../components/WishlistButton'
import CompareButton from '../../components/CompareButton'
import ComparisonBar from '../../components/ComparisonBar'
import PremiumOfferSystem from '../../components/PremiumOfferSystem'
import ReviewSection from '../../components/ReviewSection'
import StyleAssistant from '../../components/StyleAssistant'
import SizeGuide from '../../components/SizeGuide'
import ScrollToTop from '../../components/ScrollToTop'
import TrustBadges from '../../components/TrustBadges'
import { useCartStore } from '../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [offersBarVisible, setOffersBarVisible] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    const handleOffersBarVisibility = (e) => {
      setOffersBarVisible(e.detail.visible)
    }
    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    return () => window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
  }, [])

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/products/${id}`)
      const productData = response.data.data
      setProduct(productData)
      setSelectedSize(productData.sizes?.[0] || '')
      setSelectedColor(productData.colors?.[0] || null)
      
      // Add to recently viewed
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      const filtered = recentlyViewed.filter(p => p._id !== productData._id)
      const updated = [productData, ...filtered].slice(0, 10)
      localStorage.setItem('recentlyViewed', JSON.stringify(updated))
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

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

    toast.success(`${product.name} added to cart!`)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Product not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{product.name} - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />
      <StyleAssistant />
      <ComparisonBar />

      <main 
        className="pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 transition-all duration-300"
        style={{ 
          paddingTop: offersBarVisible ? '10rem' : '7rem',
          minHeight: '100vh'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
            {/* Images - Flipkart Style */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              {/* Thumbnail Column - Premium Style */}
              {product.images.length > 1 && (
                <div className="flex flex-col gap-3 w-16 sm:w-20">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-white overflow-hidden cursor-pointer rounded-lg transition-all duration-300 ${
                        selectedImageIndex === idx
                          ? 'ring-2 ring-black ring-offset-2 shadow-xl scale-105 opacity-100'
                          : 'opacity-60 hover:opacity-100 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Image - Premium Style */}
              <div className="flex-1">
                <div 
                  className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative group rounded-2xl cursor-zoom-in shadow-2xl border border-gray-200/50"
                  onClick={() => setIsZoomed(true)}
                >
                  {/* Subtle gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none z-10" />
                  
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  
                  {/* Premium glass-morphism buttons */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-20">
                    <div className="backdrop-blur-md bg-white/80 rounded-full p-1 shadow-lg">
                      <CompareButton product={product} size="lg" />
                    </div>
                    <div className="backdrop-blur-md bg-white/80 rounded-full p-1 shadow-lg">
                      <WishlistButton product={product} size="lg" />
                    </div>
                  </div>
                  
                  {/* Premium zoom hint with icon */}
                  <div className="absolute bottom-6 right-6 backdrop-blur-md bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 shadow-xl">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Click to zoom
                  </div>
                  
                  {/* Image indicator dots */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {product.images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            selectedImageIndex === idx
                              ? 'w-8 bg-white shadow-lg'
                              : 'w-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Premium Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                      className="absolute left-20 sm:left-24 top-1/2 -translate-y-1/2 backdrop-blur-md bg-white/90 hover:bg-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-gray-200/50"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-md bg-white/90 hover:bg-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-gray-200/50"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Zoom Modal */}
            {isZoomed && (
              <div 
                className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                onClick={() => setIsZoomed(false)}
              >
                <button
                  onClick={() => setIsZoomed(false)}
                  className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="relative max-w-5xl max-h-[90vh] w-full">
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Zoom Navigation */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Image counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        {selectedImageIndex + 1} / {product.images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  {product.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <p className="text-2xl sm:text-3xl font-semibold">₹{product.price}</p>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.numReviews} reviews)
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold">
                      Size
                    </label>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Size Guide
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {product.sizes.map((size) => (
                      <motion.button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all ${
                          selectedSize === size
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Color
                  </label>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          selectedColor?.name === color.name
                            ? 'border-black scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 hover:border-black transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 hover:border-black transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                {product.stock > 0 ? (
                  <p className="text-green-600 text-sm">
                    In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-red-600 text-sm">Out of Stock</p>
                )}
              </div>

              {/* Add to Cart & Wishlist */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-black text-white py-3 sm:py-4 text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <div className="flex items-center">
                  <WishlistButton product={product} size="lg" showLabel />
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold">
                    <span>Product Details</span>
                    <svg
                      className="w-5 h-5 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-sm text-gray-600 space-y-2">
                    <p>Category: {product.category}</p>
                    {product.subcategory && <p>Subcategory: {product.subcategory}</p>}
                  </div>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold">
                    <span>Shipping & Returns</span>
                    <svg
                      className="w-5 h-5 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-sm text-gray-600 space-y-2">
                    <p>Free shipping on orders over $100</p>
                    <p>30-day return policy</p>
                    <p>Ships within 2-3 business days</p>
                  </div>
                </details>
              </div>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16">
            <TrustBadges />
          </div>

          {/* Reviews Section */}
          <div className="mt-20">
            <ReviewSection productId={product._id} />
          </div>
        </div>
      </main>

      <SizeGuide 
        isOpen={showSizeGuide} 
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />
      <ScrollToTop />
      <Footer />
    </>
  )
}
