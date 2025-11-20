import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function EditProduct() {
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'men',
    stock: '',
    images: [''],
    featured: false,
    rating: 4.5,
    numReviews: 0
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    if (id) {
      fetchProduct()
    }
  }, [isAuthenticated, user, id])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`)
      const product = response.data.data || response.data
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'men',
        stock: product.stock || '',
        images: Array.isArray(product.images) ? product.images : [''],
        featured: product.featured || false,
        rating: product.rating || 0,
        numReviews: product.numReviews || 0
      })
    } catch (error) {
      console.error('Failed to load product:', error)
      toast.error('Failed to load product')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.put(`/api/products/${id}`, formData)
      toast.success('Product updated successfully!')
      router.push('/admin/products')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] })
  }

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Product - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-black text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard">
                <h1 className="text-2xl font-bold cursor-pointer">VSTRA Admin</h1>
              </Link>
              <Link href="/admin/products">
                <button className="text-sm bg-white text-black px-4 py-2 hover:bg-gray-200">
                  Back to Products
                </button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-8">Edit Product</h2>

            <form onSubmit={handleSubmit} className="bg-white shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Premium Cotton T-Shirt"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  rows="4"
                  placeholder="Detailed product description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="99.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="new-arrivals">New Arrivals</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Product Images (URLs)</label>
                {formData.images && formData.images.length > 0 ? formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="px-4 py-3 bg-red-600 text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="text-gray-500 text-sm mb-2">No images yet</div>
                )}
                <button
                  type="button"
                  onClick={addImageField}
                  className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  + Add Another Image
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="featured" className="text-sm font-semibold">
                  Mark as Featured Product
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-black text-white py-4 font-semibold hover:bg-gray-900 disabled:bg-gray-400"
                >
                  {submitting ? 'Updating...' : 'Update Product'}
                </button>
                <Link href="/admin/products">
                  <button
                    type="button"
                    className="px-8 py-4 border-2 border-black hover:bg-gray-100 font-semibold"
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  )
}
