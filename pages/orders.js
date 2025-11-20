import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useStore'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CancelOrder from '../components/CancelOrder'

export default function Orders() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated, router])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📦 Orders API Response:', response.data)
      console.log('📦 Number of orders:', response.data.length)
      
      // Transform orders to match UI format - using REAL order data
      const transformedOrders = response.data.map(order => ({
        id: order._id,
        date: order.createdAt,
        status: order.status || 'Processing',
        total: order.totalAmount,
        items: order.items.map(item => ({
          name: item.name,
          size: item.size || 'N/A',
          color: item.color || 'N/A',
          qty: item.quantity,
          price: item.price, // Real price from order
          image: item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80'
        })),
        canCancel: order.status === 'Processing' || order.status === 'Pending',
        canReturn: order.status === 'Delivered',
        trackingNumber: order.trackingNumber
      }))
      
      console.log('📦 Transformed orders:', transformedOrders)
      setOrders(transformedOrders)
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      setOrders([]) // Empty array if error - NO MOCK DATA
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = (cancelData) => {
    setOrders(orders.map(order => 
      order.id === cancelData.orderId 
        ? { ...order, status: 'Cancelled', canCancel: false }
        : order
    ))
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

  return (
    <>
      <Head>
        <title>My Orders — VSTRA</title>
        <meta name="description" content="View and manage your orders" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-600 mb-8">View and manage your order history</p>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <Link href="/shop">
                <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 p-6 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">Order {order.id}</h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-lg font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                          <div 
                            className="w-20 h-20 bg-gray-200 rounded-lg bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url(${item.image})` }}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} | Color: {item.color} | Qty: {item.qty}
                            </p>
                            <p className="text-sm font-semibold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Tracking Number:</strong> {order.trackingNumber}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href={`/order/${order.id}`}>
                        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                          View Details
                        </button>
                      </Link>

                      {order.canReturn && (
                        <Link href="/returns">
                          <button className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
                            Return Items
                          </button>
                        </Link>
                      )}

                      {order.canCancel && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order.id)
                            setShowCancelModal(true)
                          }}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                          Cancel Order
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                        <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                          Buy Again
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Help Section */}
          <motion.div
            className="mt-12 bg-purple-50 rounded-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-4">Need Help with Your Order?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/returns">
                <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <h4 className="font-semibold mb-2">Returns & Exchanges</h4>
                  <p className="text-sm text-gray-600">Easy returns within 30 days</p>
                </div>
              </Link>
              <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h4 className="font-semibold mb-2">Track Your Order</h4>
                <p className="text-sm text-gray-600">Get real-time updates</p>
              </div>
              <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h4 className="font-semibold mb-2">Contact Support</h4>
                <p className="text-sm text-gray-600">We're here to help 24/7</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <CancelOrder
          orderId={selectedOrder}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleCancelOrder}
        />
      )}
    </>
  )
}
