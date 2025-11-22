import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import AdminNavbar from '../../components/AdminNavbar'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AdminOrders() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated, user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login as admin')
        router.push('/admin/login')
        return
      }

      console.log('Fetching admin orders...')
      const response = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Admin orders response:', response.data)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login as admin')
        router.push('/admin/login')
        return
      }

      console.log('Updating order status:', { orderId, newStatus })
      
      const response = await axios.put(`/api/admin/orders/${orderId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      
      console.log('Status update response:', response.data)
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Status update error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Failed to update order')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>Manage Orders - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
          <h2 className="text-4xl font-bold mb-8">Manage Orders</h2>

          <div className="bg-white shadow-lg">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600 text-lg mb-4">No orders yet</p>
                <p className="text-sm text-gray-500">Orders will appear here when customers make purchases</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Items</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm">#{order._id.slice(-8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold">{order.user?.name || 'Guest'}</p>
                          <p className="text-sm text-gray-600">{order.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {order.orderItems.length}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          ₹{order.totalPrice}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              const details = `
Order Details:
- Order ID: ${order._id}
- Customer: ${order.user?.name} (${order.user?.email})
- Items: ${order.orderItems.map(item => `\n  • ${item.name} x${item.quantity} - ₹${item.price}`).join('')}
- Shipping: ${order.shippingAddress.fullName}, ${order.shippingAddress.city}
- Total: ₹${order.totalPrice}
                              `
                              alert(details)
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

