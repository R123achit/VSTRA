import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import axios from 'axios'

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
              {/* Recent Orders */}
              <div className="bg-white shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4">Recent Orders</h3>
                {analytics?.recentOrders?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentOrders.map(order => (
                      <div key={order._id} className="flex justify-between items-center p-4 bg-gray-50">
                        <div>
                          <p className="font-semibold">{order.user?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold">${order.totalPrice}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No orders yet</p>
                )}
              </div>

              {/* Low Stock Alert */}
              <div className="bg-white shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4">⚠️ Low Stock Alert</h3>
                {analytics?.lowStockProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.lowStockProducts.map(product => (
                      <div key={product._id} className="flex justify-between items-center p-4 bg-red-50">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <span className="px-4 py-2 bg-red-600 text-white font-bold rounded">
                          {product.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">All products are well stocked</p>
                )}
              </div>

              {/* Top Products */}
              <div className="bg-white shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4">🏆 Top Rated Products</h3>
                {analytics?.topProducts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.topProducts.map(product => (
                      <div key={product._id} className="border p-4">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-48 object-cover mb-3"
                        />
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.rating}★ ({product.numReviews} reviews)
                        </p>
                        <p className="font-bold mt-2">${product.price}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No products yet</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
