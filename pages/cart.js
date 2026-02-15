import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AutoApplyOffer from '../components/AutoApplyOffer'
import PremiumOfferSystem from '../components/PremiumOfferSystem'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useCartStore, useAuthStore, useWishlistStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Cart() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const { addToWishlist } = useWishlistStore()
  const [couponCode, setCouponCode] = useState('')
  const [appliedOffer, setAppliedOffer] = useState(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    setValidatingCoupon(true)
    try {
      const { data } = await axios.post('/api/offers/validate', {
        code: couponCode.toUpperCase(),
        cartItems: items,
        cartTotal: getCartTotal(),
      })
      if (data.success) {
        setAppliedOffer({
          ...data.offer,
          discount: data.discount,
          finalTotal: data.finalTotal
        })
        toast.success(data.message || `Coupon applied! You saved ₹${Math.round(data.discount)}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedOffer(null)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const handleMoveToWishlist = (item) => {
    const added = addToWishlist({
      _id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      image: item.image,
      category: item.category
    })
    removeFromCart(item._id, item.size, item.color)
    if (added) {
      toast.success('Moved to Wishlist ❤️')
    } else {
      toast.success('Removed from bag (already in wishlist)')
    }
  }

  const getDiscountedTotal = () => {
    const subtotal = getCartTotal()
    if (appliedOffer) {
      return Math.max(0, subtotal - appliedOffer.discount)
    }
    return subtotal
  }

  const getTotalMRP = () => {
    return items.reduce((total, item) => {
      const mrp = item.originalPrice || item.price
      return total + mrp * item.quantity
    }, 0)
  }

  const getMRPDiscount = () => {
    return getTotalMRP() - getCartTotal()
  }

  // Free delivery threshold
  const FREE_DELIVERY_THRESHOLD = 999
  const cartTotal = getCartTotal()
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - cartTotal)
  const deliveryProgress = Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100)

  const steps = [
    { num: 1, label: 'Bag', active: true },
    { num: 2, label: 'Details', active: false },
    { num: 3, label: 'Payment', active: false },
  ]

  return (
    <>
      <Head>
        <title>Shopping Bag - VSTRA</title>
        <meta name="description" content="Your VSTRA shopping bag - review and checkout your premium fashion selections" />
      </Head>
      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />

      <main
        className="min-h-screen bg-[#f8f8f8] transition-all duration-300"
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          {/* ── Header ── */}
          <div className="flex items-center justify-between py-8 sm:py-10 border-b border-gray-200">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900"
            >
              Shopping Bag
            </motion.h1>
            <Link href="/wishlist">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-base font-medium text-gray-600 hover:text-black cursor-pointer transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Wishlist
              </motion.span>
            </Link>
          </div>

          {/* ── Step Progress Indicator ── */}
          <div className="py-8 sm:py-10">
            <div className="flex items-center justify-center gap-0 max-w-lg mx-auto">
              {steps.map((step, i) => (
                <div key={step.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 ${
                        step.active
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.num}
                    </div>
                    <span className={`text-sm mt-2 font-medium tracking-wide uppercase ${
                      step.active ? 'text-black' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-20 sm:w-32 h-[2px] mx-3 mt-[-26px] ${
                      step.active ? 'bg-black' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Main Content ── */}
          {mounted && items.length === 0 ? (
            /* ── Empty Bag ── */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20 sm:py-32 px-6"
            >
              <div className="mb-10">
                <svg className="w-36 h-36 mx-auto text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
                Your Bag is Empty
              </h2>
              <p className="text-gray-500 text-xl mb-12 max-w-lg mx-auto">
                Looks like you haven't added anything yet. Explore our collections and find something you love.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/shop')}
                  className="bg-black text-white px-12 py-5 text-lg font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors rounded-xl"
                >
                  Continue Shopping
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/wishlist')}
                  className="border-2 border-gray-300 text-gray-700 px-12 py-5 text-lg font-semibold tracking-widest uppercase hover:border-black hover:text-black transition-colors rounded-xl"
                >
                  View Wishlist
                </motion.button>
              </div>

              {/* Guest Login Prompt */}
              {!isAuthenticated && (
                <div className="mt-16 pt-10 border-t border-gray-100 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Have an account?</h3>
                  <p className="text-base text-gray-500 mb-4">
                    <Link href="/auth/login">
                      <span className="text-black underline font-medium cursor-pointer hover:text-gray-700">Log in</span>
                    </Link> to check out faster and see your saved items.
                  </p>
                </div>
              )}
            </motion.div>
          ) : mounted && (
            /* ── Cart Items + Summary ── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

              {/* ── Left: Cart Items ── */}
              <div className="lg:col-span-7 xl:col-span-8">

                {/* Free Delivery Progress */}
                {remainingForFreeDelivery > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 10H13a1 1 0 100-2H8.414l1.293-1.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-base text-gray-700">
                        Add <span className="font-bold text-black">₹{Math.round(remainingForFreeDelivery)}</span> more for <span className="font-bold text-green-600">FREE delivery</span>
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${deliveryProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-2 bg-gradient-to-r from-amber-400 to-green-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Items Count */}
                <div className="bg-white rounded-t-xl px-8 py-5 border border-gray-100 border-b-0">
                  <span className="text-lg text-gray-500 font-medium">
                    {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your bag
                  </span>
                </div>

                {/* Item Cards */}
                <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item._id}-${item.size}-${item.color}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 sm:p-8"
                      >
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <Link href={`/product/${item._id}`}>
                            <div className="relative w-32 h-44 sm:w-40 sm:h-56 flex-shrink-0 cursor-pointer group overflow-hidden rounded-xl bg-gray-50">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <Link href={`/product/${item._id}`}>
                                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 hover:underline cursor-pointer truncate">
                                      {item.name}
                                    </h3>
                                  </Link>
                                  {item.category && (
                                    <p className="text-sm text-gray-400 mt-1 uppercase tracking-wide">{item.category}</p>
                                  )}
                                </div>
                                {/* Remove Button */}
                                <button
                                  onClick={() => removeFromCart(item._id, item.size, item.color)}
                                  className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                  title="Remove from bag"
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>

                              {/* Size & Color Tags */}
                              <div className="flex flex-wrap items-center gap-3 mt-4">
                                {item.size && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-sm font-medium text-gray-700">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-sm font-medium text-gray-700">
                                    {item.color}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom Row: Price + Quantity */}
                            <div className="flex items-end justify-between mt-6">
                              {/* Price */}
                              <div className="flex items-baseline gap-3">
                                <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <>
                                    <span className="text-base text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                                    <span className="text-sm font-semibold text-green-600">
                                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Quantity Selector */}
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium"
                                >
                                  −
                                </button>
                                <span className="w-12 h-10 flex items-center justify-center text-base font-semibold text-gray-900 border-x border-gray-200 bg-gray-50">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Move to Wishlist */}
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors self-start"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => router.push('/shop')}
                  className="mt-6 flex items-center gap-2 text-base font-medium text-gray-600 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </motion.button>
              </div>

              {/* ── Right: Order Summary ── */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-32 space-y-6">
                  {/* Guest Login Prompt */}
                  {!isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                    >
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Have an account?</h3>
                      <p className="text-sm text-gray-500">
                        <Link href="/auth/login">
                          <span className="text-black underline font-medium cursor-pointer hover:text-gray-700">Log in</span>
                        </Link> to check out faster.
                      </p>
                    </motion.div>
                  )}

                  {/* Coupon Code */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l3-3m0 0l3 3m-3-3v-6m-6 9h12a2.25 2.25 0 002.25-2.25v-.894c0-.54-.195-1.062-.55-1.47L13.59 6.22a2.25 2.25 0 00-3.18 0L6.3 10.636a2.25 2.25 0 00-.55 1.47v.894A2.25 2.25 0 008 15.25z" />
                      </svg>
                      <h3 className="text-base font-semibold text-gray-900">Apply Coupon</h3>
                    </div>

                    {/* Auto Apply */}
                    {!appliedOffer && (
                      <AutoApplyOffer
                        cartItems={items}
                        cartTotal={getCartTotal()}
                        onApplyOffer={setAppliedOffer}
                      />
                    )}

                    {!appliedOffer ? (
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon}
                          className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {validatingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-base font-semibold text-green-800">{appliedOffer.code}</p>
                            <p className="text-sm text-green-600">-₹{Math.round(appliedOffer.discount)} saved</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-sm text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Total Amount */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="px-6 py-5 border-b border-gray-100">
                      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Total Amount</h2>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Total Items */}
                      <div className="flex justify-between text-base">
                        <span className="text-gray-500">Total Items</span>
                        <span className="font-medium text-gray-900">{getCartCount()}</span>
                      </div>

                      {/* Total MRP */}
                      <div className="flex justify-between text-base">
                        <span className="text-gray-500">Total MRP</span>
                        <span className="font-medium text-gray-900">₹{getTotalMRP().toLocaleString()}</span>
                      </div>

                      {/* Discount on MRP */}
                      {getMRPDiscount() > 0 && (
                        <div className="flex justify-between text-base">
                          <span className="text-gray-500">Discount on MRP</span>
                          <span className="font-medium text-green-600">-₹{getMRPDiscount().toLocaleString()}</span>
                        </div>
                      )}

                      {/* Coupon Savings */}
                      {appliedOffer && (
                        <div className="flex justify-between text-base">
                          <span className="text-gray-500">Coupon ({appliedOffer.code})</span>
                          <span className="font-medium text-green-600">-₹{Math.round(appliedOffer.discount).toLocaleString()}</span>
                        </div>
                      )}

                      {/* Delivery */}
                      <div className="flex justify-between text-base">
                        <span className="text-gray-500">Delivery</span>
                        <span className={`font-medium ${cartTotal >= FREE_DELIVERY_THRESHOLD ? 'text-green-600' : 'text-gray-900'}`}>
                          {cartTotal >= FREE_DELIVERY_THRESHOLD ? 'FREE' : '₹49'}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <div className="text-right">
                            <span className={`text-xl font-bold ${appliedOffer ? 'text-green-600' : 'text-gray-900'}`}>
                              ₹{getDiscountedTotal().toLocaleString()}
                            </span>
                            {(getMRPDiscount() > 0 || appliedOffer) && (
                              <p className="text-sm text-green-600 font-medium mt-1">
                                You save ₹{(getMRPDiscount() + (appliedOffer?.discount || 0)).toLocaleString()} 🎉
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <div className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        className="w-full bg-black text-white py-4 text-base font-bold tracking-wider uppercase rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                      >
                        Proceed to Checkout
                      </motion.button>

                      {cartTotal < FREE_DELIVERY_THRESHOLD && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push('/shop')}
                          className="w-full mt-3 py-3.5 text-base font-semibold text-gray-700 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          Shop for ₹{Math.round(remainingForFreeDelivery)} more for free delivery
                        </motion.button>
                      )}
                    </div>
                  </motion.div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-8 py-6 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      <span className="text-xs font-medium">Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.023 9.348v4.992" />
                      </svg>
                      <span className="text-xs font-medium">Easy Returns</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <span className="text-xs font-medium">Free Shipping</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                      <span className="text-xs font-medium">Authentic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
