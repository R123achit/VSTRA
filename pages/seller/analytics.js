import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SellerAnalytics() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    if (!token) {
      router.push('/seller-login')
      return
    }
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('sellerToken')
      const response = await axios.get('/api/seller/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setAnalytics(response.data.analytics)
      }
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusData = () => {
    if (!analytics?.orders?.byStatus) return []
    return analytics.orders.byStatus.map(item => ({
      status: item._id,
      count: item.count,
      color: {
        pending: '#FCD34D',
        processing: '#60A5FA',
        shipped: '#A78BFA',
        delivered: '#34D399',
        cancelled: '#F87171'
      }[item._id] || '#9CA3AF'
    }))
  }

  const getStockPercentage = () => {
    const total = analytics?.products?.total || 0
    const outOfStock = analytics?.products?.outOfStock || 0
    if (total === 0) return { inStock: 0, outOfStock: 0 }
    return {
      inStock: ((total - outOfStock) / total) * 100,
      outOfStock: (outOfStock / total) * 100
    }
  }

  const getRevenueBreakdown = () => {
    const totalSales = analytics?.earnings?.totalSales || 0
    const commission = analytics?.earnings?.totalCommission || 0
    const earnings = analytics?.earnings?.totalEarnings || 0
    if (totalSales === 0) return { commission: 0, earnings: 0 }
    return {
      commission: (commission / totalSales) * 100,
      earnings: (earnings / totalSales) * 100
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-600 mt-1">Track your performance</p>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <p className="text-4xl font-bold mt-2">{analytics?.orders?.total || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-sm">+{analytics?.orders?.last30Days || 0} this month</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm">Products</p>
                <p className="text-4xl font-bold mt-2">{analytics?.products?.total || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-purple-100 text-sm">{analytics?.products?.outOfStock || 0} out of stock</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm">Total Sales</p>
                <p className="text-3xl font-bold mt-2">₹{(analytics?.earnings?.totalSales || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-sm">Gross revenue</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm">Net Earnings</p>
                <p className="text-3xl font-bold mt-2">₹{(analytics?.earnings?.totalEarnings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-orange-100 text-sm">After commission</p>
          </div>
        </div>

        {/* Visual Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="bg-blue-100 p-2 rounded-lg mr-3">📊</span>
              Order Status
            </h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                {getOrderStatusData().length > 0 ? (
                  <>
                    {getOrderStatusData().map((item, idx) => {
                      const total = analytics?.orders?.total || 1
                      const percentage = (item.count / total) * 100
                      const prevPercentages = getOrderStatusData().slice(0, idx).reduce((sum, i) => sum + (i.count / total) * 100, 0)
                      return (
                        <div
                          key={idx}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(${item.color} ${prevPercentages}% ${prevPercentages + percentage}%, transparent ${prevPercentages + percentage}%)`
                          }}
                        />
                      )
                    })}
                    <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{analytics?.orders?.total || 0}</p>
                        <p className="text-xs text-gray-600">Orders</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-100 rounded-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No data</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {getOrderStatusData().map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="capitalize">{item.status}</span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-3">📦</span>
              Stock Status
            </h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                {analytics?.products?.total > 0 ? (
                  <>
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#34D399 0% ${getStockPercentage().inStock}%, #F87171 ${getStockPercentage().inStock}% 100%)`
                      }}
                    />
                    <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{analytics?.products?.total || 0}</p>
                        <p className="text-xs text-gray-600">Products</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-100 rounded-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No products</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>In Stock</span>
                </div>
                <span className="font-semibold">{(analytics?.products?.total || 0) - (analytics?.products?.outOfStock || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Out of Stock</span>
                </div>
                <span className="font-semibold">{analytics?.products?.outOfStock || 0}</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="bg-green-100 p-2 rounded-lg mr-3">💰</span>
              Revenue Split
            </h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                {analytics?.earnings?.totalSales > 0 ? (
                  <>
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#34D399 0% ${getRevenueBreakdown().earnings}%, #F87171 ${getRevenueBreakdown().earnings}% 100%)`
                      }}
                    />
                    <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">₹{((analytics?.earnings?.totalSales || 0) / 1000).toFixed(1)}k</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-100 rounded-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No sales</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Your Earnings</span>
                </div>
                <span className="font-semibold">₹{(analytics?.earnings?.totalEarnings || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Commission</span>
                </div>
                <span className="font-semibold">₹{(analytics?.earnings?.totalCommission || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
          {!analytics?.topProducts || analytics.topProducts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.topProducts.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                  <img 
                    src={item.product?.images?.[0]} 
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.totalSold} units sold • ₹{item.revenue?.toLocaleString()} revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Commission Rate</p>
              <p className="text-2xl font-bold text-purple-600">{analytics?.seller?.commissionRate || 10}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seller Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {analytics?.seller?.rating || 0} ⭐ ({analytics?.seller?.numReviews || 0} reviews)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
