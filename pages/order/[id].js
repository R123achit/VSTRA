import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import CancelOrder from '../../components/CancelOrder'

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Mock order data - in real app, fetch based on id
  const order = {
    id: id || 'VSTRA-12345',
    date: '2024-11-15',
    status: 'Delivered',
    total: 24999,
    subtotal: 21697,
    shipping: 1250,
    tax: 2084,
    items: [
      { 
        id: 1,
        name: 'Premium Cotton T-Shirt', 
        size: 'M', 
        color: 'Black', 
        qty: 2, 
        price: 4199,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80'
      },
      { 
        id: 2,
        name: 'Slim Fit Jeans', 
        size: '32', 
        color: 'Blue', 
        qty: 1, 
        price: 7499,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Fashion Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    billingAddress: {
      name: 'John Doe',
      street: '123 Fashion Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    paymentMethod: 'Visa ending in 4242',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-11-20',
    canCancel: false,
    canReturn: true,
    timeline: [
      { status: 'Order Placed', date: '2024-11-15 10:30 AM', completed: true },
      { status: 'Payment Confirmed', date: '2024-11-15 10:31 AM', completed: true },
      { status: 'Processing', date: '2024-11-15 02:00 PM', completed: true },
      { status: 'Shipped', date: '2024-11-16 09:00 AM', completed: true },
      { status: 'Out for Delivery', date: '2024-11-18 08:00 AM', completed: true },
      { status: 'Delivered', date: '2024-11-18 03:45 PM', completed: true }
    ]
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
