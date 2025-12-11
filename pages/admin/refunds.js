import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { useAuthStore } from '../../store/useStore'
import AdminNavbar from '../../components/AdminNavbar'

export default function AdminRefunds() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [returns, setReturns] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchRefunds()
  }, [isAuthenticated, user, filter])

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams()
      if (filter === 'manual') {
        params.append('requiresManual', 'true')
      } else if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await axios.get(`/api/admin/refunds?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setReturns(response.data.returns)
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching refunds:', error)
      toast.error('Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }

  const handleManualRefund = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter a transaction ID')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/refunds', {
        returnId: selectedReturn._id,
        refundTransactionId: transactionId,
        notes: notes || 'Refund processed manually by admin'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Manual refund recorded successfully!')
      setShowModal(false)
      setSelectedReturn(null)
      setTransactionId('')
      setNotes('')
      fetchRefunds()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record refund')
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

  const isManualRefund = (returnItem) => {
    return returnItem.refundTransactionId?.startsWith('MANUAL-REF-')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <AdminNavbar />

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">💰 Refund Management</h1>
              <p className="text-gray-600 mt-2">Manage and process customer refunds</p>
            </div>
            <Link href="/admin/dashboard">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-2">Total Refunds</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-2">Total Amount Refunded</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalRefunded?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-2">Pending Manual Processing</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingManual}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Refunds
              </button>
              <button
                onClick={() => setFilter('manual')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'manual'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Requires Manual Processing ({stats?.pendingManual || 0})
              </button>
              <button
                onClick={() => setFilter('refunded')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'refunded'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Refunds List */}
          {returns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Refunds Found</h3>
              <p className="text-gray-600">
                {filter === 'manual' 
                  ? 'No refunds require manual processing at this time.'
                  : 'Refund requests will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((returnItem) => (
                <div key={returnItem._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <img
                      src={returnItem.productId?.images?.[0]}
                      alt={returnItem.itemName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{returnItem.itemName}</h3>
                          <p className="text-sm text-gray-600">
                            Return ID: #{returnItem._id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Order: #{returnItem.orderId?.orderNumber || returnItem.orderId?._id?.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Customer: {returnItem.userId?.name} ({returnItem.userId?.email})
                          </p>
                          <p className="text-sm text-gray-600">
                            Seller: {returnItem.sellerId?.businessName}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(returnItem.status)}`}>
                          {returnItem.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">Refund Amount</p>
                          <p className="font-semibold text-green-600">₹{returnItem.refundAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reason</p>
                          <p className="font-semibold">{returnItem.reason}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Requested</p>
                          <p className="font-semibold">{new Date(returnItem.createdAt).toLocaleDateString()}</p>
                        </div>
                        {returnItem.refundedAt && (
                          <div>
                            <p className="text-gray-600">Refunded</p>
                            <p className="font-semibold">{new Date(returnItem.refundedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {/* Transaction Details */}
                      {returnItem.refundTransactionId && (
                        <div className={`p-3 rounded-lg mb-4 ${
                          isManualRefund(returnItem) ? 'bg-orange-50' : 'bg-green-50'
                        }`}>
                          <p className="text-sm font-semibold mb-1">
                            {isManualRefund(returnItem) ? '⚠️ Manual Refund Required' : '✅ Refund Processed'}
                          </p>
                          <p className="text-sm">
                            Transaction ID: <span className="font-mono">{returnItem.refundTransactionId}</span>
                          </p>
                          {returnItem.orderId?.paymentResult?.id && (
                            <p className="text-sm">
                              Payment ID: <span className="font-mono">{returnItem.orderId.paymentResult.id}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Seller Response */}
                      {returnItem.sellerResponse && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <p className="text-sm font-semibold text-blue-900">Seller Response:</p>
                          <p className="text-sm text-blue-800">{returnItem.sellerResponse.message}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      {isManualRefund(returnItem) && (
                        <button
                          onClick={() => {
                            setSelectedReturn(returnItem)
                            setShowModal(true)
                          }}
                          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                        >
                          💳 Process Manual Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manual Refund Modal */}
      {showModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold mb-4">💳 Process Manual Refund</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">Return Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Product:</p>
                  <p className="font-semibold">{selectedReturn.itemName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Customer:</p>
                  <p className="font-semibold">{selectedReturn.userId?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Refund Amount:</p>
                  <p className="font-semibold text-green-600">₹{selectedReturn.refundAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment ID:</p>
                  <p className="font-mono text-xs">{selectedReturn.orderId?.paymentResult?.id || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Refund Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g., TXN123456789 or Bank Reference Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Enter the transaction ID from your payment gateway or bank transfer
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this refund..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> Make sure you have processed the actual refund through your payment gateway or bank before recording it here.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedReturn(null)
                  setTransactionId('')
                  setNotes('')
                }}
                className="flex-1 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleManualRefund}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                ✅ Confirm Refund Processed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
