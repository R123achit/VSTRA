import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SellerReturns() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [returns, setReturns] = useState([])
  const [stats, setStats] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [responseMessage, setResponseMessage] = useState('')
  const [qualityCheckPassed, setQualityCheckPassed] = useState(true)
  const [qualityNotes, setQualityNotes] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    if (!token) {
      router.push('/seller-login')
      return
    }
    fetchReturns()
  }, [filterStatus])

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('sellerToken')
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await axios.get(`/api/seller/returns${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setReturns(response.data.returns)
        setStats(response.data.stats)
      }
    } catch (error) {
      toast.error('Failed to load returns')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    try {
      const token = localStorage.getItem('sellerToken')
      const payload = {
        action: actionType,
        message: responseMessage
      }

      if (actionType === 'mark_received') {
        payload.qualityCheck = {
          passed: qualityCheckPassed,
          notes: qualityNotes
        }
      }

      await axios.put(`/api/seller/returns/${selectedReturn._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Return request updated successfully')
      setShowModal(false)
      setSelectedReturn(null)
      setResponseMessage('')
      setQualityCheckPassed(true)
      setQualityNotes('')
      fetchReturns()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update return')
    }
  }

  const openModal = (returnItem, action) => {
    setSelectedReturn(returnItem)
    setActionType(action)
    setShowModal(true)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔄 Return Requests</h1>
              <p className="text-gray-600 mt-1">Manage customer return requests</p>
            </div>
            <Link href="/seller/dashboard">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <p className="text-sm text-blue-700">Approved</p>
              <p className="text-2xl font-bold text-blue-800">{stats.approved}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4">
              <p className="text-sm text-red-700">Rejected</p>
              <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected', 'picked_up', 'received', 'refunded'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Returns List */}
        {returns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Return Requests</h3>
            <p className="text-gray-600">Return requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((returnItem) => (
              <div key={returnItem._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row gap-6">
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
                          Order: #{returnItem.orderId?.orderNumber || returnItem.orderId?._id?.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Customer: {returnItem.userId?.name} ({returnItem.userId?.email})
                        </p>
                        <p className="text-sm text-gray-600">
                          Requested: {new Date(returnItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold mb-2">Return Reason:</p>
                      <p className="text-sm text-gray-700">{returnItem.reason}</p>
                      {returnItem.customReason && (
                        <p className="text-sm text-gray-700 mt-1">Details: {returnItem.customReason}</p>
                      )}
                      {returnItem.comments && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{returnItem.comments}"</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-semibold">{returnItem.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Refund Amount</p>
                        <p className="font-semibold">₹{returnItem.refundAmount?.toLocaleString()}</p>
                      </div>
                      {returnItem.pickupScheduled && (
                        <div>
                          <p className="text-gray-600">Pickup Date</p>
                          <p className="font-semibold">{new Date(returnItem.pickupScheduled).toLocaleDateString()}</p>
                        </div>
                      )}
                      {returnItem.refundedAt && (
                        <div>
                          <p className="text-gray-600">Refunded On</p>
                          <p className="font-semibold">{new Date(returnItem.refundedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {returnItem.sellerResponse && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-semibold text-blue-900">Your Response:</p>
                        <p className="text-sm text-blue-800">{returnItem.sellerResponse.message}</p>
                      </div>
                    )}

                    {returnItem.qualityCheck && (
                      <div className={`rounded-lg p-3 mb-4 ${returnItem.qualityCheck.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm font-semibold">Quality Check: {returnItem.qualityCheck.passed ? '✅ Passed' : '❌ Failed'}</p>
                        {returnItem.qualityCheck.notes && (
                          <p className="text-sm mt-1">{returnItem.qualityCheck.notes}</p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {returnItem.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openModal(returnItem, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => openModal(returnItem, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {returnItem.status === 'approved' && (
                        <button
                          onClick={() => openModal(returnItem, 'mark_picked_up')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
                        >
                          📦 Mark as Picked Up
                        </button>
                      )}
                      {returnItem.status === 'picked_up' && (
                        <button
                          onClick={() => openModal(returnItem, 'mark_received')}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
                        >
                          ✔️ Mark as Received
                        </button>
                      )}
                      {returnItem.status === 'received' && (
                        <button
                          onClick={() => openModal(returnItem, 'process_refund')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          💰 Process Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 capitalize">
              {actionType.replace('_', ' ')}
            </h3>

            {actionType === 'mark_received' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Quality Check</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={qualityCheckPassed}
                      onChange={() => setQualityCheckPassed(true)}
                      className="mr-2"
                    />
                    <span>✅ Item is in good condition</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!qualityCheckPassed}
                      onChange={() => setQualityCheckPassed(false)}
                      className="mr-2"
                    />
                    <span>❌ Item is damaged/not as expected</span>
                  </label>
                </div>
                <textarea
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  placeholder="Quality check notes..."
                  className="w-full mt-3 px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
            )}

            {(actionType === 'approve' || actionType === 'reject') && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Message to Customer</label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Enter your response..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="4"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setResponseMessage('')
                  setQualityCheckPassed(true)
                  setQualityNotes('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
