import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PremiumOfferSystem from '../components/PremiumOfferSystem'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useCartStore, useAuthStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import confetti from 'canvas-confetti'

export default function Checkout() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { items, getCartTotal, clearCart } = useCartStore()
  const { isAuthenticated, token, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  })

  // Check authentication on mount
  useEffect(() => {
    const localToken = localStorage.getItem('token')
    
    if (!isAuthenticated && !localToken) {
      toast.error('Please login to checkout')
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Please login to continue')
      router.push('/auth/login')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please wait...')
      return
    }

    try {
      setLoading(true)

      // Get token from localStorage as fallback
      const authToken = token || localStorage.getItem('token')

      if (!authToken) {
        toast.error('Authentication token not found. Please login again.')
        router.push('/auth/login')
        return
      }

      const totalAmount = getCartTotal() * 1.1 // Including 10% tax

      // Create Razorpay order
      const orderResponse = await axios.post(
        '/api/payment/create-order',
        { amount: totalAmount, currency: 'INR' },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order')
      }

      const { orderId, amount, currency } = orderResponse.data

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'VSTRA',
        description: 'Premium Fashion Store',
        order_id: orderId,
        prefill: {
          name: user?.name || formData.fullName,
          email: user?.email || '',
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              '/api/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            )

            if (verifyResponse.data.success) {
              // Create order in database
              const orderData = {
                orderItems: items.map((item) => ({
                  product: item._id,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                })),
                shippingAddress: formData,
                paymentMethod: 'razorpay',
                paymentResult: {
                  id: response.razorpay_payment_id,
                  status: 'paid',
                  razorpay_order_id: response.razorpay_order_id,
                },
                itemsPrice: getCartTotal(),
                taxPrice: getCartTotal() * 0.1,
                shippingPrice: 0,
                totalPrice: totalAmount,
                isPaid: true,
                paidAt: new Date(),
                status: 'processing', // Set status to processing after successful payment
              }

              const dbResponse = await axios.post('/api/orders', orderData, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              })

              if (dbResponse.data.success) {
                // Trigger confetti celebration
                triggerConfetti()
                
                // Show success modal
                setOrderDetails(dbResponse.data.data)
                setShowSuccessModal(true)
                
                // Clear cart
                clearCart()
                
                // Redirect after 5 seconds
                setTimeout(() => {
                  router.push('/orders')
                }, 5000)
              }
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            toast.error('Payment cancelled')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-8">Your cart is empty</p>
            <button
              onClick={() => router.push('/shop')}
              className="bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Checkout - VSTRA</title>
      </Head>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error('Failed to load payment system')}
      />
      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />

      <main 
        className="pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 transition-all duration-300" 
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-8 sm:mb-12"
          >
            Checkout
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="bg-white p-8 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name *"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      name="addressLine1"
                      placeholder="Address Line 1 *"
                      required
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="md:col-span-2 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      name="addressLine2"
                      placeholder="Address Line 2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="md:col-span-2 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State *"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="PIN Code *"
                      required
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      name="country"
                      placeholder="Country *"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !razorpayLoaded}
                  className="w-full bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : !razorpayLoaded ? 'Loading Payment...' : 'Proceed to Payment'}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secured by Razorpay</span>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 shadow-lg sticky top-32">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item._id}-${item.size}-${item.color}`} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.size} / {item.color} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-semibold">₹{(getCartTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{(getCartTotal() * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
            onClick={() => {
              setShowSuccessModal(false)
              router.push('/orders')
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-2">Order Placed! 🎉</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase! Your order has been confirmed.
                </p>

                {orderDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-semibold">#{orderDetails._id?.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">₹{orderDetails.totalPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        Processing
                      </span>
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowSuccessModal(false)
                    router.push('/orders')
                  }}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                >
                  View My Orders
                </motion.button>

                <p className="text-sm text-gray-500 mt-4">
                  Redirecting in 5 seconds...
                </p>
              </motion.div>

              {/* Floating Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-20, -60],
                    x: [0, (i % 2 === 0 ? 1 : -1) * 30]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                  className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    bottom: '20%'
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
