import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useAuthStore } from '../store/useStore'

export default function MyReturns() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const offersBarVisible = useOffersBarVisible()
  const [loading, setLoading] = useState(true)
  const [returns, setReturns] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchReturns()
  }, [isAuthenticated])

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/returns', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setReturns(response.data.returns)
      }
    } catch (error) {
      console.error('Error fetching returns:', error)
      toast.error('Failed to load returns')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      picked_up: 'bg-purple-100 text-purple-800',
      received: 'bg-indigo-100 text-indigo-800',
      refunded: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌',
      picked_up: '📦',
      received: '✔️',
      refunded: '💰'
    }
    return icons[status] || '📋'
  }

  return (
    <>
      <Head>
        <title>My Returns — VSTRA</title>
      </Head>

      <Toaster position="top-center" />
      <ActiveOffersBar />
      <Navbar />

      <div className="min-h-screen bg-gray-50" style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">My Returns & Refunds</h1>
          <p className="text-gray-600 mb-8">Track your return requests and refund status</p>

          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your returns...</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 mb-4">You haven't requested any returns yet.</p>
              <button
                onClick={() => router.push('/returns')}
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Request a Return
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {returns.map((returnItem) => (
                <div key={returnItem._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gray-50 p-6 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{returnItem.itemName}</h3>
                        <p className="text-sm text-gray-600">
                          Return ID: #{returnItem._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Requested: {new Date(returnItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(returnItem.status)}`}>
                        {getStatusIcon(returnItem.status)} {returnItem.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Return Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reason:</span>
                            <span className="font-medium">{returnItem.reason}</span>
                          </div>
                          {returnItem.customReason && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Details:</span>
                              <span className="font-medium">{returnItem.customReason}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium">{returnItem.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Refund Amount:</span>
                            <span className="font-medium text-green-600">₹{returnItem.refundAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Status Timeline</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Request Submitted</p>
                              <p className="text-xs text-gray-600">{new Date(returnItem.createdAt).toLocaleString()}</p>
                            </div>
                          </div>

                          {returnItem.status !== 'pending' && returnItem.status !== 'rejected' && (
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Approved by Seller</p>
                                <p className="text-xs text-gray-600">{returnItem.sellerResponse?.respondedAt ? new Date(returnItem.sellerResponse.respondedAt).toLocaleString() : 'Processing'}</p>
                              </div>
                            </div>
                          )}

                          {returnItem.status === 'rejected' && (
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">✗</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Request Rejected</p>
                                <p className="text-xs text-gray-600">{returnItem.sellerResponse?.message}</p>
                              </div>
                            </div>
                          )}

                          {['picked_up', 'received', 'refunded'].includes(returnItem.status) && (
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Item Picked Up</p>
                                <p className="text-xs text-gray-600">In transit to seller</p>
                              </div>
                            </div>
                          )}

                          {['received', 'refunded'].includes(returnItem.status) && (
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Item Received</p>
                                <p className="text-xs text-gray-600">Quality check completed</p>
                              </div>
                            </div>
                          )}

                          {returnItem.status === 'refunded' && (
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Refund Processed</p>
                                <p className="text-xs text-gray-600">{new Date(returnItem.refundedAt).toLocaleString()}</p>
                                {returnItem.refundTransactionId && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Transaction ID: {returnItem.refundTransactionId}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {returnItem.sellerResponse && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Seller Response:</p>
                        <p className="text-sm text-blue-800">{returnItem.sellerResponse.message}</p>
                      </div>
                    )}

                    {returnItem.status === 'refunded' && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 mb-2">💰 Refund Details</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-green-700">Amount Refunded:</p>
                            <p className="font-bold text-green-900">₹{returnItem.refundAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-green-700">Refund Method:</p>
                            <p className="font-bold text-green-900">Original Payment Method</p>
                          </div>
                        </div>
                        <p className="text-xs text-green-700 mt-3">
                          The refund will be credited to your account within 5-7 business days.
                        </p>
                      </div>
                    )}

                    {returnItem.pickupScheduled && returnItem.status === 'approved' && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">📦 Pickup Scheduled</p>
                        <p className="text-sm text-yellow-800">
                          Pickup Date: {new Date(returnItem.pickupScheduled).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-yellow-700 mt-2">
                          Please keep the item ready for pickup with original packaging and tags.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
