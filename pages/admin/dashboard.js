import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import axios from 'axios'

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
    
    // Check if user is admin
    if (user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchStats()
  }, [isAuthenticated, user, router])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
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
        <title>Admin Dashboard - VSTRA</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Admin Navbar */}
        <nav className="bg-black text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold">VSTRA Admin</h1>
                <div className="hidden md:flex gap-6">
                  <Link href="/admin/dashboard">
                    <span className="text-sm hover:text-gray-300 cursor-pointer">Dashboard</span>
                  </Link>
                  <Link href="/admin/products">
                    <span className="text-sm hover:text-gray-300 cursor-pointer">Products</span>
                  </Link>
                  <Link href="/admin/orders">
                    <span className="text-sm hover:text-gray-300 cursor-pointer">Orders</span>
                  </Link>
                  <Link href="/admin/users">
                    <span className="text-sm hover:text-gray-300 cursor-pointer">Users</span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="text-sm bg-white text-black px-4 py-2 hover:bg-gray-200 transition-colors">
                    View Site
                  </button>
                </Link>
                <Link href="/admin/profile">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-slate-600/50">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-8">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 shadow-lg border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm mb-2">Total Products</p>
                <p className="text-4xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="bg-white p-6 shadow-lg border-l-4 border-green-600">
                <p className="text-gray-600 text-sm mb-2">Total Orders</p>
                <p className="text-4xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="bg-white p-6 shadow-lg border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                <p className="text-4xl font-bold">
                  ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
                </p>
              </div>
              <div className="bg-white p-6 shadow-lg border-l-4 border-orange-600">
                <p className="text-gray-600 text-sm mb-2">Total Users</p>
                <p className="text-4xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-8 shadow-lg mb-12">
              <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/admin/add-product">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">➕</div>
                    <h4 className="font-semibold mb-2">Add Product</h4>
                    <p className="text-sm text-gray-600">Add new product to store</p>
                  </div>
                </Link>
                <Link href="/admin/products">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">📦</div>
                    <h4 className="font-semibold mb-2">Manage Products</h4>
                    <p className="text-sm text-gray-600">Edit or delete products</p>
                  </div>
                </Link>
                <Link href="/admin/orders">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">📋</div>
                    <h4 className="font-semibold mb-2">View Orders</h4>
                    <p className="text-sm text-gray-600">Manage customer orders</p>
                  </div>
                </Link>
                <Link href="/admin/seed-500">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">🌱</div>
                    <h4 className="font-semibold mb-2">Seed Products</h4>
                    <p className="text-sm text-gray-600">Add 500 sample products</p>
                  </div>
                </Link>
                <Link href="/admin/analytics">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">📊</div>
                    <h4 className="font-semibold mb-2">Analytics</h4>
                    <p className="text-sm text-gray-600">View insights & reports</p>
                  </div>
                </Link>
                <Link href="/admin/users">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">👥</div>
                    <h4 className="font-semibold mb-2">Manage Users</h4>
                    <p className="text-sm text-gray-600">View and manage users</p>
                  </div>
                </Link>
                <Link href="/admin/settings">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">⚙️</div>
                    <h4 className="font-semibold mb-2">Settings</h4>
                    <p className="text-sm text-gray-600">Configure admin panel</p>
                  </div>
                </Link>
                <Link href="/admin/bulk-upload">
                  <div className="p-6 border-2 border-gray-200 hover:border-black cursor-pointer transition-colors">
                    <div className="text-3xl mb-3">📤</div>
                    <h4 className="font-semibold mb-2">Bulk Upload</h4>
                    <p className="text-sm text-gray-600">Upload products via CSV</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-semibold">Database Connected</p>
                    <p className="text-sm text-gray-600">MongoDB Atlas is running</p>
                  </div>
                  <span className="text-sm text-gray-500">Just now</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-semibold">{stats.totalProducts} Products Available</p>
                    <p className="text-sm text-gray-600">Ready for customers</p>
                  </div>
                  <span className="text-sm text-gray-500">Today</span>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}

