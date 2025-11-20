import { useState } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function SeedPremiumProducts() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSeed = async () => {
    try {
      setLoading(true)
      setResult(null)
      toast.loading('Seeding 100+ premium products...')
      
      const response = await axios.post('/api/seed-premium')
      
      toast.dismiss()
      if (response.data.success) {
        setResult(response.data)
        toast.success('Premium products seeded successfully!')
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
        <title>Seed Premium Products - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-vstra-light">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-white p-12 shadow-lg"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-full mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Seed 100+ Premium Products
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Add a complete premium collection to your store
            </p>
            <p className="text-sm text-gray-500">
              This will replace existing products with 100+ curated items
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">
                  Success!
                </h3>
              </div>
              <p className="text-green-700 mb-4 text-center">{result.message}</p>
              <div className="bg-white p-6 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-3xl font-bold text-black mb-1">{result.data.products}</p>
                    <p className="text-gray-600">Total Products</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-3xl font-bold text-black mb-1">{result.data.categories.men}</p>
                    <p className="text-gray-600">Men's Items</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-3xl font-bold text-black mb-1">{result.data.categories.women}</p>
                    <p className="text-gray-600">Women's Items</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-3xl font-bold text-black mb-1">{result.data.categories.accessories}</p>
                    <p className="text-gray-600">Accessories</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Seeding Products...' : 'Seed Premium Products'}
            </button>

            <div className="pt-6 border-t">
              <h3 className="text-sm font-semibold mb-4 text-center">What's Included:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-semibold mb-2">👔 Men's</p>
                  <ul className="space-y-1">
                    <li>T-Shirts & Tops</li>
                    <li>Shirts</li>
                    <li>Pants & Jeans</li>
                    <li>Outerwear</li>
                  </ul>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-semibold mb-2">👗 Women's</p>
                  <ul className="space-y-1">
                    <li>Dresses</li>
                    <li>Tops & Blouses</li>
                    <li>Pants & Skirts</li>
                    <li>Sweaters</li>
                  </ul>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-semibold mb-2">👜 Accessories</p>
                  <ul className="space-y-1">
                    <li>Shoes</li>
                    <li>Bags</li>
                    <li>Jewelry</li>
                    <li>Watches</li>
                  </ul>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-semibold mb-2">✨ New</p>
                  <ul className="space-y-1">
                    <li>Latest Styles</li>
                    <li>Trending Items</li>
                    <li>Seasonal</li>
                    <li>Limited</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-xs text-gray-500">
                ⚠️ Warning: This will delete all existing products
              </p>
            </div>
          </div>

          {result && (
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Link href="/shop">
                <span className="bg-black text-white py-3 text-sm font-semibold tracking-wider uppercase hover:bg-gray-900 transition-colors text-center block cursor-pointer">
                  View Shop
                </span>
              </Link>
              <Link href="/">
                <span className="border-2 border-black text-black py-3 text-sm font-semibold tracking-wider uppercase hover:bg-black hover:text-white transition-colors text-center block cursor-pointer">
                  Go Home
                </span>
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </>
  )
}

