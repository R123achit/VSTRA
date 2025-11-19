import { useState } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCartStore, useAuthStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Checkout() {
  const router = useRouter()
  const { items, getCartTotal, clearCart } = useCartStore()
  const { isAuthenticated, token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
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

    try {
      setLoading(true)

      const orderData = {
        orderItems: items.map(item => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: formData,
        paymentMethod: 'card',
        itemsPrice: getCartTotal(),
        taxPrice: getCartTotal() * 0.1,
        shippingPrice: 0,
        totalPrice: getCartTotal() * 1.1,
      }

      const response = await axios.post('/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success('Order placed successfully!')
        clearCart()
        router.push('/orders')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
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
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12">
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      name="addressLine1"
                      placeholder="Address Line 1 *"
                      required
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="md:col-span-2 px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      name="addressLine2"
                      placeholder="Address Line 2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="md:col-span-2 px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State *"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP Code *"
                      required
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      name="country"
                      placeholder="Country *"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
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
                        <p className="text-sm font-semibold">${item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-semibold">${(getCartTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${(getCartTotal() * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
