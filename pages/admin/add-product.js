import { useState } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { useAuthStore } from '../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AddProduct() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: 'men',
    subcategory: '',
    images: '',
    sizes: [],
    colors: [{ name: '', hex: '' }],
    stock: '',
    featured: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSizeToggle = (size) => {
    const sizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size]
    setFormData({ ...formData, sizes })
  }

  const handleColorChange = (index, field, value) => {
    const colors = [...formData.colors]
    colors[index][field] = value
    setFormData({ ...formData, colors })
  }

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: '', hex: '' }]
    })
  }

  const removeColor = (index) => {
    const colors = formData.colors.filter((_, i) => i !== index)
    setFormData({ ...formData, colors })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        stock: parseInt(formData.stock),
        images: formData.images.split(',').map(img => img.trim()),
        colors: formData.colors.filter(c => c.name && c.hex),
      }

      const response = await axios.post('/api/products', productData)

      if (response.data.success) {
        toast.success('Product added successfully!')
        setTimeout(() => router.push('/shop'), 2000)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Please login to access admin panel</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Add Product - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 min-h-screen bg-vstra-light">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-bold tracking-tighter mb-8"
          >
            Add New Product
          </motion.h1>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 shadow-lg space-y-6"
          >
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="e.g., Premium Black T-Shirt"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Detailed product description..."
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="99.99"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Compare at Price ($)</label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="129.99"
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="new-arrivals">New Arrivals</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Subcategory</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="e.g., t-shirts, jeans, shoes"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold mb-2">Image URLs (comma-separated) *</label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="https://images.unsplash.com/photo-1.jpg, https://images.unsplash.com/photo-2.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple URLs with commas</p>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-semibold mb-2">Sizes *</label>
              <div className="flex flex-wrap gap-3">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-6 py-2 border-2 transition-colors ${
                      formData.sizes.includes(size)
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-semibold mb-2">Colors</label>
              {formData.colors.map((color, index) => (
                <div key={index} className="flex gap-4 mb-3">
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                    placeholder="Color name (e.g., Black)"
                    className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    value={color.hex}
                    onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                    placeholder="Hex code (e.g., #000000)"
                    className="w-32 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addColor}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Another Color
              </button>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold mb-2">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="100"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <label className="text-sm font-semibold">Mark as Featured Product</label>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </motion.form>
        </div>
      </main>
    </>
  )
}
