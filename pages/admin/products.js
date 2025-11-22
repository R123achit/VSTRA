import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import AdminNavbar from '../../components/AdminNavbar'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AdminProducts() {
  const router = useRouter()
  const { isAuthenticated, user, token } = useAuthStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchProducts()
  }, [isAuthenticated, user, category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/products', {
        params: { category: category !== 'all' ? category : undefined }
      })
      setProducts(response.data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await axios.delete(`/api/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>Manage Products - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-4xl font-bold">Manage Products</h2>
            <Link href="/admin/add-product">
              <button className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-900">
                + Add New Product
              </button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
              >
                <option value="all">All Categories</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="new-arrivals">New Arrivals</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white shadow-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Image</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.rating}★ ({product.numReviews})
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-200 text-sm rounded">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          ₹{product.price}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-sm rounded ${
                            product.stock > 50 ? 'bg-green-100 text-green-800' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.featured && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/edit-product/${product._id}`}>
                              <button className="px-3 py-1 bg-green-600 text-white text-sm hover:bg-green-700">
                                Edit
                              </button>
                            </Link>
                            <Link href={`/product/${product._id}`}>
                              <button className="px-3 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700">
                                View
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-600 mb-4">No products found</p>
                <Link href="/admin/seed-500">
                  <button className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-900">
                    Seed 500 Products
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {!loading && filteredProducts.length > 0 && (
            <div className="mt-6 text-center text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </main>
      </div>
    </>
  )
}

