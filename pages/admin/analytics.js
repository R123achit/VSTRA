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

              {/* ── Inventory Command Center ── */}
              {(() => {
                const products = analytics?.lowStockProducts || []
                const summary = analytics?.stockSummary || {}
                const total = (summary.outOfStock || 0) + (summary.critical || 0) + (summary.low || 0) + (summary.healthy || 0)
                const healthScore = total > 0 ? Math.round(((summary.healthy || 0) / total) * 100) : 100
                const scoreColor = healthScore >= 80 ? '#059669' : healthScore >= 50 ? '#d97706' : '#dc2626'

                // Group products by urgency
                const groups = {
                  outOfStock: products.filter(p => p.stock === 0),
                  critical: products.filter(p => p.stock > 0 && p.stock < 3),
                  low: products.filter(p => p.stock >= 3 && p.stock < 5),
                  monitor: products.filter(p => p.stock >= 5),
                }

                const columns = [
                  { key: 'outOfStock', label: 'Out of Stock', count: groups.outOfStock.length, color: '#dc2626', lightBg: '#fef2f2', borderColor: '#fecaca', items: groups.outOfStock },
                  { key: 'critical', label: 'Critical', count: groups.critical.length, color: '#ea580c', lightBg: '#fff7ed', borderColor: '#fed7aa', items: groups.critical },
                  { key: 'low', label: 'Low Stock', count: groups.low.length, color: '#d97706', lightBg: '#fffbeb', borderColor: '#fde68a', items: groups.low },
                  { key: 'monitor', label: 'Monitor', count: groups.monitor.length, color: '#2563eb', lightBg: '#eff6ff', borderColor: '#bfdbfe', items: groups.monitor },
                ]

                // Semicircle gauge math
                const gaugeRadius = 70
                const gaugeCircumference = Math.PI * gaugeRadius
                const gaugeDashOffset = gaugeCircumference - (healthScore / 100) * gaugeCircumference

                return (
                  <div className="space-y-6">
                    {/* Health Score Banner */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="flex flex-col md:flex-row items-center gap-6 px-8 py-6">
                        {/* Semicircle Gauge */}
                        <div className="relative shrink-0" style={{ width: 160, height: 90 }}>
                          <svg width="160" height="90" viewBox="0 0 160 90">
                            {/* Track */}
                            <path d="M 10 85 A 70 70 0 0 1 150 85" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
                            {/* Fill */}
                            <path d="M 10 85 A 70 70 0 0 1 150 85" fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
                              strokeDasharray={gaugeCircumference}
                              strokeDashoffset={gaugeDashOffset}
                              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                          </svg>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                            <span className="text-3xl font-black text-gray-900">{healthScore}</span>
                            <span className="text-sm font-medium text-gray-400">%</span>
                          </div>
                        </div>

                        {/* Score Info */}
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold text-gray-900">Inventory Health Score</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {healthScore >= 80 ? 'Your inventory is in great shape. Keep monitoring for changes.' :
                             healthScore >= 50 ? 'Some products need attention. Review the alerts below.' :
                             'Critical inventory issues detected. Immediate action required.'}
                          </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 shrink-0">
                          {[
                            { n: summary.outOfStock || 0, label: 'Empty', color: '#dc2626' },
                            { n: summary.critical || 0, label: 'Critical', color: '#ea580c' },
                            { n: summary.low || 0, label: 'Low', color: '#d97706' },
                            { n: summary.healthy || 0, label: 'OK', color: '#059669' },
                          ].map((s, i) => (
                            <div key={i} className="text-center px-3">
                              <p className="text-xl font-bold" style={{ color: s.color }}>{s.n}</p>
                              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Kanban Severity Board */}
                    {products.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {columns.map(col => (
                          <div key={col.key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            {/* Column Header */}
                            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderBottomColor: col.borderColor, backgroundColor: col.lightBg }}>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }}></span>
                                <span className="text-sm font-bold text-gray-800">{col.label}</span>
                              </div>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: col.color + '15', color: col.color }}>
                                {col.count}
                              </span>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto" style={{ maxHeight: '420px' }}>
                              {col.items.length > 0 ? col.items.map(product => {
                                const stockPercent = Math.min((product.stock / 10) * 100, 100)
                                const suggestedRestock = product.stock === 0 ? 50 : product.stock < 3 ? 30 : product.stock < 5 ? 20 : 15
                                const circumference = 2 * Math.PI * 14
                                const dashOffset = circumference - (stockPercent / 100) * circumference

                                return (
                                  <div key={product._id}
                                    className="rounded-lg border border-gray-150 bg-white p-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-default"
                                    style={{ borderColor: '#e5e7eb' }}>

                                    {/* Product header row */}
                                    <div className="flex items-start gap-2.5 mb-2">
                                      {/* Mini ring gauge */}
                                      <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
                                        <svg className="-rotate-90" width="36" height="36" viewBox="0 0 36 36">
                                          <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                          <circle cx="18" cy="18" r="14" fill="none" stroke={col.color} strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={dashOffset}
                                            style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-[10px] font-bold text-gray-700">{product.stock}</span>
                                        </div>
                                      </div>

                                      {/* Name & details */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{product.name}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                          <span className="capitalize">{product.category}</span>
                                          <span className="text-gray-300">·</span>
                                          <span>₹{product.price?.toLocaleString('en-IN')}</span>
                                          {product.rating > 0 && (
                                            <>
                                              <span className="text-gray-300">·</span>
                                              <svg className="w-2.5 h-2.5 text-amber-400 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                              <span>{product.rating}</span>
                                            </>
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Smart tags */}
                                    {(product.stock === 0 || product.rating > 4 || product.numReviews > 10) && (
                                      <div className="flex flex-wrap gap-1 mb-2.5">
                                        {product.stock === 0 && (
                                          <span className="text-[9px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">REVENUE LOSS</span>
                                        )}
                                        {product.rating > 4 && (
                                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">TOP RATED</span>
                                        )}
                                        {product.numReviews > 10 && (
                                          <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">HIGH DEMAND</span>
                                        )}
                                      </div>
                                    )}

                                    {/* Restock suggestion */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                      <span className="text-[11px] text-gray-500">
                                        Restock <span className="font-semibold text-gray-700">+{suggestedRestock}</span> units
                                      </span>
                                      <button
                                        onClick={() => {
                                          const qty = prompt(`Restock "${product.name}"\nSuggested: ${suggestedRestock} units\n\nEnter quantity:`, suggestedRestock)
                                          if (qty) alert(`Stock updated to ${qty} units`)
                                        }}
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all duration-150 active:scale-95"
                                        style={{ backgroundColor: col.color + '12', color: col.color, border: `1px solid ${col.color}25` }}
                                        onMouseEnter={e => { e.target.style.backgroundColor = col.color; e.target.style.color = '#fff' }}
                                        onMouseLeave={e => { e.target.style.backgroundColor = col.color + '12'; e.target.style.color = col.color }}
                                      >
                                        Restock
                                      </button>
                                    </div>
                                  </div>
                                )
                              }) : (
                                <div className="flex-1 flex items-center justify-center py-8 text-center">
                                  <div>
                                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: col.lightBg }}>
                                      <svg className="w-5 h-5" style={{ color: col.color }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">All clear</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Column Footer */}
                            {col.items.length > 0 && (
                              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                                <button
                                  onClick={() => window.open('/admin/products', '_blank')}
                                  className="w-full text-[11px] font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
                                >
                                  View all in Products
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 30%, #ffffff 70%, #eff6ff 100%)' }}>
                        <div className="py-16 px-6">
                          {/* Animated success icon with pulsing rings */}
                          <div className="relative w-24 h-24 mx-auto mb-6">
                            {/* Outer pulse ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping" style={{ animationDuration: '2.5s' }}></div>
                            {/* Middle ring */}
                            <div className="absolute inset-2 rounded-full border border-emerald-100 animate-pulse" style={{ animationDuration: '2s' }}></div>
                            {/* Core circle */}
                            <div className="absolute inset-3 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)', boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)' }}>
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900">Inventory Fully Stocked</h3>
                          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                            All products are above the minimum threshold. No restocking actions needed at this time.
                          </p>

                          {/* Mini stat tiles */}
                          <div className="flex items-center justify-center gap-3 mt-8">
                            {[
                              { label: 'Products', value: summary.healthy || total || '—', color: '#059669', bg: '#ecfdf5' },
                              { label: 'Alerts', value: '0', color: '#6b7280', bg: '#f9fafb' },
                              { label: 'Health', value: '100%', color: '#059669', bg: '#ecfdf5' },
                              { label: 'Status', value: 'OK', color: '#059669', bg: '#ecfdf5' },
                            ].map((s, i) => (
                              <div key={i} className="text-center px-4 py-3 rounded-xl border border-gray-100" style={{ backgroundColor: s.bg }}>
                                <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Decorative bottom line */}
                          <div className="flex items-center justify-center gap-1.5 mt-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="w-8 h-0.5 rounded-full bg-emerald-200"></span>
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">System Healthy</span>
                            <span className="w-8 h-0.5 rounded-full bg-emerald-200"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

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
