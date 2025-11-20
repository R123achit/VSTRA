import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/useStore'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import CancelOrder from '../../components/CancelOrder'

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated } = useAuthStore()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (id) {
      fetchOrderDetails()
    }
  }, [id, isAuthenticated, router])

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const orderData = response.data
      
      // Transform REAL order data to match UI format
      const transformedOrder = {
        id: orderData._id,
        date: orderData.createdAt,
        status: orderData.status || 'Processing',
        total: orderData.totalAmount,
        subtotal: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: orderData.shippingCost || 0,
        tax: orderData.tax || 0,
        items: orderData.items.map(item => ({
          id: item._id,
          name: item.name,
          size: item.size || 'N/A',
          color: item.color || 'N/A',
          qty: item.quantity,
          price: item.price, // Real price from actual order
          image: item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80'
        })),
        shippingAddress: orderData.shippingAddress || {
          name: 'N/A',
          street: 'N/A',
          city: 'N/A',
          state: 'N/A',
          zip: 'N/A',
          country: 'India'
        },
        billingAddress: orderData.billingAddress || orderData.shippingAddress || {
          name: 'N/A',
          street: 'N/A',
          city: 'N/A',
          state: 'N/A',
          zip: 'N/A',
          country: 'India'
        },
        paymentMethod: orderData.paymentMethod || 'N/A',
        trackingNumber: orderData.trackingNumber,
        estimatedDelivery: orderData.estimatedDelivery,
        canCancel: orderData.status === 'Processing' || orderData.status === 'Pending',
        canReturn: orderData.status === 'Delivered',
        timeline: generateTimeline(orderData)
      }
      
      setOrder(transformedOrder)
    } catch (error) {
      console.error('Error fetching order details:', error)
      setOrder(null) // Set to null if error - NO MOCK DATA
    } finally {
      setLoading(false)
    }
  }

  const generateTimeline = (orderData) => {
    const timeline = [
      { status: 'Order Placed', date: new Date(orderData.createdAt).toLocaleString(), completed: true }
    ]
    
    if (orderData.status !== 'Cancelled') {
      timeline.push({ status: 'Payment Confirmed', date: new Date(orderData.createdAt).toLocaleString(), completed: true })
      timeline.push({ status: 'Processing', date: '', completed: orderData.status !== 'Pending' })
      timeline.push({ status: 'Shipped', date: '', completed: orderData.status === 'Shipped' || orderData.status === 'Delivered' })
      timeline.push({ status: 'Out for Delivery', date: '', completed: orderData.status === 'Delivered' })
      timeline.push({ status: 'Delivered', date: '', completed: orderData.status === 'Delivered' })
    } else {
      timeline.push({ status: 'Cancelled', date: new Date(orderData.updatedAt).toLocaleString(), completed: true })
    }
    
    return timeline
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'Shipped': return 'bg-blue-100 text-blue-800'
      case 'Processing': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCancelOrder = (cancelData) => {
    router.push('/orders')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Order not found</p>
            <Link href="/orders">
              <button className="bg-black text-white px-6 py-3 rounded-lg">
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Order {order.id} — VSTRA</title>
        <meta name="description" content="View your order details" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Back Button */}
          <Link href="/orders">
            <motion.button
              className="flex items-center text-gray-600 hover:text-black mb-6"
              whileHover={{ x: -5 }}
            >
              <span className="mr-2">←</span> Back to Orders
            </motion.button>
          </Link>

          {/* Order Header */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Order {order.id}</h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`px-6 py-3 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Order Items & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <motion.div
                className="bg-white rounded-lg shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div 
                        className="w-24 h-24 bg-gray-200 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                        <p className="text-lg font-bold mt-2">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Order Timeline */}
              <motion.div
                className="bg-white rounded-lg shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold mb-6">Order Timeline</h2>
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${event.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
                        {index < order.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${event.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <h3 className={`font-semibold ${event.completed ? 'text-black' : 'text-gray-400'}`}>
                          {event.status}
                        </h3>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <motion.div
                  className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-semibold text-blue-900 mb-2">Tracking Information</h3>
                  <p className="text-blue-800 mb-3">
                    <strong>Tracking Number:</strong> {order.trackingNumber}
                  </p>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Track Package
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                className="bg-white rounded-lg shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₹{order.shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST)</span>
                    <span>₹{order.tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                className="bg-white rounded-lg shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <div className="text-gray-600 space-y-1">
                  <p className="font-semibold text-black">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                className="bg-white rounded-lg shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <p className="text-gray-600">{order.paymentMethod}</p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {order.canReturn && (
                  <Link href="/returns">
                    <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                      Return Items
                    </button>
                  </Link>
                )}

                {order.canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Cancel Order
                  </button>
                )}

                <button className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  Download Invoice
                </button>

                <button className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  Contact Support
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <CancelOrder
          orderId={order.id}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleCancelOrder}
        />
      )}
    </>
  )
}
