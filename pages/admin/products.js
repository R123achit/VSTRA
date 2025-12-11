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
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectAll, setSelectAll] = useState(false)

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
      console.log('Fetched products:', response.data)
      const productsData = response.data.data || response.data || []
      console.log('Products array:', productsData.length, 'products')
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
      setProducts([])
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

  const handleCheckDuplicates = async () => {
    const loadingToast = toast.loading('Checking for duplicates...')
    
    try {
      const response = await axios.get('/api/admin/check-duplicates', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = response.data
      toast.dismiss(loadingToast)
      
      if (data.totalDuplicates === 0) {
        toast.success('No duplicate products found!')
        return
      }
      
      const message = `Found ${data.totalDuplicates} duplicate products in ${data.duplicateGroups} groups.\n\nTotal: ${data.totalProducts} products\nWould remain: ${data.wouldRemain} unique products\n\nRemove duplicates?`
      
      if (confirm(message)) {
        handleRemoveDuplicates()
      }
    } catch (error) {
      console.error('Error checking duplicates:', error)
      toast.error('Failed to check duplicates', { id: loadingToast })
    }
  }

  const handleRemoveDuplicates = async () => {
    const loadingToast = toast.loading('Removing duplicate products...')
    
    try {
      const response = await axios.post('/api/admin/remove-duplicates', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = response.data
      toast.success(`${data.message}\n\nRemoved: ${data.removed}\nRemaining: ${data.remaining}`, { 
        id: loadingToast,
        duration: 5000
      })
      fetchProducts()
    } catch (error) {
      console.error('Error removing duplicates:', error)
      toast.error(error.response?.data?.message || 'Failed to remove duplicates', { id: loadingToast })
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) return

    const loadingToast = toast.loading(`Deleting ${selectedProducts.length} products...`)
    
    try {
      // Delete products one by one
      let successCount = 0
      let failCount = 0

      for (const productId of selectedProducts) {
        try {
          await axios.delete(`/api/products/${productId}`)
          successCount++
        } catch (error) {
          failCount++
          console.error(`Failed to delete product ${productId}:`, error)
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} products`, { id: loadingToast })
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} products`)
      }

      setSelectedProducts([])
      setSelectAll(false)
      fetchProducts()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Failed to delete products', { id: loadingToast })
    }
  }

  const filteredProducts = products.filter(product => {
    if (!product) return false
    
    // If no search query, show all products
    if (!searchQuery) return true
    
    // Search in name, category, or any text field
    const searchLower = searchQuery.toLowerCase()
    return (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower))
    )
  })

  console.log('Total products:', products.length)
  console.log('Filtered products:', filteredProducts.length)
  console.log('Products without names:', products.filter(p => !p || !p.name).length)

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
            <div>
              <h2 className="text-4xl font-bold">Manage Products</h2>
              {selectedProducts.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-6 py-3 font-semibold hover:bg-red-700"
                >
                  🗑️ Delete Selected ({selectedProducts.length})
                </button>
              )}
              <button
                onClick={handleCheckDuplicates}
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-3 font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 Remove Duplicates
              </button>
              <Link href="/admin/add-product">
                <button className="bg-black text-white px-6 py-3 font-semibold hover:bg-gray-900">
                  + Add Product (Simple)
                </button>
              </Link>
              <Link href="/admin/add-product-detailed">
                <button className="bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700">
                  + Add Product (Detailed)
                </button>
              </Link>
            </div>
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
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </th>
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
                      <tr 
                        key={product._id} 
                        className={`border-b hover:bg-gray-50 ${
                          selectedProducts.includes(product._id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelectProduct(product._id)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
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
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-2">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              {products.length >= 100 && (
                <p className="text-sm text-orange-600 font-semibold">
                  ⚠️ Note: Displaying first 1000 products. Use filters to narrow results.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

