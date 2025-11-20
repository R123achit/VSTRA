import { useState } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSeed = async () => {
    try {
      setLoading(true)
      setResult(null)
      toast.loading('Seeding database...')
      
      const response = await axios.post('/api/seed')
      
      toast.dismiss()
      if (response.data.success) {
        setResult(response.data)
        toast.success('Database seeded successfully!')
      }
    } catch (error) {
      toast.dismiss()
      console.error('Seed error:', error)
      toast.error(error.response?.data?.message || 'Failed to seed database')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Seed Database - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-vstra-light">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white p-12 shadow-lg text-center"
        >
          <div className="mb-8">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Seed Database
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Initialize your database with sample products
            </p>
            <p className="text-sm text-gray-500">
              This will create 8 sample products and an admin user
            </p>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">
                  Success!
                </h3>
              </div>
              <p className="text-green-700 mb-4">{result.message}</p>
              <div className="text-left bg-white p-4 rounded">
                <p className="text-sm font-semibold mb-2">Created:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ {result.data.products} Products</li>
                  <li>✅ Admin User (admin@vstra.com / admin123)</li>
                </ul>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Seeding Database...' : 'Seed Database Now'}
            </button>

            <div className="pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3">What will be created:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="text-left">
                  <p className="font-semibold mb-2">Products:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Minimal Black Tee</li>
                    <li>• Classic White Shirt</li>
                    <li>• Premium Denim</li>
                    <li>• Luxury Coat</li>
                  </ul>
                </div>
                <div className="text-left">
                  <p className="font-semibold mb-2">More Products:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Designer Sneakers</li>
                    <li>• Silk Dress</li>
                    <li>• Summer Dress</li>
                    <li>• Casual Blazer</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs text-gray-500">
                Note: This will clear existing products and create fresh sample data
              </p>
            </div>
          </div>

          {result && (
            <div className="mt-8 flex gap-4">
              <Link href="/shop">
                <span className="flex-1 bg-black text-white py-3 text-sm font-semibold tracking-wider uppercase hover:bg-gray-900 transition-colors text-center block cursor-pointer">
                  View Shop
                </span>
              </Link>
              <Link href="/auth/login">
                <span className="flex-1 border-2 border-black text-black py-3 text-sm font-semibold tracking-wider uppercase hover:bg-black hover:text-white transition-colors text-center block cursor-pointer">
                  Login as Admin
                </span>
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </>
  )
}

