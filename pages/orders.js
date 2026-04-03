import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useStore'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import CancelOrder from '../components/CancelOrder'
import ProfileSidebar from '../components/ProfileSidebar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'

export default function Orders() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const offersBarVisible = useOffersBarVisible()
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
        orderId: order.orderId,
        date: order.createdAt,
        status: order.status || 'Processing',
        total: order.totalAmount,
        items: order.items.map(item => ({
          productId: item.product,
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
      case 'Returned': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Head>
        <title>My Orders — VSTRA</title>
        <meta name="description" content="View and manage your orders" />
      </Head>

      <ActiveOffersBar />
      <Navbar />

      <main className="min-h-screen bg-white pb-24" style={{ paddingTop: offersBarVisible ? '9rem' : '6rem' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] text-gray-400 tracking-[0.1em] uppercase mb-12">
            <Link href="/"><span className="hover:text-black transition-colors cursor-pointer">Home</span></Link>
            <span className="text-gray-300">/</span>
            <Link href="/account"><span className="hover:text-black transition-colors cursor-pointer">Account</span></Link>
            <span className="text-gray-300">/</span>
            <span className="text-black font-medium">Orders</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            {/* Left Sidebar */}
            <ProfileSidebar activePage="orders" />

            {/* Main Content */}
            <div className="flex-1 lg:border-l border-gray-100 lg:pl-[4.5rem]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.05em] uppercase mb-2">My Orders</h1>
                <p className="text-[13px] text-gray-500 tracking-wide mb-12">View and manage your recent purchases</p>
              </motion.div>

          {loading ? (
            <div className="border border-neutral-200 p-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1a1a] mx-auto mb-4"></div>
              <p className="text-[12px] uppercase tracking-[0.1em] text-neutral-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-neutral-200 p-16 text-center bg-[#fcfcfc]">
              <p className="text-[13px] text-gray-500 mb-6 uppercase tracking-widest">You haven't placed any orders yet.</p>
              <Link href="/shop">
                <button className="bg-[#1a1a1a] text-white px-10 py-4 text-[12px] tracking-[0.15em] uppercase hover:bg-black transition-colors">
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="border border-neutral-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Order Header */}
                  <div className="bg-[#fbfbfb] p-6 lg:p-8 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="grid grid-cols-2 md:flex md:gap-12 gap-y-4">
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em] mb-1">Order Number</p>
                        <p className="text-[13px] font-medium text-[#1a1a1a] tracking-wide">
                          {order.orderId ? order.orderId : order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em] mb-1">Order Date</p>
                        <p className="text-[13px] font-medium text-[#1a1a1a] tracking-wide">
                          {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em] mb-1">Total Amount</p>
                        <p className="text-[13px] font-medium text-[#1a1a1a] tracking-wide">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[12px] font-bold uppercase tracking-[0.1em] px-4 py-2 border border-neutral-300 bg-white shadow-sm text-[#1a1a1a]">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 lg:p-8">
                    <div className="space-y-6">
                      {order.items.map((item, i) => (
                         <div key={i} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
                          <Link href={item.productId ? `/product/${item.productId}` : '#'}>
                            <div className="w-[100px] h-[130px] bg-[#f2f0ed] flex-shrink-0 cursor-pointer overflow-hidden relative">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                          </Link>
                          
                          <div className="flex-1 flex flex-col justify-center">
                            <Link href={item.productId ? `/product/${item.productId}` : '#'}>
                              <h4 className="text-[14px] font-medium text-[#1a1a1a] hover:text-gray-500 transition-colors cursor-pointer uppercase tracking-wide mb-2 inline-block">
                                {item.name}
                              </h4>
                            </Link>
                            <p className="text-[12px] text-gray-500 uppercase tracking-widest mb-3">
                              Size: {item.size} <span className="mx-2">|</span> Color: {item.color} <span className="mx-2">|</span> Qty: {item.qty}
                            </p>
                            <p className="text-[14px] font-medium text-[#1a1a1a]">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="mt-8 p-5 bg-[#fbfbfb] border border-neutral-200 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em] mb-1">Tracking Number</p>
                          <p className="text-[13px] font-medium text-[#1a1a1a] tracking-widest">{order.trackingNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link href={`/order/${order.id}`}>
                        <button className="px-8 py-3 bg-[#1a1a1a] text-white text-[12px] tracking-[0.15em] uppercase hover:bg-black transition-colors font-medium">
                          View Details
                        </button>
                      </Link>

                      {order.canReturn && (
                        <Link href="/returns">
                          <button className="px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-[12px] tracking-[0.15em] uppercase hover:bg-[#1a1a1a] hover:text-white transition-colors font-medium">
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
                          className="px-8 py-3 border border-red-800 text-red-800 text-[12px] tracking-[0.15em] uppercase hover:bg-red-800 hover:text-white transition-colors font-medium"
                        >
                          Cancel Order
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                        <button className="px-8 py-3 border border-neutral-300 text-neutral-600 text-[12px] tracking-[0.15em] uppercase hover:bg-neutral-100 transition-colors font-medium">
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
            className="mt-20 border-t border-neutral-200 pt-16"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-[16px] font-bold text-[#1a1a1a] uppercase tracking-widest mb-8 text-center">Need Support?</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link href="/returns">
                <div className="border border-neutral-200 p-8 text-center hover:border-[#1a1a1a] transition-colors cursor-pointer group">
                  <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2 group-hover:underline underline-offset-4">Returns & Exchanges</h4>
                  <p className="text-[12px] text-gray-500">View policies and timelines</p>
                </div>
              </Link>
              <div className="border border-neutral-200 p-8 text-center hover:border-[#1a1a1a] transition-colors cursor-pointer group">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2 group-hover:underline underline-offset-4">Track Your Order</h4>
                <p className="text-[12px] text-gray-500">Live courier updates</p>
              </div>
              <Link href="/contact">
                <div className="border border-neutral-200 p-8 text-center hover:border-[#1a1a1a] transition-colors cursor-pointer group">
                  <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2 group-hover:underline underline-offset-4">Contact Us</h4>
                  <p className="text-[12px] text-gray-500">Our team is available 24/7</p>
                </div>
              </Link>
            </div>
          </motion.div>
            </div>
          </div>
        </div>
      </main>

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
