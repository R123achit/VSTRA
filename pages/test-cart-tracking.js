import { useState, useEffect } from 'react'
import { useCartStore, useAuthStore } from '../store/useStore'
import Head from 'next/head'
import Link from 'next/link'

export default function TestCartTracking() {
  const cart = useCartStore((state) => state.items)
  const user = useAuthStore((state) => state.user)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [mounted, setMounted] = useState(false)

  // Get sessionId only on client side
  useEffect(() => {
    setMounted(true)
    setSessionId(sessionStorage.getItem('sessionId') || 'Not set')
  }, [])

  const handleTrackNow = async () => {
    setLoading(true)
    setResult(null)

    try {
      const sessionId = sessionStorage.getItem('sessionId') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)

      let email = user?.email || sessionStorage.getItem('guestEmail') || `guest_${sessionId}@temp.vstra.com`

      const response = await fetch('/api/abandoned-cart/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email,
          cartItems: cart,
          userId: user?._id || null
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStats = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/abandoned-cart/test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Test Cart Tracking - VSTRA</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Test Cart Tracking</h1>

          {/* Cart Info */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-bold mb-4">Current Cart</h2>
            <p className="text-lg mb-2">Items in cart: <strong>{cart?.length || 0}</strong></p>
            <p className="text-lg mb-2">User email: <strong>{user?.email || 'Not logged in'}</strong></p>
            <p className="text-lg">Session ID: <strong>{mounted ? sessionId : 'Loading...'}</strong></p>
          </div>

          {/* Cart Items */}
          {cart && cart.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-2xl font-bold mb-4">Cart Items</h2>
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 border-b pb-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-bold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleTrackNow}
                disabled={loading || !cart || cart.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tracking...' : '📍 Track Cart Now'}
              </button>

              <button
                onClick={handleCheckStats}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : '📊 Check Stats'}
              </button>

              <Link href="/shop">
                <button className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700">
                  🛍️ Go to Shop
                </button>
              </Link>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`p-6 rounded-lg shadow ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h2 className="text-2xl font-bold mb-4">
                {result.success ? '✅ Success' : '❌ Error'}
              </h2>
              <pre className="bg-white p-4 rounded overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
