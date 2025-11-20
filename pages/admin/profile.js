import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuthStore } from '../../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function AdminProfile() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
    if (user?.role !== 'admin') {
      router.push('/')
      return
    }
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
    fetchStats()
  }, [isAuthenticated, user])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(
        '/api/admin/profile',
        {
          name: formData.name,
          email: formData.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      updateUser(data.user)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        '/api/admin/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success('Password changed successfully!')
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <nav className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard">
              <h1 className="text-2xl font-bold text-white cursor-pointer hover:text-gray-300 transition-colors">
                VSTRA Admin
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <button className="text-sm text-white/70 hover:text-white transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
            >
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 ring-4 ring-slate-600/50">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
                <p className="text-sm text-white/60">{user?.email}</p>
                <span className="inline-block mt-3 px-4 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-full">
                  Administrator
                </span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Total Orders</div>
                  <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Total Products</div>
                  <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-white">${stats.totalRevenue}</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  👤 Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  🔒 Security
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'activity'
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  📊 Activity Log
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Profile Settings</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </motion.button>
                  </form>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Security Settings</h3>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </motion.button>
                  </form>

                  {/* Additional Security Options */}
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">Additional Security</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">Two-Factor Authentication</div>
                          <div className="text-sm text-white/60">Add an extra layer of security</div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                          Enable
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">Login Notifications</div>
                          <div className="text-sm text-white/60">Get notified of new logins</div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Log */}
              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">✅ Login Successful</span>
                        <span className="text-sm text-white/60">2 hours ago</span>
                      </div>
                      <p className="text-sm text-white/60">Logged in from Windows PC</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">📦 Product Added</span>
                        <span className="text-sm text-white/60">5 hours ago</span>
                      </div>
                      <p className="text-sm text-white/60">Added new product to catalog</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">⚙️ Settings Updated</span>
                        <span className="text-sm text-white/60">1 day ago</span>
                      </div>
                      <p className="text-sm text-white/60">Changed store settings</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">📊 Report Generated</span>
                        <span className="text-sm text-white/60">2 days ago</span>
                      </div>
                      <p className="text-sm text-white/60">Monthly sales report created</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

