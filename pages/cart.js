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
import { useCartStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Cart() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [appliedOffer, setAppliedOffer] = useState(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    // Store applied offer for checkout
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

  const getDiscountedTotal = () => {
    const subtotal = getCartTotal()
    if (appliedOffer) {
      return Math.max(0, subtotal - appliedOffer.discount)
    }
    return subtotal
  }

  return (
    <>
      <Head>
        <title>Shopping Cart - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />

      <main 
        className="pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 min-h-screen transition-all duration-300" 
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-8 sm:mb-12"
          >
            Shopping Cart
          </motion.h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg mb-8">Your cart is empty</p>
              <button
                onClick={() => router.push('/shop')}
                className="bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <motion.div
                    key={`${item._id}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-4 sm:p-6 shadow-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-32 h-48 sm:h-32 object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-1">Size: {item.size}</p>
                      <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">Color: {item.color}</p>
                      <p className="text-base sm:text-lg font-semibold">₹{item.price}</p>
                    </div>
                    <div className="flex sm:flex-col justify-between sm:justify-between items-center sm:items-end">
                      <button
                        onClick={() => removeFromCart(item._id, item.size, item.color)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 hover:border-black transition-colors"
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 hover:border-black transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 shadow-lg sticky top-32"
                >
                  <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                  {/* Auto Apply Best Offer */}
                  {!appliedOffer && (
                    <AutoApplyOffer
                      cartItems={items}
                      cartTotal={getCartTotal()}
                      onApplyOffer={setAppliedOffer}
                    />
                  )}

                  {/* Coupon Code Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Have a coupon?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        disabled={appliedOffer}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:bg-gray-100"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || appliedOffer}
                        className="px-6 py-2 bg-[#0A1628] text-white font-semibold rounded hover:bg-[#D4AF37] hover:text-black transition-all disabled:opacity-50"
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  {/* Applied Offer Display */}
                  <AnimatePresence>
                    {appliedOffer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-semibold text-green-800">{appliedOffer.name}</span>
                            </div>
                            <p className="text-sm text-green-700">Code: {appliedOffer.code}</p>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
                    </div>
                    {appliedOffer && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedOffer.code})</span>
                        <span className="font-semibold">-₹{appliedOffer.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className={appliedOffer ? 'text-green-600' : ''}>
                        ₹{getDiscountedTotal().toFixed(2)}
                      </span>
                    </div>
                    {appliedOffer && (
                      <p className="text-sm text-green-600 text-center">
                        You saved ₹{appliedOffer.discount}! 🎉
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => router.push('/shop')}
                    className="w-full mt-4 border-2 border-black text-black py-4 text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

