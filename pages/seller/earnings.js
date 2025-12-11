import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SellerEarnings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    if (!token) {
      router.push('/seller-login')
      return
    }
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('sellerToken')
      const response = await axios.get('/api/seller/earnings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setEarnings(response.data)
      }
    } catch (error) {
      toast.error('Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  const getNextSettlementDate = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const nextSettlement = new Date(today)
    nextSettlement.setDate(today.getDate() + daysUntilMonday)
    return nextSettlement.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateDeductions = (commission) => {
    const pgFee = commission.orderAmount * 0.02 // 2% payment gateway
    const shippingFee = commission.shippingDeduction || 50
    const gstOnFees = (commission.commissionAmount + pgFee + shippingFee) * 0.18
    return {
      commission: commission.commissionAmount,
      pgFee,
      shippingFee,
      gstOnFees,
      total: commission.commissionAmount + pgFee + shippingFee + gstOnFees
    }
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
              <h1 className="text-3xl font-bold text-gray-900">💰 Earnings & Settlements</h1>
              <p className="text-gray-600 mt-1">Flipkart-style settlement system • Next payout: {getNextSettlementDate()}</p>
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
        {/* Settlement Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Next Settlement Date: {getNextSettlementDate()}</span> • 
                Amount to be settled: ₹{earnings?.summary?.totalSettlement?.toLocaleString() || 0} • 
                Settlements happen every Monday
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-2">💵 Total Sales</p>
            <p className="text-3xl font-bold">
              ₹{earnings?.summary?.totalSales?.toLocaleString() || 0}
            </p>
            <p className="text-xs opacity-75 mt-2">Gross revenue from orders</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-2">📉 Total Deductions</p>
            <p className="text-3xl font-bold">
              -₹{(earnings?.summary?.totalCommission + earnings?.summary?.totalDeductions)?.toLocaleString() || 0}
            </p>
            <p className="text-xs opacity-75 mt-2">Commission + Fees + GST</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-2">✅ Net Earnings</p>
            <p className="text-3xl font-bold">
              ₹{earnings?.summary?.totalEarnings?.toLocaleString() || 0}
            </p>
            <p className="text-xs opacity-75 mt-2">After all deductions</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-2">⏳ Pending Settlement</p>
            <p className="text-3xl font-bold">
              ₹{earnings?.summary?.totalSettlement?.toLocaleString() || 0}
            </p>
            <p className="text-xs opacity-75 mt-2">To be paid on {getNextSettlementDate()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💳 Order-wise Earnings
              </button>
              <button
                onClick={() => setActiveTab('deductions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'deductions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📉 Deduction Breakdown
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">📈 Earnings Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Revenue Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-semibold">{earnings?.commissions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Sales:</span>
                    <span className="font-semibold">₹{earnings?.summary?.totalSales?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Commission Paid:</span>
                    <span className="font-semibold">-₹{earnings?.summary?.totalCommission?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Other Deductions:</span>
                    <span className="font-semibold">-₹{earnings?.summary?.totalDeductions?.toLocaleString() || 0}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-green-600 text-lg">
                    <span className="font-bold">Net Earnings:</span>
                    <span className="font-bold">₹{earnings?.summary?.totalEarnings?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Settlement Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Settlement:</span>
                    <span className="font-semibold text-yellow-600">₹{earnings?.summary?.totalSettlement?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Payout Date:</span>
                    <span className="font-semibold">{getNextSettlementDate()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Settlement Cycle:</span>
                    <span className="font-semibold">Every Monday</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">
                      💡 Settlements are processed every Monday. Orders delivered before Sunday will be included in the next settlement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">💳 Order-wise Earnings</h2>
              <p className="text-sm text-gray-600 mt-1">Click on any order to see detailed breakdown</p>
            </div>
            
            {!earnings?.commissions || earnings.commissions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
                <p className="text-gray-600">Your earnings will appear here once orders are completed</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earnings.commissions.map((commission) => {
                      const deductions = calculateDeductions(commission)
                      return (
                        <tr key={commission._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(commission.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                            #{commission.orderId?._id?.slice(-8) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            ₹{commission.orderAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {commission.commissionRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            -₹{deductions.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                            ₹{commission.finalSettlement?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                              commission.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {commission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setSelectedOrder(commission)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Details →
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deductions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">📉 Deduction Breakdown</h2>
            <div className="space-y-4">
              {earnings?.commissions?.map((commission) => {
                const deductions = calculateDeductions(commission)
                return (
                  <div key={commission._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">Order #{commission.orderId?._id?.slice(-8)}</span>
                      <span className="text-sm text-gray-600">{new Date(commission.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Product Price</p>
                        <p className="font-semibold">₹{commission.orderAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Commission ({commission.commissionRate}%)</p>
                        <p className="font-semibold text-red-600">-₹{deductions.commission.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">PG Fee (2%)</p>
                        <p className="font-semibold text-red-600">-₹{deductions.pgFee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Shipping</p>
                        <p className="font-semibold text-red-600">-₹{deductions.shippingFee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">GST (18%)</p>
                        <p className="font-semibold text-red-600">-₹{deductions.gstOnFees.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="font-semibold">Net Earnings:</span>
                      <span className="text-lg font-bold text-green-600">₹{commission.finalSettlement?.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold">#{selectedOrder.orderId?._id?.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">💰 Financial Breakdown</h4>
                  <div className="space-y-2 bg-gray-50 p-4 rounded">
                    <div className="flex justify-between">
                      <span>Product Selling Price:</span>
                      <span className="font-semibold">₹{selectedOrder.orderAmount}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Commission ({selectedOrder.commissionRate}%):</span>
                      <span>-₹{selectedOrder.commissionAmount}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Payment Gateway Fee (2%):</span>
                      <span>-₹{(selectedOrder.orderAmount * 0.02).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Shipping Fee:</span>
                      <span>-₹{selectedOrder.shippingDeduction || 50}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>GST on Fees (18%):</span>
                      <span>-₹{calculateDeductions(selectedOrder).gstOnFees.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-600">
                      <span>Your Net Earnings:</span>
                      <span>₹{selectedOrder.finalSettlement}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Settlement Status</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedOrder.status === 'paid' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                    {selectedOrder.status === 'pending' && (
                      <span className="text-sm text-gray-600">• Will be settled on {getNextSettlementDate()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
