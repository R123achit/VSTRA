import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import axios from 'axios'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminAnalytics() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchAnalytics()
  }, [isAuthenticated, user])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>Analytics - VSTRA Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-black text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard">
                <h1 className="text-2xl font-bold cursor-pointer">VSTRA Admin</h1>
              </Link>
              <Link href="/admin/dashboard">
                <button className="text-sm bg-white text-black px-4 py-2 hover:bg-gray-200">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-4xl font-bold mb-8">Analytics & Insights</h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Revenue</p>
                      <p className="text-3xl font-bold mt-2">
                        ₹{analytics?.totalRevenue?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="text-4xl opacity-80">💰</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Orders</p>
                      <p className="text-3xl font-bold mt-2">{analytics?.totalOrders || 0}</p>
                    </div>
                    <div className="text-4xl opacity-80">📦</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Products</p>
                      <p className="text-3xl font-bold mt-2">{analytics?.totalProducts || 0}</p>
                    </div>
                    <div className="text-4xl opacity-80">🛍️</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{analytics?.totalUsers || 0}</p>
                    </div>
                    <div className="text-4xl opacity-80">👥</div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white shadow-lg p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-6">📈 Revenue Trend (Last 6 Months)</h3>
                {analytics?.revenueData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        name="Revenue (₹)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-600 text-center py-10">No revenue data yet</p>
                )}
              </div>

              {/* Orders by Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow-lg p-6 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6">📊 Orders by Status</h3>
                  {analytics?.ordersByStatus?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-600 text-center py-10">No orders yet</p>
                  )}
                </div>

                <div className="bg-white shadow-lg p-6 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6">📦 Top Categories</h3>
                  {analytics?.topCategories?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.topCategories}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" name="Products" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-600 text-center py-10">No data yet</p>
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white shadow-lg p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">🕒 Recent Orders</h3>
                {analytics?.recentOrders?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentOrders.map(order => (
                      <div key={order._id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                        <div>
                          <p className="font-semibold">{order.user?.name || 'Guest'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems?.length || 0} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-10">No orders yet</p>
                )}
              </div>

              {/* Low Stock Alert with Intelligence */}
              <div className="bg-white shadow-lg p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">⚠️ Low Stock Alert</h3>
                  {analytics?.lowStockProducts?.length > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                      {analytics.lowStockProducts.length} items need attention
                    </span>
                  )}
                </div>
                
                {analytics?.lowStockProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.lowStockProducts.map(product => {
                      // Calculate urgency level
                      const urgency = product.stock === 0 ? 'critical' : 
                                     product.stock < 3 ? 'high' : 
                                     product.stock < 5 ? 'medium' : 'low'
                      
                      const urgencyColors = {
                        critical: 'bg-red-100 border-red-500 text-red-900',
                        high: 'bg-orange-100 border-orange-500 text-orange-900',
                        medium: 'bg-yellow-100 border-yellow-500 text-yellow-900',
                        low: 'bg-blue-100 border-blue-500 text-blue-900'
                      }

                      const urgencyBadge = {
                        critical: 'bg-red-600 text-white',
                        high: 'bg-orange-600 text-white',
                        medium: 'bg-yellow-600 text-white',
                        low: 'bg-blue-600 text-white'
                      }

                      // Intelligent restock suggestion
                      const suggestedRestock = product.stock === 0 ? 50 :
                                              product.stock < 3 ? 30 :
                                              product.stock < 5 ? 20 : 15

                      return (
                        <div 
                          key={product._id} 
                          className={`border-l-4 p-4 rounded ${urgencyColors[urgency]}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-lg">{product.name}</p>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${urgencyBadge[urgency]}`}>
                                  {urgency.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm opacity-75">
                                Category: {product.category} • Price: ₹{product.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${product.stock === 0 ? 'text-red-600' : ''}`}>
                                {product.stock}
                              </p>
                              <p className="text-xs opacity-75">in stock</p>
                            </div>
                          </div>

                          {/* AI Recommendations */}
                          <div className="bg-white/50 rounded p-3 mb-3">
                            <p className="text-sm font-semibold mb-2">🤖 AI Recommendation:</p>
                            <div className="space-y-1 text-sm">
                              {product.stock === 0 && (
                                <p className="text-red-700">
                                  ⚠️ <strong>Out of Stock!</strong> Customers cannot purchase this item.
                                </p>
                              )}
                              <p>
                                💡 Suggested restock: <strong>{suggestedRestock} units</strong>
                              </p>
                              {product.rating > 4 && (
                                <p className="text-green-700">
                                  ⭐ High-rated product ({product.rating}★) - Priority restock recommended
                                </p>
                              )}
                              {product.numReviews > 10 && (
                                <p className="text-blue-700">
                                  🔥 Popular item ({product.numReviews} reviews) - High demand expected
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newStock = prompt(`Enter new stock quantity for "${product.name}":`, suggestedRestock)
                                if (newStock) {
                                  // You can add API call here to update stock
                                  alert(`Stock will be updated to ${newStock} units`)
                                }
                              }}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition-colors"
                            >
                              📦 Restock Now
                            </button>
                            <button
                              onClick={() => {
                                window.open(`/admin/products`, '_blank')
                              }}
                              className="px-4 py-2 border-2 border-gray-300 rounded text-sm font-semibold hover:bg-gray-100 transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-gray-600 text-lg font-semibold mb-2">All Products Well Stocked!</p>
                    <p className="text-sm text-gray-500">
                      No items below 10 units. Your inventory is healthy.
                    </p>
                  </div>
                )}

                {/* Stock Health Summary */}
                {analytics?.stockSummary && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">📊 Stock Health Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded">
                        <p className="text-2xl font-bold text-red-600">{analytics.stockSummary.outOfStock || 0}</p>
                        <p className="text-xs text-gray-600">Out of Stock</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <p className="text-2xl font-bold text-orange-600">{analytics.stockSummary.critical || 0}</p>
                        <p className="text-xs text-gray-600">Critical (&lt;3)</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <p className="text-2xl font-bold text-yellow-600">{analytics.stockSummary.low || 0}</p>
                        <p className="text-xs text-gray-600">Low (3-10)</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-2xl font-bold text-green-600">{analytics.stockSummary.healthy || 0}</p>
                        <p className="text-xs text-gray-600">Healthy (&gt;10)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="bg-white shadow-lg p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">🏆 Top Rated Products</h3>
                {analytics?.topProducts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.topProducts.map(product => (
                      <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-48 object-cover mb-3 rounded"
                        />
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.rating}★ ({product.numReviews} reviews)
                        </p>
                        <p className="font-bold mt-2">₹{product.price?.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-10">No products yet</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
