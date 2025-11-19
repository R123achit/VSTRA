import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AdminLogin() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: 'admin@vstra.com',
    password: 'admin123',
  })

  useEffect(() => {
    // If already logged in as admin, redirect to dashboard
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const response = await axios.post('/api/auth/login', formData)

      if (response.data.success) {
        const userData = response.data.data
        
        // Check if user is admin
        if (userData.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.')
          return
        }

        login(userData, response.data.token)
        toast.success('Welcome back, Admin!')
        
        // Redirect to admin dashboard
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 500)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login - VSTRA</title>
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-white p-4 rounded-lg shadow-2xl mb-4">
              <h1 className="text-4xl font-bold">VSTRA</h1>
            </div>
            <h2 className="text-white text-2xl font-bold">Admin Panel</h2>
            <p className="text-gray-400 mt-2">Sign in to manage your store</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="admin@vstra.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In to Admin Panel'
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                🔐 Admin Access Only
              </p>
              <p className="text-xs text-blue-700">
                This login is for administrators only. Regular users should use the main site login.
              </p>
            </div>

            {/* Links */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <Link href="/admin/setup">
                  <span className="text-sm text-gray-600 hover:text-black cursor-pointer">
                    Need to create admin account? →
                  </span>
                </Link>
              </div>
              <div className="text-center pt-3 border-t">
                <Link href="/">
                  <span className="text-sm text-gray-600 hover:text-black cursor-pointer">
                    ← Back to Main Site
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 text-center">
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <p className="text-xs font-semibold mb-2">Default Admin Credentials:</p>
              <p className="text-sm font-mono">admin@vstra.com</p>
              <p className="text-sm font-mono">admin123</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
