import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SellerNotifications() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    if (!token) {
      router.push('/seller-login')
      return
    }
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('sellerToken')
      const params = filter === 'unread' ? '?unreadOnly=true' : ''
      const response = await axios.get(`/api/seller/notifications${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setNotifications(response.data.notifications)
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('sellerToken')
      await axios.put('/api/seller/notifications/mark-read',
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('sellerToken')
      await axios.put('/api/seller/notifications/mark-read',
        { markAll: true },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('sellerToken')
      await axios.delete('/api/seller/notifications/delete',
        { 
          data: { notificationId },
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      toast.success('Notification deleted')
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      new_order: '🎉',
      order_cancelled: '❌',
      low_stock: '⚠️',
      out_of_stock: '🚫',
      payment_received: '💰',
      payment_pending: '⏳',
      new_review: '⭐',
      account_approved: '✅',
      account_blocked: '🚫',
      commission_updated: '📊',
      return_request: '↩️',
      general: '📢',
    }
    return icons[type] || '📢'
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
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
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
        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'unread'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow p-6 transition-all ${
                  !notification.read ? 'border-l-4 border-purple-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex gap-2">
                      {notification.link && (
                        <Link href={notification.link}>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                            View Details
                          </button>
                        </Link>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
