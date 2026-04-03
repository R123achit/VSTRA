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
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [focused, setFocused] = useState({})

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFocus = (name) => setFocused({ ...focused, [name]: true })
  const handleBlur = (name) => {
    if (!formData[name]) setFocused({ ...focused, [name]: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await axios.post('/api/auth/login', formData)
      if (response.data.success) {
        login(response.data.data, response.data.token)
        toast.success('Welcome back!')
        if (response.data.data.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const isActive = (name) => focused[name] || formData[name]

  return (
    <>
      <Head>
        <title>Login - VSTRA</title>
        <meta name="description" content="Sign in to your VSTRA account" />
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="min-h-screen bg-white flex">
        {/* Left — Fashion Visual (hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/2 relative bg-[#f2f0ed] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-12">
              {/* Abstract fashion pattern */}
              <div className="relative w-full max-w-md mx-auto mb-10">
                <div className="w-48 h-48 mx-auto rounded-full bg-[#e8e4de] flex items-center justify-center">
                  <svg className="w-20 h-20 text-[#c5bfb5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight mb-4">
                Welcome to VSTRA
              </h2>
              <p className="text-[15px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Discover premium fashion curated for your unique style. Sign in to access your wishlist, orders, and personalized recommendations.
              </p>

              {/* Floating fashion keywords */}
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {['Trending', 'Premium', 'Curated', 'Exclusive'].map((tag) => (
                  <span key={tag} className="text-[11px] tracking-[0.15em] uppercase text-neutral-400 border border-neutral-200 px-4 py-1.5 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-8 left-8 text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
            Est. 2024
          </div>
          <div className="absolute bottom-8 left-8 right-8 flex justify-between text-[10px] tracking-[0.15em] uppercase text-neutral-400">
            <span>Style</span>
            <span>•</span>
            <span>Quality</span>
            <span>•</span>
            <span>Elegance</span>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-32 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[380px]"
          >
            {/* Logo / Brand */}
            <div className="mb-10">
              <Link href="/">
                <h1 className="text-[32px] font-bold tracking-[0.15em] text-[#1a1a1a] cursor-pointer">
                  VSTRA
                </h1>
              </Link>
              <p className="text-[14px] text-neutral-400 mt-2">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field — Floating Label */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent"
                  placeholder="Email"
                />
                <label
                  htmlFor="login-email"
                  className={`absolute left-0 transition-all duration-200 pointer-events-none ${
                    isActive('email')
                      ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium'
                      : 'top-3 text-[14px] text-neutral-400'
                  }`}
                >
                  Email Address
                </label>
              </div>

              {/* Password Field — Floating Label */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="login-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  className="w-full px-0 py-3 border-0 border-b border-neutral-200 text-[14px] text-[#1a1a1a] bg-transparent focus:outline-none focus:border-[#1a1a1a] transition-colors peer placeholder-transparent pr-10"
                  placeholder="Password"
                />
                <label
                  htmlFor="login-password"
                  className={`absolute left-0 transition-all duration-200 pointer-events-none ${
                    isActive('password')
                      ? 'top-[-6px] text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium'
                      : 'top-3 text-[14px] text-neutral-400'
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-neutral-400 hover:text-[#1a1a1a] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a1a] text-white py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-black transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed mt-8"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-[11px] tracking-[0.1em] uppercase text-neutral-400 font-medium">or</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Create Account */}
            <Link href="/auth/register">
              <button className="w-full border border-[#1a1a1a] text-[#1a1a1a] py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-[#1a1a1a] hover:text-white transition-all">
                Create Account
              </button>
            </Link>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <p className="text-[11px] text-neutral-400 tracking-wide text-center">
                Demo: <span className="text-neutral-500 font-medium">admin@vstra.com</span> / <span className="text-neutral-500 font-medium">admin123</span>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
