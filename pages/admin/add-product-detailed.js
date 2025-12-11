import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import AdminNavbar from '../../components/AdminNavbar'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AddProductDetailed() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, user])

  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    brand: 'VSTRA',
    category: 'Men > Clothing > T-Shirts',
    
    // Pricing
    mrp: '',
    sellingPrice: '',
    gst: '12',
    
    // Product Details
    color: '',
    colors: [],
    material: '100% Cotton',
    idealFor: 'Men',
    sizes: [],
    pattern: 'Solid',
    fit: 'Regular Fit',
    neckType: 'Round Neck',
    sleeveType: 'Half Sleeve',
    occasion: 'Casual',
    fabricCare: 'Machine wash',
    description: '',
    
    // Images
    images: '',
    
    // Inventory
    hsnCode: '61091000',
    sku: '',
    stock: '',
    
    // Shipping
    weight: '300g',
    dimensions: '30x25x2 cm',
    
    // Legal & Compliance
    countryOfOrigin: 'India',
    manufacturer: 'VSTRA Clothing Co.',
    packer: 'VSTRA Clothing Co.',
    importer: 'N/A',
    
    // Customer Service
    customerCareEmail: 'support@vstra.com',
    customerCarePhone: '9876543210',
    returnPolicy: '7 Days Replacement',
    warranty: 'No Warranty'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSizeToggle = (size) => {
    const sizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size]
    setFormData({ ...formData, sizes })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.mrp || !formData.sellingPrice || !formData.sku || !formData.stock || !formData.images) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.sizes.length === 0) {
      toast.error('Please select at least one size')
      return
    }

    setLoading(true)

    try {
      // Prepare data to match the Product model schema
      const productData = {
        name: formData.title,
        description: formData.description,
        price: parseFloat(formData.sellingPrice),
        compareAtPrice: parseFloat(formData.mrp),
        category: formData.category.split(' > ')[0].toLowerCase(), // Extract first part (Men/Women/Kids)
        subcategory: formData.category,
        images: formData.images.split(',').map(img => img.trim()),
        sizes: formData.sizes,
        colors: formData.color ? [{ name: formData.color, hex: '#000000' }] : [],
        stock: parseInt(formData.stock),
        featured: false
      }

      console.log('Sending product data:', productData)

      const response = await axios.post('/api/products', productData)
      
      if (response.data.success) {
        toast.success('Product added successfully!')
        setTimeout(() => router.push('/admin/products'), 1500)
      } else {
        toast.error('Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const categories = [
    'Men > Clothing > T-Shirts',
    'Men > Clothing > Shirts',
    'Men > Clothing > Jeans',
    'Women > Clothing > Tops',
    'Women > Clothing > Dresses',
    'Women > Clothing > Ethnic Wear',
    'Kids > Clothing > T-Shirts',
    'Kids > Clothing > Shirts'
  ]

  return (
    <>
      <Head>
        <title>Add Product (Detailed) - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />
      <AdminNavbar />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-8"
          >
            Add New Product (Detailed)
          </motion.h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Men Printed Round Neck Cotton T-Shirt"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">MRP (₹) *</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="499"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GST (%)</label>
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              {formData.mrp && formData.sellingPrice && (
                <p className="mt-2 text-sm text-green-600">
                  Discount: {Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100)}%
                </p>
              )}
            </div>

            {/* Product Details */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Product Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ideal For</label>
                  <select
                    name="idealFor"
                    value={formData.idealFor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>Men</option>
                    <option>Women</option>
                    <option>Boys</option>
                    <option>Girls</option>
                    <option>Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pattern</label>
                  <input
                    type="text"
                    name="pattern"
                    value={formData.pattern}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fit</label>
                  <select
                    name="fit"
                    value={formData.fit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>Slim Fit</option>
                    <option>Regular Fit</option>
                    <option>Loose Fit</option>
                    <option>Oversized</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Neck Type</label>
                  <input
                    type="text"
                    name="neckType"
                    value={formData.neckType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sleeve Type</label>
                  <input
                    type="text"
                    name="sleeveType"
                    value={formData.sleeveType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Occasion</label>
                  <input
                    type="text"
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Fabric Care</label>
                  <input
                    type="text"
                    name="fabricCare"
                    value={formData.fabricCare}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Soft and breathable cotton t-shirt perfect for daily wear."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Available Sizes *</h2>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
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

            {/* Images */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Images</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Image URLs (comma-separated) *</label>
                <textarea
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                  placeholder="https://example.com/front.jpg, https://example.com/back.jpg"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter multiple image URLs separated by commas</p>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="VSTRA-BLK-TS01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">HSN Code</label>
                  <input
                    type="text"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Shipping</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="300g"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dimensions (L x W x H)</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="30x25x2 cm"
                  />
                </div>
              </div>
            </div>

            {/* Legal & Compliance */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Legal & Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Country of Origin</label>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Packer</label>
                  <input
                    type="text"
                    name="packer"
                    value={formData.packer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Importer</label>
                  <input
                    type="text"
                    name="importer"
                    value={formData.importer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Customer Service */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Customer Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Care Email</label>
                  <input
                    type="email"
                    name="customerCareEmail"
                    value={formData.customerCareEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Care Phone</label>
                  <input
                    type="tel"
                    name="customerCarePhone"
                    value={formData.customerCarePhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Return Policy</label>
                  <input
                    type="text"
                    name="returnPolicy"
                    value={formData.returnPolicy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-4 font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-400 rounded-lg"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
              <Link href="/admin/products">
                <button
                  type="button"
                  className="px-8 py-4 border-2 border-black font-semibold hover:bg-gray-100 transition-colors rounded-lg"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
