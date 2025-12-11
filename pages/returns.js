import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useAuthStore } from '../store/useStore'

export default function Returns() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const offersBarVisible = useOffersBarVisible()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [comments, setComments] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      const token = localStorage.getItem('token')
      
      // Fetch orders
      const ordersResponse = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Fetch existing return requests
      const returnsResponse = await axios.get('/api/returns', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const existingReturns = returnsResponse.data.returns || []
      
      console.log('Orders response:', ordersResponse.data)
      console.log('Existing returns:', existingReturns)
      
      // Filter only delivered orders (not returned)
      const deliveredOrders = ordersResponse.data.filter(order => 
        order.status.toLowerCase() === 'delivered'
      )
      
      // Filter out items that already have pending/approved/received return requests
      const ordersWithAvailableItems = deliveredOrders.map(order => ({
        ...order,
        items: order.items.filter(item => {
          const hasActiveReturn = existingReturns.some(ret => 
            ret.orderId === order._id && 
            ret.productId === item.product &&
            ['pending', 'approved', 'picked_up', 'received', 'refunded'].includes(ret.status)
          )
          return !hasActiveReturn
        })
      })).filter(order => order.items.length > 0) // Remove orders with no returnable items
      
      console.log('Orders with returnable items:', ordersWithAvailableItems)
      setOrders(ordersWithAvailableItems)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const returnReasons = [
    'Size too small',
    'Size too large',
    'Different from description',
    'Quality not as expected',
    'Wrong item received',
    'Damaged or defective',
    'Changed my mind',
    'Found better price elsewhere',
    'Ordered by mistake',
    'Other (please specify)'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedReason) {
      toast.error('Please select a reason for return')
      return
    }

    if (selectedReason === 'Other' && !customReason) {
      toast.error('Please provide a custom reason')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post('/api/returns', {
        orderId: selectedOrder._id,
        productId: selectedProduct.product,
        reason: selectedReason,
        customReason: selectedReason === 'Other' ? customReason : undefined,
        comments,
        quantity: 1,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success('🎉 Return request submitted successfully! The seller will review your request soon.', {
          duration: 5000,
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            fontSize: '16px'
          }
        })
        
        // Reset form
        setSelectedOrder(null)
        setSelectedProduct(null)
        setSelectedReason('')
        setCustomReason('')
        setComments('')
        setShowForm(false)
        
        // Refresh orders
        fetchOrders()
      }
    } catch (error) {
      console.error('Return request error:', error)
      toast.error(error.response?.data?.message || 'Failed to submit return request', {
        duration: 4000
      })
    } finally {
      setSubmitting(false)
    }
  }

  const selectProductForReturn = (order, item) => {
    setSelectedOrder(order)
    setSelectedProduct(item)
    setShowForm(true)
  }

  return (
    <>
      <Head>
        <title>Returns & Exchanges — VSTRA</title>
        <meta name="description" content="Easy returns and exchanges within 30 days" />
      </Head>

      <Toaster position="top-center" />
      <ActiveOffersBar />
      <Navbar />

      <div className="min-h-screen bg-gray-50" style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}>
        {/* Hero Section */}
        <div className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Returns & Exchanges
            </motion.h1>
            <motion.p 
              className="text-gray-300 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              We want you to love your purchase. If not, we're here to help.
            </motion.p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Return Policy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Return Policy</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      30-Day Return Window
                    </h3>
                    <p className="text-gray-600 ml-7">
                      Return items within 30 days of delivery for a full refund or exchange.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Free Return Shipping
                    </h3>
                    <p className="text-gray-600 ml-7">
                      We cover return shipping costs for all eligible returns within the US.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Easy Exchange Process
                    </h3>
                    <p className="text-gray-600 ml-7">
                      Exchange for a different size or color at no additional cost.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Quick Refunds
                    </h3>
                    <p className="text-gray-600 ml-7">
                      Refunds processed within 5-7 business days after we receive your return.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Return Conditions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Items must be unworn and unwashed</li>
                    <li>• Original tags must be attached</li>
                    <li>• Items must be in original packaging</li>
                    <li>• Proof of purchase required</li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Non-Returnable Items</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Underwear and intimate apparel</li>
                    <li>• Earrings and pierced jewelry</li>
                    <li>• Final sale items</li>
                    <li>• Gift cards</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Return Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Start a Return</h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading your orders...</p>
                  </div>
                ) : !showForm ? (
                  <div>
                    <p className="text-gray-600 mb-6">
                      Select an item from your delivered orders to return.
                    </p>
                    
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No delivered orders found.</p>
                        <button
                          onClick={() => router.push('/shop')}
                          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {orders.map((order) => (
                          <div key={order._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold">Order #{order._id?.slice(-8) || 'N/A'}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                {order.status}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-600">
                                      Size: {item.size} | Qty: {item.qty}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => selectProductForReturn(order, item)}
                                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                                  >
                                    Return
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <img 
                            src={selectedProduct?.image} 
                            alt={selectedProduct?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{selectedProduct?.name}</p>
                            <p className="text-sm text-gray-600">
                              Order #{selectedOrder?._id?.slice(-8) || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-3">
                          Reason for Return <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {returnReasons.map((reason) => (
                            <label
                              key={reason}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="reason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="mr-3"
                              />
                              <span className="text-sm">{reason}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {selectedReason === 'Other' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Please specify your reason
                          </label>
                          <textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            rows="4"
                            placeholder="Tell us more about your reason for return..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Additional Comments (Optional)
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows="3"
                          placeholder="Any additional information..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false)
                            setSelectedOrder(null)
                            setSelectedProduct(null)
                            setSelectedReason('')
                            setCustomReason('')
                            setComments('')
                          }}
                          disabled={submitting}
                          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Submitting...' : 'Submit Return Request'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Quick Links */}
              <div className="mt-6 bg-purple-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block text-purple-600 hover:text-purple-800">
                    → Track your return
                  </a>
                  <a href="#" className="block text-purple-600 hover:text-purple-800">
                    → Contact customer service
                  </a>
                  <a href="#" className="block text-purple-600 hover:text-purple-800">
                    → View return status
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: 'How long do I have to return an item?',
                  a: 'You have 30 days from the delivery date to initiate a return. Items must be in original condition with tags attached.'
                },
                {
                  q: 'When will I receive my refund?',
                  a: 'Refunds are processed within 5-7 business days after we receive and inspect your return. The refund will be credited to your original payment method.'
                },
                {
                  q: 'Can I exchange an item?',
                  a: 'Yes! You can exchange items for a different size or color. Simply select "Exchange" when submitting your return request.'
                },
                {
                  q: 'Who pays for return shipping?',
                  a: 'We provide free return shipping labels for all eligible returns within the US. International returns may have different policies.'
                },
                {
                  q: 'Can I cancel my order?',
                  a: 'Yes, you can cancel your order within 24 hours of placing it. After that, the order may have already shipped.'
                },
                {
                  q: 'What if my item is damaged?',
                  a: 'If you receive a damaged item, please contact us immediately with photos. We\'ll arrange a free return and send a replacement or full refund.'
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  )
}
