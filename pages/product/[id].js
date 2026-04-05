import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import MLRecommendations from '../../components/MLRecommendations'
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
  const [openSection, setOpenSection] = useState('details')
  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    const handleOffersBarVisibility = (e) => {
      setOffersBarVisible(e.detail.visible)
    }
    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    return () => window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
  }, [])

  useEffect(() => {
    if (id) fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/products/${id}`)
      const productData = response.data.data
      setProduct(productData)
      setSelectedSize(productData.sizes?.[0] || '')
      setSelectedColor(productData.colors?.[0] || null)

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
    if (!selectedSize && product.sizes?.length > 0) {
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
    toast.success(`Added to bag`, {
      style: { background: '#000', color: '#fff', fontSize: '14px', letterSpacing: '0.5px' },
      iconTheme: { primary: '#fff', secondary: '#000' },
    })
  }

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  // Loading skeleton — Westside style
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white" style={{ paddingTop: '7rem' }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
            {/* Breadcrumb skeleton */}
            <div className="h-4 bg-gray-100 rounded w-64 mb-8" />
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Image grid skeleton */}
              <div className="lg:w-[62%] grid grid-cols-2 gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
                ))}
              </div>
              {/* Details skeleton */}
              <div className="lg:w-[38%] space-y-6 pt-4">
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-6 bg-gray-100 rounded w-3/4" />
                <div className="h-8 bg-gray-100 rounded w-1/3" />
                <div className="h-px bg-gray-100 w-full" />
                <div className="h-4 bg-gray-100 rounded w-16" />
                <div className="flex gap-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-12 h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
                <div className="h-14 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <p className="text-lg text-gray-400 tracking-wide">Product not found</p>
          <button
            onClick={() => router.push('/shop')}
            className="mt-6 px-8 py-3 bg-black text-white text-xs tracking-[0.2em] uppercase hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{product.name} — VSTRA</title>
        <meta name="description" content={`Shop ${product.name} from VSTRA. ${product.description?.slice(0, 150)}`} />
      </Head>

      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />
      <StyleAssistant />
      <ComparisonBar />

      <main
        className="bg-white min-h-screen transition-all duration-300"
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        {/* Breadcrumb — Westside style */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-4 pb-6">
          <nav className="flex items-center gap-2 text-[13px] text-gray-400 tracking-wide">
            <a href="/" className="hover:text-black transition-colors">Home</a>
            <span className="text-gray-300">/</span>
            <span className="text-black font-normal">{product.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-20">
          <div className="flex flex-col lg:flex-row gap-0">

            {/* LEFT — Image Gallery Grid (Westside style: 2-column image grid) */}
            <div className="lg:w-[62%] xl:w-[64%]">
              <div className="grid grid-cols-2 gap-[2px]">
                {product.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="aspect-[3/4] bg-[#f5f5f5] overflow-hidden cursor-pointer group relative"
                    onClick={() => {
                      setSelectedImageIndex(idx)
                      setIsZoomed(true)
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Image ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                ))}
                {/* If only 1 image, add a placeholder to keep grid */}
                {product.images.length === 1 && (
                  <div className="aspect-[3/4] bg-[#f5f5f5] flex items-center justify-center">
                    <div className="text-center text-gray-300">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Product Details (Westside style: sticky sidebar) */}
            <div className="lg:w-[38%] xl:w-[36%] lg:pl-10 xl:pl-14">
              <div className="lg:sticky lg:top-32 pt-6 lg:pt-0">

                {/* Brand + Wishlist/Share row */}
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[13px] text-gray-500 tracking-[0.15em] uppercase">
                    {product.brand || 'VSTRA'}
                  </span>
                  <div className="flex items-center gap-3">
                    <WishlistButton product={product} size="md" />
                    <button className="text-gray-400 hover:text-black transition-colors" title="Share">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="text-[18px] lg:text-[20px] text-black font-normal leading-snug tracking-wide mb-4">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-[20px] lg:text-[22px] text-black font-normal tracking-wide">
                    ₹ {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-[14px] text-gray-400 line-through">
                      ₹ {product.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 tracking-wide mb-6">
                  MRP incl. of all taxes
                </p>

                {/* Divider */}
                <div className="h-px bg-gray-200 mb-6" />

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[12px] text-gray-500 tracking-[0.15em] uppercase">Colour</span>
                      <span className="text-[12px] text-black tracking-wide capitalize">— {selectedColor?.name || 'Default'}</span>
                    </div>
                    <div className="flex gap-2.5">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full transition-all duration-200 ${
                            selectedColor?.name === color.name
                              ? 'ring-2 ring-black ring-offset-2'
                              : 'ring-1 ring-gray-200 hover:ring-gray-400'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection — Westside style */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] text-gray-500 tracking-[0.15em] uppercase">Size</span>
                      <button
                        onClick={() => setShowSizeGuide(true)}
                        className="text-[12px] text-black tracking-[0.1em] uppercase underline underline-offset-4 hover:text-gray-600 transition-colors"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[48px] h-[48px] flex items-center justify-center text-[13px] tracking-wide transition-all duration-200 border ${
                            selectedSize === size
                              ? 'border-black text-black bg-white font-medium'
                              : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <span className="text-[12px] text-gray-500 tracking-[0.15em] uppercase block mb-3">Quantity</span>
                  <div className="flex items-center border border-gray-200 inline-flex">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors border-r border-gray-200"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-[14px] text-black">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors border-l border-gray-200"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ADD TO BAG — Westside style: solid black button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-black text-white py-4 text-[13px] tracking-[0.25em] uppercase font-medium hover:bg-[#1a1a1a] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
                >
                  {product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
                </motion.button>

                {/* Stock indicator — subtle */}
                {product.stock > 0 && product.stock < 15 && (
                  <p className="text-[11px] text-gray-400 tracking-wide mb-6">
                    Only {product.stock} left in stock
                  </p>
                )}

                {/* Service icons — Westside style */}
                <div className="flex items-center justify-start gap-10 mb-8 pt-2">
                  <div className="flex flex-col items-center text-center gap-2">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-[10px] text-gray-500 tracking-wide">Free shipping</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-[10px] text-gray-500 tracking-wide">Easy returns</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-[10px] text-gray-500 tracking-wide">Fresh Fashion</span>
                  </div>
                </div>

                {/* Accordion Sections — Westside style */}
                <div className="border-t border-gray-200">

                  {/* Product Details and Overview */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => toggleSection('details')}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="text-[14px] text-black tracking-wide">Product Details and Overview</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSection === 'details' ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {openSection === 'details' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pb-6 space-y-4">
                            {/* Description */}
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                              {product.description}
                            </p>

                            {/* Specs — key: value style like Westside */}
                            <div className="space-y-3 pt-2">
                              {product.sku && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">SKU:</span>
                                  <span className="text-[13px] text-black font-medium">{product.sku}</span>
                                </div>
                              )}
                              {product.fit && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Fit:</span>
                                  <span className="text-[13px] text-black font-medium">{product.fit}</span>
                                </div>
                              )}
                              {product.material && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Fabric Composition:</span>
                                  <span className="text-[13px] text-black font-medium">{product.material}</span>
                                </div>
                              )}
                              {product.pattern && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Pattern:</span>
                                  <span className="text-[13px] text-black font-medium capitalize">{product.pattern}</span>
                                </div>
                              )}
                              {product.neckType && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Neck Type:</span>
                                  <span className="text-[13px] text-black font-medium">{product.neckType}</span>
                                </div>
                              )}
                              {product.sleeveType && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Sleeve Type:</span>
                                  <span className="text-[13px] text-black font-medium">{product.sleeveType}</span>
                                </div>
                              )}
                              {product.occasion && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Occasion:</span>
                                  <span className="text-[13px] text-black font-medium">{product.occasion}</span>
                                </div>
                              )}
                              {product.fabricCare && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Care Instruction:</span>
                                  <span className="text-[13px] text-black font-medium">{product.fabricCare}</span>
                                </div>
                              )}
                              {product.idealFor && (
                                <div className="flex">
                                  <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Ideal For:</span>
                                  <span className="text-[13px] text-black font-medium">{product.idealFor}</span>
                                </div>
                              )}
                              <div className="flex">
                                <span className="text-[13px] text-gray-400 w-44 flex-shrink-0">Country Of Origin:</span>
                                <span className="text-[13px] text-black font-medium">{product.countryOfOrigin || 'India'}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Delivery & Return */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => toggleSection('delivery')}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="text-[14px] text-black tracking-wide">Delivery & Return</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSection === 'delivery' ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {openSection === 'delivery' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pb-6 space-y-3">
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                              Free standard shipping on all orders above ₹999. Orders are typically delivered within 5-7 business days.
                            </p>
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                              We accept returns within 15 days of delivery. Items must be unworn, unwashed, and with all original tags attached.
                            </p>
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                              {product.returnPolicy || '7 Days Replacement Policy'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Contact Us */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => toggleSection('contact')}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="text-[14px] text-black tracking-wide">Contact Us</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSection === 'contact' ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {openSection === 'contact' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pb-6 space-y-2">
                            <p className="text-[13px] text-gray-600">
                              For any product-related queries, reach out to us:
                            </p>
                            <p className="text-[13px] text-gray-600">
                              Email: <span className="text-black">support@vstra.com</span>
                            </p>
                            <p className="text-[13px] text-gray-600">
                              Phone: <span className="text-black">+91 1800-000-0000</span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ML-Powered Recommendations */}
          <div className="mt-16 lg:mt-24 border-t border-gray-200 pt-16 relative">
            <MLRecommendations currentProductId={product._id} category={product.category} />
          </div>

          {/* Reviews Section */}
          <div className="mt-16 lg:mt-24 border-t border-gray-200 pt-16">
            <ReviewSection productId={product._id} />
          </div>
        </div>
      </main>

      {/* Zoom Modal — clean, editorial */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
            onClick={() => setIsZoomed(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 text-black hover:text-gray-500 transition-colors z-10"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main image */}
            <div className="relative w-full h-full flex items-center justify-center p-12">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
                    }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-gray-200 hover:border-black transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-gray-200 hover:border-black transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] text-gray-400 tracking-[0.2em]">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
