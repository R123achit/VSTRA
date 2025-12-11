import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCartStore } from '../store/useStore'

export default function AbandonedCartPopup() {
  const [show, setShow] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const cart = useCartStore((state) => state.items)

  useEffect(() => {
    // Check if user has items in cart
    if (!cart || cart.length === 0) return

    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('abandonedCartPopupShown')
    if (popupShown) return

    // Show popup after 30 minutes
    const timer = setTimeout(() => {
      setCartItems(cart)
      setShow(true)
      sessionStorage.setItem('abandonedCartPopupShown', 'true')
      
      // Track popup shown
      fetch('/api/abandoned-cart/track-popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId() })
      }).catch(console.error)
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearTimeout(timer)
  }, [cart])

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  const handleClose = () => {
    setShow(false)
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Don't Leave Yet! 🛍️</h2>
                    <p className="text-purple-100 mt-1">Your items are waiting for you</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  You have <strong>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</strong> in your cart
                </p>

                {/* Cart Items Preview */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cartItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-purple-600">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{cartItems.length - 3} more item{cartItems.length - 3 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-purple-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Special Offer */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>⚡ Limited Time!</strong> Complete your purchase now and get free shipping!
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link href="/cart">
                    <button
                      onClick={handleClose}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Complete My Purchase
                    </button>
                  </Link>
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
