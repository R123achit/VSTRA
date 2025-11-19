import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AdminSetup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [adminExists, setAdminExists] = useState(null)
  const [formData, setFormData] = useState({
    email: 'admin@vstra.com',
    password: 'admin123',
    secretKey: 'create-vstra-admin-2024'
  })

  // Check if admin already exists
  useEffect(() => {
    checkAdminExists()
  }, [])

  const checkAdminExists = async () => {
    try {
      const response = await axios.get('/api/auth/check-admin')
      setAdminExists(response.data.exists)
    } catch (error) {
      console.error('Check admin error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/create-admin', formData)
      
      if (response.data.success) {
        toast.success(response.data.message)
        setTimeout(() => {
          router.push('/admin/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Setup error:', error)
      toast.error(error.response?.data?.message || 'Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Setup - VSTRA</title>
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">🔧 Admin Setup</h1>
              <p className="text-gray-600">Create your admin account</p>
            </div>

            {/* Admin Already Exists Warning */}
            {adminExists && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                <p className="text-yellow-800 font-bold mb-2">⚠️ Admin Already Exists</p>
                <p className="text-sm text-yellow-700 mb-3">
                  An admin account already exists. For security, only one admin is allowed.
                </p>
                <Link href="/admin/login">
                  <button className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                    Go to Admin Login
                  </button>
                </Link>
              </div>
            )}

            {/* Show form only if no admin exists */}
            {!adminExists && adminExists !== null && (
            <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Admin Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="admin@vstra.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Admin Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Secret Key</label>
                <input
                  type="text"
                  value={formData.secretKey}
                  onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-gray-50"
                  placeholder="create-vstra-admin-2024"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: create-vstra-admin-2024
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Creating Admin...' : 'Create Admin Account'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800 font-semibold mb-2">📋 Default Credentials:</p>
              <p className="text-xs text-blue-700">Email: admin@vstra.com</p>
              <p className="text-xs text-blue-700">Password: admin123</p>
              <p className="text-xs text-blue-700 mt-2">
                You can change these before creating the account.
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/admin/login')}
                className="text-sm text-gray-600 hover:text-black"
              >
                Already have an account? Admin Login
              </button>
            </div>
            </>
            )}

            {/* Loading state */}
            {adminExists === null && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <p className="text-gray-600 mt-2">Checking admin status...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
