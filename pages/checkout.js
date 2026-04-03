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
import Link from 'next/link'
import confetti from 'canvas-confetti'

export default function Checkout() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { items, getCartTotal, clearCart, getCartCount } = useCartStore()
  const { isAuthenticated, token, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  const [scriptError, setScriptError] = useState(false)
  const [focused, setFocused] = useState({})
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

  useEffect(() => {
    const localToken = localStorage.getItem('token')
    if (!isAuthenticated && !localToken) {
      toast.error('Please login to checkout')
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayLoaded(true)
    }
    const timeout = setTimeout(() => {
      if (!razorpayLoaded && typeof window !== 'undefined' && window.Razorpay) {
        setRazorpayLoaded(true)
      }
    }, 5000)
    return () => clearTimeout(timeout)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFocus = (name) => setFocused({ ...focused, [name]: true })
  const handleBlur = (name) => {
    if (!formData[name]) setFocused({ ...focused, [name]: false })
  }

  const isActive = (name) => focused[name] || formData[name]

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)
      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } })
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
      toast.error(scriptError ? 'Payment system failed to load.' : 'Payment system is loading...')
      return
    }

    try {
      setLoading(true)
      const authToken = token || localStorage.getItem('token')
      const subtotal = getCartTotal()
      const tax = subtotal * 0.1
      const totalAmount = subtotal + tax

      const orderResponse = await axios.post(
        '/api/payment/create-order',
        { amount: totalAmount, currency: 'INR' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      if (!orderResponse.data.success) throw new Error('Failed to create payment order')

      const { orderId, amount, currency } = orderResponse.data
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'VSTRA',
        description: 'Premium Fashion Store',
        order_id: orderId,
        prefill: { name: user?.name || formData.fullName, email: user?.email || '', contact: formData.phone },
        theme: { color: '#010101' },
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              '/api/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${authToken}` } }
            )

            if (verifyResponse.data.success) {
              const orderData = {
                orderItems: items.map((i) => ({
                  product: i._id, name: i.name, image: i.image,
                  price: i.price, quantity: i.quantity, size: i.size, color: i.color,
                })),
                shippingAddress: formData,
                paymentMethod: 'razorpay',
                paymentResult: { id: response.razorpay_payment_id, status: 'paid', razorpay_order_id: response.razorpay_order_id },
                itemsPrice: subtotal, taxPrice: tax, shippingPrice: 0, totalPrice: totalAmount,
                isPaid: true, paidAt: new Date(), status: 'processing',
              }

              const dbResponse = await axios.post('/api/orders', orderData, {
                headers: { Authorization: `Bearer ${authToken}` },
              })

              if (dbResponse.data.success) {
                triggerConfetti()
                setOrderDetails(dbResponse.data.data)
                setShowSuccessModal(true)
                clearCart()
              }
            }
          } catch (error) {
            toast.error('Payment verification failed.')
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  if (items.length === 0 && !showSuccessModal) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#f5f3f0]">
          <div className="text-center px-6">
            <p className="text-neutral-400 text-[15px] mb-8 font-medium">Your checkout is empty</p>
            <button
              onClick={() => router.push('/shop')}
              className="bg-[#1a1a1a] text-white px-10 py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-black transition-colors"
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
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => { setScriptError(true); toast.error('Payment system error.') }}
      />
      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />

      <main 
        className="min-h-screen bg-[#f5f3f0] transition-all duration-300 pb-20" 
        style={{ paddingTop: offersBarVisible ? '10rem' : '7.rem' }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Breadcrumb */}
          <div className="py-4">
            <div className="flex items-center gap-2 text-[12px] text-neutral-400">
              <Link href="/"><span className="hover:text-[#1a1a1a] cursor-pointer">Home</span></Link>
              <span>/</span>
              <Link href="/cart"><span className="hover:text-[#1a1a1a] cursor-pointer">Bag</span></Link>
              <span>/</span>
              <span className="text-[#1a1a1a] font-semibold">Checkout</span>
            </div>
          </div>

          <div className="flex items-center justify-between pb-6">
            <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#1a1a1a] tracking-tight">
              Checkout
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-12 xl:col-span-8">
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="bg-white p-6 sm:p-10 border border-neutral-100">
                  <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-[0.15em] mb-8">Shipping Address</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    {/* Full Name */}
                    <div className="relative">
                      <input
                        type="text" name="fullName" id="fullName" required
                        value={formData.fullName} onChange={handleChange}
                        onFocus={() => handleFocus('fullName')} onBlur={() => handleBlur('fullName')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="Full Name"
                      />
                      <label htmlFor="fullName" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('fullName') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>Full Name*</label>
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <input
                        type="tel" name="phone" id="phone" required
                        value={formData.phone} onChange={handleChange}
                        onFocus={() => handleFocus('phone')} onBlur={() => handleBlur('phone')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="Phone Number"
                      />
                      <label htmlFor="phone" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('phone') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>Phone Number*</label>
                    </div>

                    {/* Address 1 */}
                    <div className="relative md:col-span-2">
                      <input
                        type="text" name="addressLine1" id="address1" required
                        value={formData.addressLine1} onChange={handleChange}
                        onFocus={() => handleFocus('address1')} onBlur={() => handleBlur('address1')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="Address 1"
                      />
                      <label htmlFor="address1" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('address1') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>Street Address*</label>
                    </div>

                    {/* Address 2 */}
                    <div className="relative md:col-span-2">
                      <input
                        type="text" name="addressLine2" id="address2"
                        value={formData.addressLine2} onChange={handleChange}
                        onFocus={() => handleFocus('address2')} onBlur={() => handleBlur('address2')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="Address 2"
                      />
                      <label htmlFor="address2" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('address2') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>Apartment, suite, etc. (optional)</label>
                    </div>

                    {/* City */}
                    <div className="relative">
                      <input
                        type="text" name="city" id="city" required
                        value={formData.city} onChange={handleChange}
                        onFocus={() => handleFocus('city')} onBlur={() => handleBlur('city')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="City"
                      />
                      <label htmlFor="city" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('city') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>City*</label>
                    </div>

                    {/* State */}
                    <div className="relative">
                      <input
                        type="text" name="state" id="state" required
                        value={formData.state} onChange={handleChange}
                        onFocus={() => handleFocus('state')} onBlur={() => handleBlur('state')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="State"
                      />
                      <label htmlFor="state" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('state') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>State*</label>
                    </div>

                    {/* ZIP */}
                    <div className="relative">
                      <input
                        type="text" name="zipCode" id="zipCode" required
                        value={formData.zipCode} onChange={handleChange}
                        onFocus={() => handleFocus('zipCode')} onBlur={() => handleBlur('zipCode')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="PIN Code"
                      />
                      <label htmlFor="zipCode" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('zipCode') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>PIN Code*</label>
                    </div>

                    {/* Country */}
                    <div className="relative">
                      <input
                        type="text" name="country" id="country" required
                        value={formData.country} onChange={handleChange}
                        onFocus={() => handleFocus('country')} onBlur={() => handleBlur('country')}
                        className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                        placeholder="Country"
                      />
                      <label htmlFor="country" className={`absolute left-0 transition-all duration-200 pointer-events-none ${isActive('country') ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium' : 'top-3 text-[14px] text-neutral-400'}`}>Country*</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-10 border border-neutral-100">
                   <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-[0.15em] mb-4">Payment Method</h2>
                   <div className="flex items-center gap-4 p-4 border border-neutral-800 bg-[#fbfbfb]">
                      <div className="w-4 h-4 rounded-full border-4 border-[#1a1a1a] bg-white" />
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">Secure Online Payment</p>
                        <p className="text-[11px] text-neutral-400">Pay via Credit Card, Debit Card, UPI, or Net Banking</p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-4 opacity-70" alt="Visa" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-4 opacity-70" alt="MC" />
                      </div>
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !razorpayLoaded || scriptError}
                  className="w-full bg-[#1a1a1a] text-white py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-black transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                </button>
              </form>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-12 xl:col-span-4">
              <div className="bg-white p-6 border border-neutral-100 sticky top-32">
                <h2 className="text-[13px] font-semibold text-[#1a1a1a] uppercase tracking-[0.08em] mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {items.map((item) => (
                    <div key={`${item._id}-${item.size}-${item.color}`} className="flex gap-4">
                      <Link href={`/product/${item._id}`}>
                        <div className="w-16 h-20 bg-[#f2f0ed] flex-shrink-0 cursor-pointer">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1a1a1a] line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-neutral-400 mt-1 uppercase">
                          {item.size} • {item.color}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                          <p className="text-[12px] font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-neutral-100 pt-6">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-[#1a1a1a] font-medium">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Estimated Tax (10%)</span>
                    <span className="text-[#1a1a1a] font-medium">₹{(getCartTotal() * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Delivery</span>
                    <span className="text-green-700 font-medium uppercase tracking-wider">Free</span>
                  </div>
                  <div className="border-t border-dashed border-neutral-200 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-[15px] font-bold text-[#1a1a1a]">Total Amount</span>
                    <span className="text-[18px] font-bold text-[#1a1a1a]">₹{(getCartTotal() * 1.1).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-50 flex items-center justify-center gap-3">
                   <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                   </svg>
                   <span className="text-[10px] text-neutral-400 tracking-wide uppercase font-medium">Secure Checkout via Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Success Modal — Refined VSTRA Style */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white max-w-[440px] w-full p-10 text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo */}
              <div className="text-[20px] font-bold tracking-[0.2em] mb-10">VSTRA</div>

              <div className="w-16 h-16 bg-[#f2f0ed] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <h2 className="text-[24px] font-semibold text-[#1a1a1a] tracking-tight mb-2">Order Confirmed</h2>
              <p className="text-[14px] text-neutral-500 mb-8 leading-relaxed">
                Thank you for your purchase. We've sent a confirmation email to your registered address.
              </p>

              {orderDetails && (
                <div className="bg-[#f9f9f9] p-5 mb-8 text-left space-y-3">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-neutral-400 uppercase tracking-wider">Order Reference</span>
                    <span className="text-[#1a1a1a] font-semibold">{orderDetails.orderId || ('#' + orderDetails._id?.slice(-8).toUpperCase())}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-neutral-400 uppercase tracking-wider">Amount Paid</span>
                    <span className="text-[#1a1a1a] font-semibold">₹{orderDetails.totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-neutral-400 uppercase tracking-wider">Expected Delivery</span>
                    <span className="text-[#1a1a1a] font-semibold">4-6 Business Days</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push('/orders')}
                className="w-full bg-[#1a1a1a] text-white py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-black transition-colors"
              >
                Track Your Order
              </button>

              <div className="mt-8">
                <Link href="/">
                   <span className="text-[11px] text-neutral-400 uppercase tracking-widest decoration-neutral-300 underline underline-offset-4 cursor-pointer hover:text-[#1a1a1a] transition-colors">
                      Back to Home
                   </span>
                </Link>
              </div>

              {/* Decorative background number */}
              <div className="absolute -bottom-10 -right-10 text-[120px] font-bold text-neutral-50 opacity-[0.03] select-none pointer-events-none">
                VSTRA
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
