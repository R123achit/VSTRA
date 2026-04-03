import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AutoApplyOffer from '../components/AutoApplyOffer'
import PremiumOfferSystem from '../components/PremiumOfferSystem'
import WishlistButton from '../components/WishlistButton'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useCartStore, useAuthStore, useWishlistStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Cart() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount, addToCart } = useCartStore()
  const { isAuthenticated, user, token } = useAuthStore()
  const { addToWishlist } = useWishlistStore()
  const [couponCode, setCouponCode] = useState('')
  const [appliedOffer, setAppliedOffer] = useState(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)
  const recScrollRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  // Fetch "You May Also Like" recommendations based on cart items
  useEffect(() => {
    if (mounted && items.length > 0) {
      fetchRecommendations()
    }
  }, [mounted, items.length])

  const fetchRecommendations = async () => {
    try {
      setRecsLoading(true)
      // Get category of items in cart for related recommendations
      const categories = [...new Set(items.map(i => i.category).filter(Boolean))]
      const cat = categories[0] || 'all'
      const { data } = await axios.get('/api/products', {
        params: { category: cat, sort: 'popular', _t: Date.now() }
      })
      // Filter out items already in cart and limit to 12
      const cartIds = items.map(i => i._id)
      const filtered = (data.data || []).filter(p => !cartIds.includes(p._id)).slice(0, 12)
      setRecommendations(filtered.length > 0 ? filtered : (data.data || []).slice(0, 12))
    } catch {
      // Fallback: fetch all products
      try {
        const { data } = await axios.get('/api/products', { params: { sort: 'newest' } })
        setRecommendations((data.data || []).slice(0, 12))
      } catch { /* silent */ }
    } finally {
      setRecsLoading(false)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your bag is empty')
      return
    }
    if (appliedOffer) {
      localStorage.setItem('appliedOffer', JSON.stringify(appliedOffer))
    }
    router.push('/checkout')
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Please enter a coupon code'); return }
    setValidatingCoupon(true)
    try {
      const { data } = await axios.post('/api/offers/validate', {
        code: couponCode.toUpperCase(),
        cartItems: items,
        cartTotal: getCartTotal(),
      })
      if (data.success) {
        setAppliedOffer({ ...data.offer, discount: data.discount, finalTotal: data.finalTotal })
        toast.success(data.message || `Coupon applied! You saved ₹${Math.round(data.discount)}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
    } finally { setValidatingCoupon(false) }
  }

  const handleRemoveCoupon = () => {
    setAppliedOffer(null)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const handleMoveToWishlist = (item) => {
    const added = addToWishlist({
      _id: item._id, name: item.name, price: item.price,
      originalPrice: item.originalPrice || item.price,
      image: item.image, category: item.category
    })
    removeFromCart(item._id, item.size, item.color)
    toast.success(added ? 'Moved to Wishlist ❤️' : 'Removed from bag (already in wishlist)')
  }

  const handleQuickAdd = (product) => {
    addToCart({
      _id: product._id, name: product.name, price: product.price,
      image: product.images[0],
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to bag', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '13px', letterSpacing: '0.5px', borderRadius: '0' },
      iconTheme: { primary: '#fff', secondary: '#1a1a1a' },
    })
  }

  const getDiscountedTotal = () => {
    const subtotal = getCartTotal()
    return appliedOffer ? Math.max(0, subtotal - appliedOffer.discount) : subtotal
  }

  const getTotalMRP = () => items.reduce((t, i) => t + (i.originalPrice || i.price) * i.quantity, 0)
  const getMRPDiscount = () => getTotalMRP() - getCartTotal()

  const FREE_DELIVERY_THRESHOLD = 999
  const cartTotal = getCartTotal()
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - cartTotal)
  const deliveryProgress = Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100)
  const deliveryCharge = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : 49

  const scrollRecs = (dir) => {
    if (!recScrollRef.current) return
    recScrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <>
      <Head>
        <title>Shopping Bag ({mounted ? getCartCount() : 0}) - VSTRA</title>
        <meta name="description" content="Your VSTRA shopping bag" />
      </Head>
      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />

      <main
        className="min-h-screen bg-[#f5f3f0] transition-all duration-300"
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-0">

          {/* ─── Breadcrumb ─── */}
          <div className="py-4">
            <div className="flex items-center gap-2 text-[12px] text-neutral-400">
              <Link href="/"><span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Home</span></Link>
              <span>/</span>
              <span className="text-[#1a1a1a] font-semibold">Shopping Bag</span>
            </div>
          </div>

          {/* ─── Cart Header ─── */}
          <div className="flex items-center justify-between pb-6">
            <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#1a1a1a] tracking-tight">
              Shopping Bag
            </h1>
            {mounted && items.length > 0 && (
              <span className="text-[14px] text-neutral-400">
                {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {/* ─── Main Content ─── */}
          {mounted && items.length === 0 ? (
            /* ── Empty Bag ── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-center py-20 sm:py-28 px-6 mb-12"
            >
              <div className="mb-8">
                <svg className="w-24 h-24 mx-auto text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-[22px] font-semibold text-[#1a1a1a] mb-3">
                Your bag is empty
              </h2>
              <p className="text-neutral-400 text-[15px] mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your bag yet. Explore our collections and find something you love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/shop')}
                  className="bg-[#1a1a1a] text-white px-10 py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-black transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push('/wishlist')}
                  className="border border-neutral-300 text-[#1a1a1a] px-10 py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-[#1a1a1a] transition-colors"
                >
                  View Wishlist
                </button>
              </div>

              {!isAuthenticated && (
                <div className="mt-12 pt-8 border-t border-neutral-100 max-w-sm mx-auto">
                  <p className="text-[14px] text-neutral-500">
                    <Link href="/auth/login">
                      <span className="text-[#1a1a1a] underline underline-offset-2 font-medium cursor-pointer hover:text-neutral-600">Log in</span>
                    </Link>{' '}to check out faster and see your saved items.
                  </p>
                </div>
              )}
            </motion.div>
          ) : mounted && (
            /* ── Cart Items + Summary ── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">

              {/* ── Left: Cart Items ── */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-0">

                {/* Free Delivery Banner */}
                {remainingForFreeDelivery > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white px-6 py-4 mb-3 flex items-center gap-4"
                  >
                    <div className="w-8 h-8 bg-[#f5f3f0] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-[#1a1a1a]">
                        Add <span className="font-semibold">₹{Math.round(remainingForFreeDelivery)}</span> more for <span className="font-semibold text-green-700">FREE delivery</span>
                      </p>
                      <div className="w-full bg-neutral-100 h-[3px] mt-2 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${deliveryProgress}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-[#1a1a1a] rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Item Cards */}
                <div className="bg-white divide-y divide-neutral-100">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item._id}-${item.size}-${item.color}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="p-5 sm:p-6"
                      >
                        <div className="flex gap-4 sm:gap-6">
                          {/* Product Image */}
                          <Link href={`/product/${item._id}`}>
                            <div className="relative w-[100px] h-[130px] sm:w-[120px] sm:h-[160px] flex-shrink-0 cursor-pointer group overflow-hidden bg-[#f2f0ed]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {/* Brand */}
                                <p className="text-[10px] text-neutral-400 tracking-[0.12em] uppercase font-medium mb-0.5">
                                  {item.brand || 'VSTRA'}
                                </p>
                                <Link href={`/product/${item._id}`}>
                                  <h3 className="text-[14px] sm:text-[15px] font-medium text-[#1a1a1a] hover:underline underline-offset-2 cursor-pointer line-clamp-2 leading-snug">
                                    {item.name}
                                  </h3>
                                </Link>
                              </div>
                              {/* Delete */}
                              <button
                                onClick={() => removeFromCart(item._id, item.size, item.color)}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0 rounded-full"
                                title="Remove"
                              >
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Size & Color */}
                            <div className="flex items-center gap-3 mt-2 text-[12px] text-neutral-500">
                              {item.size && <span>Size: <span className="text-[#1a1a1a] font-medium">{item.size}</span></span>}
                              {item.size && item.color && <span className="text-neutral-200">|</span>}
                              {item.color && <span>Color: <span className="text-[#1a1a1a] font-medium">{item.color}</span></span>}
                            </div>

                            {/* Price + Quantity Row */}
                            <div className="flex items-end justify-between mt-auto pt-3">
                              {/* Price */}
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[16px] font-semibold text-[#1a1a1a]">₹{item.price.toLocaleString()}</span>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="text-[12px] text-neutral-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                                  )}
                                </div>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <p className="text-[11px] text-[#c0392b] font-medium mt-0.5">
                                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                                  </p>
                                )}
                              </div>

                              {/* Quantity */}
                              <div className="flex items-center border border-neutral-200">
                                <button
                                  onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-[#1a1a1a] hover:bg-neutral-50 transition-colors text-[14px]"
                                >
                                  −
                                </button>
                                <span className="w-9 h-8 flex items-center justify-center text-[13px] font-medium text-[#1a1a1a] border-x border-neutral-200 bg-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-[#1a1a1a] hover:bg-neutral-50 transition-colors text-[14px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Move to Wishlist */}
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="flex items-center gap-1.5 mt-3 text-[11px] tracking-[0.05em] text-neutral-400 hover:text-[#1a1a1a] transition-colors self-start uppercase font-medium"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              Move to Wishlist
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Continue Shopping */}
                <button
                  onClick={() => router.push('/shop')}
                  className="mt-4 flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase text-neutral-500 hover:text-[#1a1a1a] transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Continue Shopping
                </button>
              </div>

              {/* ── Right: Order Summary ── */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-32 space-y-4">

                  {/* Guest Login */}
                  {!isAuthenticated && (
                    <div className="bg-white p-5">
                      <p className="text-[13px] text-neutral-500">
                        <Link href="/auth/login">
                          <span className="text-[#1a1a1a] underline underline-offset-2 font-medium cursor-pointer">Log in</span>
                        </Link>{' '}to check out faster.
                      </p>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                      <h3 className="text-[13px] font-semibold text-[#1a1a1a] uppercase tracking-[0.05em]">Apply Coupon</h3>
                    </div>

                    {!appliedOffer && (
                      <AutoApplyOffer cartItems={items} cartTotal={getCartTotal()} onApplyOffer={setAppliedOffer} />
                    )}

                    {!appliedOffer ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2.5 border border-neutral-200 text-[13px] focus:outline-none focus:border-[#1a1a1a] transition-colors bg-white"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon}
                          className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-black transition-colors disabled:opacity-50"
                        >
                          {validatingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-[13px] font-semibold text-green-800">{appliedOffer.code}</p>
                            <p className="text-[11px] text-green-600">-₹{Math.round(appliedOffer.discount)} saved</p>
                          </div>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-[11px] text-red-500 hover:text-red-700 font-medium">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100">
                      <h2 className="text-[13px] font-semibold text-[#1a1a1a] uppercase tracking-[0.08em]">Order Summary</h2>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-neutral-500">Total MRP ({getCartCount()} items)</span>
                        <span className="text-[#1a1a1a] font-medium">₹{getTotalMRP().toLocaleString()}</span>
                      </div>

                      {getMRPDiscount() > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-neutral-500">Discount on MRP</span>
                          <span className="text-green-700 font-medium">-₹{getMRPDiscount().toLocaleString()}</span>
                        </div>
                      )}

                      {appliedOffer && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-neutral-500">Coupon ({appliedOffer.code})</span>
                          <span className="text-green-700 font-medium">-₹{Math.round(appliedOffer.discount).toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[13px]">
                        <span className="text-neutral-500">Delivery</span>
                        <span className={`font-medium ${deliveryCharge === 0 ? 'text-green-700' : 'text-[#1a1a1a]'}`}>
                          {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                        </span>
                      </div>

                      <div className="border-t border-dashed border-neutral-200 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] font-semibold text-[#1a1a1a]">Total Amount</span>
                          <div className="text-right">
                            <span className={`text-[18px] font-bold ${appliedOffer ? 'text-green-700' : 'text-[#1a1a1a]'}`}>
                              ₹{(getDiscountedTotal() + deliveryCharge).toLocaleString()}
                            </span>
                            {(getMRPDiscount() > 0 || appliedOffer) && (
                              <p className="text-[11px] text-green-700 font-medium mt-0.5">
                                You save ₹{(getMRPDiscount() + (appliedOffer?.discount || 0)).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <div className="px-5 pb-5">
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-[#1a1a1a] text-white py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-black transition-colors"
                      >
                        Proceed to Checkout
                      </button>

                      {cartTotal < FREE_DELIVERY_THRESHOLD && (
                        <button
                          onClick={() => router.push('/shop')}
                          className="w-full mt-2 py-3 text-[12px] font-medium tracking-[0.05em] text-neutral-500 border border-neutral-200 hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
                        >
                          Shop for ₹{Math.round(remainingForFreeDelivery)} more for free delivery
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-between px-4 py-4 bg-white">
                    {[
                      { icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', label: '100% Genuine' },
                      { icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.023 9.348v4.992', label: 'Easy Returns' },
                      { icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12', label: 'Free Shipping' },
                      { icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z', label: 'Secure Payment' },
                    ].map((badge) => (
                      <div key={badge.label} className="flex flex-col items-center gap-1.5">
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                        </svg>
                        <span className="text-[10px] text-neutral-400 font-medium tracking-wide">{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ You May Also Like ═══ */}
        {mounted && recommendations.length > 0 && (
          <div className="bg-white py-10 sm:py-14 mt-4">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1a1a1a] tracking-tight">
                  You May Also Like
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollRecs(-1)}
                    className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:border-[#1a1a1a] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollRecs(1)}
                    className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:border-[#1a1a1a] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Products Row */}
              {recsLoading ? (
                <div className="flex gap-4 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] animate-pulse">
                      <div className="aspect-[3/4] bg-[#f2f0ed] mb-3" />
                      <div className="h-2.5 bg-[#f2f0ed] w-14 mb-2 rounded" />
                      <div className="h-3 bg-[#f2f0ed] w-32 mb-2 rounded" />
                      <div className="h-3 bg-[#f2f0ed] w-16 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  ref={recScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
                  {recommendations.map((product) => (
                    <RecommendationCard
                      key={product._id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty cart also shows recommendations */}
        {mounted && items.length === 0 && recommendations.length === 0 && (
          <EmptyRecommendations />
        )}
      </main>

      <Footer />
    </>
  )
}

/* ═══ Recommendation Card ═══ */
function RecommendationCard({ product, onQuickAdd }) {
  const [hovered, setHovered] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <div
      className="flex-shrink-0 w-[180px] sm:w-[210px] group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f0ed] cursor-pointer mb-3">
          {!imgLoaded && <div className="absolute inset-0 bg-[#eae8e4] animate-pulse" />}
          <img
            src={hovered && product.images?.length > 1 ? product.images[1] : product.images?.[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${hovered ? 'scale-[1.03]' : 'scale-100'}`}
            loading="lazy"
          />

          {/* Wishlist */}
          <div className="absolute top-2 right-2 z-10" onClick={(e) => e.preventDefault()}>
            <WishlistButton product={product} size="sm" />
          </div>

          {/* Badges */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-[#c0392b] text-white text-[8px] tracking-[0.1em] px-2 py-0.5 uppercase font-medium z-10">
              -{discount}%
            </span>
          )}

          {/* Quick Add */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAdd(product) }}
          >
            <button className="w-full bg-[#1a1a1a]/95 text-white py-2.5 text-[9px] tracking-[0.2em] uppercase font-medium hover:bg-black transition-colors">
              + Add to Bag
            </button>
          </div>

          {/* Image dots */}
          {product.images?.length > 1 && (
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 transition-opacity ${hovered ? 'opacity-0' : 'opacity-100'}`}>
              {product.images.slice(0, 3).map((_, idx) => (
                <span key={idx} className={`w-1 h-1 rounded-full ${idx === 0 ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a]/25'}`} />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <p className="text-[9px] text-neutral-400 tracking-[0.12em] uppercase font-medium mb-0.5">
        {product.brand || 'VSTRA'}
      </p>
      <Link href={`/product/${product._id}`}>
        <h3 className="text-[12px] text-[#1a1a1a] leading-snug cursor-pointer hover:underline underline-offset-2 decoration-neutral-300 line-clamp-2 mb-1.5 font-normal">
          {product.name}
        </h3>
      </Link>
      <div className="flex items-baseline gap-1.5">
        <p className="text-[13px] text-[#1a1a1a] font-medium">₹{product.price?.toLocaleString('en-IN')}</p>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <>
            <p className="text-[11px] text-neutral-400 line-through">₹{product.compareAtPrice?.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-[#c0392b] font-medium">({discount}% off)</p>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══ Empty state recommendations fetch ═══ */
function EmptyRecommendations() {
  const [products, setProducts] = useState([])
  const scrollRef = useRef(null)
  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    axios.get('/api/products', { params: { sort: 'popular', _t: Date.now() } })
      .then(({ data }) => setProducts((data.data || []).slice(0, 12)))
      .catch(() => {})
  }, [])

  const handleAdd = (product) => {
    addToCart({
      _id: product._id, name: product.name, price: product.price,
      image: product.images[0],
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to bag')
  }

  if (products.length === 0) return null

  return (
    <div className="bg-white py-10 sm:py-14 mt-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1a1a1a] tracking-tight mb-6">
          Trending Now
        </h2>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <RecommendationCard key={product._id} product={product} onQuickAdd={handleAdd} />
          ))}
        </div>
      </div>
    </div>
  )
}
