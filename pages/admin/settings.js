import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AdminSettings() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchStats()
  }, [isAuthenticated, user])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearOrders = async () => {
    if (!confirm('⚠️ This will delete ALL orders. Are you sure?')) return

    try {
      toast.success('Feature coming soon')
    } catch (error) {
      toast.error('Failed to clear orders')
    }
  }

  const handleClearProducts = async () => {
    if (!confirm('⚠️ This will delete ALL products. Are you sure?')) return

    try {
      toast.success('Feature coming soon')
    } catch (error) {
      toast.error('Failed to clear products')
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>Settings - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />

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

        <main className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-4xl font-bold mb-8">Admin Settings</h2>

          {/* Database Info */}
          <div className="bg-white shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold mb-4">📊 Database Status</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalProducts || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Products</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <p className="text-3xl font-bold text-green-600">{stats?.totalOrders || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Orders</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <p className="text-3xl font-bold text-purple-600">${stats?.totalRevenue || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Revenue</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <p className="text-3xl font-bold text-orange-600">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Users</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold mb-4">🚀 Quick Actions</h3>
            <div className="space-y-4">
              <Link href="/admin/seed-500">
                <button className="w-full bg-green-600 text-white py-3 px-6 hover:bg-green-700 text-left">
                  <span className="font-semibold">🌱 Seed 500 Products</span>
                  <p className="text-sm mt-1 opacity-90">Add sample products to database</p>
                </button>
              </Link>
              <Link href="/admin/add-product">
                <button className="w-full bg-blue-600 text-white py-3 px-6 hover:bg-blue-700 text-left">
                  <span className="font-semibold">➕ Add New Product</span>
                  <p className="text-sm mt-1 opacity-90">Create a single product manually</p>
                </button>
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white shadow-lg p-8 border-2 border-red-200">
            <h3 className="text-2xl font-bold mb-4 text-red-600">⚠️ Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-6">
              These actions are irreversible. Use with caution.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleClearProducts}
                className="w-full bg-red-600 text-white py-3 px-6 hover:bg-red-700 text-left"
              >
                <span className="font-semibold">🗑️ Clear All Products</span>
                <p className="text-sm mt-1 opacity-90">Delete all products from database</p>
              </button>
              <button
                onClick={handleClearOrders}
                className="w-full bg-red-600 text-white py-3 px-6 hover:bg-red-700 text-left"
              >
                <span className="font-semibold">🗑️ Clear All Orders</span>
                <p className="text-sm mt-1 opacity-90">Delete all orders from database</p>
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white shadow-lg p-8 mt-6">
            <h3 className="text-2xl font-bold mb-4">ℹ️ System Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Platform</span>
                <span className="font-semibold">Next.js + MongoDB</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Database</span>
                <span className="font-semibold">MongoDB Atlas</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Admin Email</span>
                <span className="font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Version</span>
                <span className="font-semibold">1.0.0</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

