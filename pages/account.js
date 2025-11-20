import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuthStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'

export default function Account() {
  const router = useRouter()
  const { isAuthenticated, user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
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
  }, [isAuthenticated, user, router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateUser({
        ...user,
        name: formData.name,
        email: formData.email,
      })
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Password changed successfully!')
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>My Account - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-32 pb-20 px-6 lg:px-12 min-h-screen bg-vstra-light">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-12"
          >
            My Account
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-16 h-16 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg truncate">{user?.name}</h3>
                    <p className="text-sm text-gray-600 break-words">{user?.email}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full text-left px-4 py-3 rounded transition-colors ${
                      activeTab === 'password'
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => router.push('/orders')}
                    className="w-full text-left px-4 py-3 rounded hover:bg-gray-100 transition-colors"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => router.push('/cart')}
                    className="w-full text-left px-4 py-3 rounded hover:bg-gray-100 transition-colors"
                  >
                    Shopping Cart
                  </button>
                </nav>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 shadow-lg"
              >
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-3xl font-bold mb-6">Profile Information</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                        >
                          {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'password' && (
                  <div>
                    <h2 className="text-3xl font-bold mb-6">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be at least 6 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-black text-white px-12 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>

              {/* Account Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
              >
                <div className="bg-white p-6 shadow-lg text-center">
                  <p className="text-3xl font-bold mb-2">0</p>
                  <p className="text-gray-600">Total Orders</p>
                </div>
                <div className="bg-white p-6 shadow-lg text-center">
                  <p className="text-3xl font-bold mb-2">$0</p>
                  <p className="text-gray-600">Total Spent</p>
                </div>
                <div className="bg-white p-6 shadow-lg text-center">
                  <p className="text-3xl font-bold mb-2">0</p>
                  <p className="text-gray-600">Wishlist Items</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

