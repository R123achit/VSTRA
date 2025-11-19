import { useState } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Seed500Products() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSeed = async () => {
    try {
      setLoading(true)
      setResult(null)
      toast.loading('Generating 500 premium products... This may take a minute.')
      
      const response = await axios.post('/api/seed-500')
      
      toast.dismiss()
      if (response.data.success) {
        setResult(response.data)
        toast.success('500 products seeded successfully!')
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
        <title>Seed 500 Products - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-vstra-light">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white p-12 shadow-lg"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-black to-gray-700 text-white rounded-full mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              Seed 500 Products
            </h1>
            <p className="text-gray-600 text-xl mb-2">
              Generate a massive premium collection
            </p>
            <p className="text-sm text-gray-500">
              This will create 500 unique products across all categories
            </p>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-2xl font-bold text-green-800">
                  Success!
                </h3>
              </div>
              <p className="text-green-700 text-center mb-6 text-lg">{result.message}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-6 bg-white rounded-lg shadow">
                  <p className="text-4xl font-bold text-black mb-2">{result.data.total}</p>
                  <p className="text-gray-600 text-sm">Total Products</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow">
                  <p className="text-4xl font-bold text-blue-600 mb-2">{result.data.categories.men}</p>
                  <p className="text-gray-600 text-sm">Men's Items</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow">
                  <p className="text-4xl font-bold text-pink-600 mb-2">{result.data.categories.women}</p>
                  <p className="text-gray-600 text-sm">Women's Items</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow">
                  <p className="text-4xl font-bold text-purple-600 mb-2">{result.data.categories.accessories}</p>
                  <p className="text-gray-600 text-sm">Accessories</p>
                </div>
              </div>

              <div className="mt-6 text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">
                  ⭐ Featured Products: <span className="font-bold text-black">{result.data.featured}</span>
                </p>
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full bg-black text-white py-5 text-base font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Products...
                </span>
              ) : (
                'Generate 500 Products Now'
              )}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-900 mb-2">200+</p>
                <p className="text-sm text-blue-700 font-semibold">Men's Collection</p>
                <p className="text-xs text-blue-600 mt-2">T-Shirts, Shirts, Pants, Jeans, Outerwear, Sweaters</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg text-center">
                <p className="text-3xl font-bold text-pink-900 mb-2">200+</p>
                <p className="text-sm text-pink-700 font-semibold">Women's Collection</p>
                <p className="text-xs text-pink-600 mt-2">Dresses, Tops, Bottoms, Outerwear</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-900 mb-2">100+</p>
                <p className="text-sm text-purple-700 font-semibold">Accessories</p>
                <p className="text-xs text-purple-600 mt-2">Shoes, Bags, Jewelry, Watches</p>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-sm font-semibold mb-4 text-center">Features:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded text-center">
                  <p className="font-semibold mb-1">✓ Unique Names</p>
                  <p className="text-gray-600">500 different products</p>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <p className="font-semibold mb-1">✓ Multiple Colors</p>
                  <p className="text-gray-600">20+ color variations</p>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <p className="font-semibold mb-1">✓ All Sizes</p>
                  <p className="text-gray-600">XS to XXL available</p>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <p className="font-semibold mb-1">✓ Real Ratings</p>
                  <p className="text-gray-600">4.0 - 5.0 stars</p>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-xs text-red-600 font-semibold">
                ⚠️ Warning: This will delete all existing products and create 500 new ones
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Process may take 30-60 seconds
              </p>
            </div>
          </div>

          {result && (
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Link href="/shop">
                <span className="block bg-black text-white py-4 text-center text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors cursor-pointer">
                  View Shop
                </span>
              </Link>
              <Link href="/">
                <span className="block border-2 border-black text-black py-4 text-center text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-colors cursor-pointer">
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
