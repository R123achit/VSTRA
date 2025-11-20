import { useState } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { useAuthStore } from '../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Login() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const response = await axios.post('/api/auth/login', formData)

      if (response.data.success) {
        login(response.data.data, response.data.token)
        toast.success('Login successful!')
        
        // Redirect based on user role
        if (response.data.data.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/')
        }
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
        <title>Login - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-vstra-light">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 shadow-lg"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Login to your VSTRA account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register">
                <span className="font-semibold hover:underline cursor-pointer">Register</span>
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600 text-center">
              Demo Credentials:<br />
              Email: admin@vstra.com<br />
              Password: admin123
            </p>
          </div>
        </motion.div>
      </main>
    </>
  )
}

