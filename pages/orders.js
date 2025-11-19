import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuthStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Orders() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOrders(response.data.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>My Orders - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-32 pb-20 px-6 lg:px-12 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-12"
          >
            My Orders
          </motion.h1>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg mb-8">You haven't placed any orders yet</p>
              <button
                onClick={() => router.push('/shop')}
                className="bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Order ID: {order._id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-xl font-bold">${order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} | Color: {item.color}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="font-semibold">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.fullName}<br />
                      {order.shippingAddress.addressLine1}<br />
                      {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
