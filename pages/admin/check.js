import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import axios from 'axios'

export default function CheckDatabase() {
  const [status, setStatus] = useState({
    loading: true,
    mongodb: null,
    products: null,
    error: null,
  })

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      const response = await axios.get('/api/products')
      setStatus({
        loading: false,
        mongodb: 'Connected ✅',
        products: response.data.data.length,
        error: null,
      })
    } catch (error) {
      setStatus({
        loading: false,
        mongodb: 'Error ❌',
        products: 0,
        error: error.message,
      })
    }
  }

  return (
    <>
      <Head>
        <title>Database Check - VSTRA Admin</title>
      </Head>
      <Navbar />

      <main className="pt-32 pb-20 px-6 min-h-screen bg-vstra-light">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-12 shadow-lg">
            <h1 className="text-4xl font-bold tracking-tight mb-8 text-center">
              Database Status
            </h1>

            {status.loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                <p className="mt-4 text-gray-600">Checking database...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* MongoDB Status */}
                <div className="p-6 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">MongoDB</span>
                    <span className="text-2xl">{status.mongodb}</span>
                  </div>
                </div>

                {/* Products Count */}
                <div className="p-6 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Products in Database</span>
                    <span className="text-4xl font-bold">{status.products}</span>
                  </div>
                </div>

                {/* Error Message */}
                {status.error && (
                  <div className="p-6 bg-red-50 border-2 border-red-200 rounded">
                    <p className="text-red-800 font-semibold mb-2">Error:</p>
                    <p className="text-red-600 text-sm">{status.error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-6 space-y-4">
                  {status.products === 0 ? (
                    <>
                      <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded text-center">
                        <p className="text-yellow-800 font-semibold mb-2">
                          ⚠️ No products found!
                        </p>
                        <p className="text-yellow-700 text-sm">
                          You need to seed the database first
                        </p>
                      </div>
                      <Link href="/admin/seed-premium">
                        <span className="block bg-black text-white py-4 text-center text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors cursor-pointer">
                          Seed 100+ Products Now
                        </span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-green-50 border-2 border-green-200 rounded text-center">
                        <p className="text-green-800 font-semibold mb-2">
                          ✅ Database is ready!
                        </p>
                        <p className="text-green-700 text-sm">
                          You have {status.products} products in your store
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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
                    </>
                  )}

                  <button
                    onClick={checkDatabase}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 text-sm font-semibold tracking-wider uppercase hover:border-black hover:text-black transition-colors"
                  >
                    Refresh Status
                  </button>
                </div>

                {/* Troubleshooting */}
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-3">Troubleshooting:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ Make sure MongoDB is running: <code className="bg-gray-100 px-2 py-1">mongod</code></li>
                    <li>✓ Check .env.local has correct MONGODB_URI</li>
                    <li>✓ Dev server is running: <code className="bg-gray-100 px-2 py-1">npm run dev</code></li>
                    <li>✓ Seed the database if products = 0</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
