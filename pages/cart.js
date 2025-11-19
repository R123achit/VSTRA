import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCartStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'

export default function Cart() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCartStore()

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    router.push('/checkout')
  }

  return (
    <>
      <Head>
        <title>Shopping Cart - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 min-h-screen">
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
                      <p className="text-base sm:text-lg font-semibold">${item.price}</p>
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
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
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
