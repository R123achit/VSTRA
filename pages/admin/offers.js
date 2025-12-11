import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useAuthStore } from '../../store/useStore'
import { useRouter } from 'next/router'
import AdminNavbar from '../../components/AdminNavbar'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AdminOffers() {
  const router = useRouter()
  const { token, user, isAuthenticated } = useAuthStore()
  const [offers, setOffers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    buyQuantity: 1,
    getQuantity: 1,
    applicableProducts: [],
    applicableCategories: [],
    applyToAll: true,
    minPurchaseAmount: 0,
    maxDiscount: null,
    code: '',
    usageLimit: null,
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 0,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
    
    if (user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchOffers()
    fetchProducts()
  }, [isAuthenticated, user, router])

  const fetchOffers = async (retryCount = 0) => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/offers', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 second timeout
      })
      console.log('Admin offers fetched:', data)
      setOffers(data.offers || [])
    } catch (error) {
      console.error('Failed to fetch offers:', error)
      
      // Retry logic for connection issues
      if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.response?.status === 503)) {
        console.log(`Retrying... Attempt ${retryCount + 1}`)
        setTimeout(() => fetchOffers(retryCount + 1), 1000)
        return
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch offers. Please refresh the page.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products')
      setProducts(data.data)
    } catch (error) {
      console.error('Failed to fetch products')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (submitting) return
    
    setSubmitting(true)
    const loadingToast = toast.loading(editingOffer ? 'Updating offer...' : 'Creating offer...')
    
    try {
      console.log('=== SUBMITTING OFFER ===')
      console.log('Form data:', formData)
      console.log('Token:', token ? 'Present' : 'Missing')
      console.log('User:', user)
      
      if (editingOffer) {
        const response = await axios.put(
          `/api/admin/offers/${editingOffer._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        console.log('Update response:', response.data)
        toast.success('Offer updated successfully', { id: loadingToast })
      } else {
        console.log('Making POST request to /api/admin/offers')
        const response = await axios.post('/api/admin/offers', formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('Create response:', response.data)
        toast.success('Offer created successfully', { id: loadingToast })
      }
      
      setShowModal(false)
      resetForm()
      await fetchOffers()
    } catch (error) {
      console.error('=== ERROR SAVING OFFER ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error response status:', error.response?.status)
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save offer'
      toast.error(errorMessage, { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return
    try {
      await axios.delete(`/api/admin/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Offer deleted successfully')
      fetchOffers()
    } catch (error) {
      toast.error('Failed to delete offer')
    }
  }

  const handleEdit = (offer) => {
    setEditingOffer(offer)
    setFormData({
      name: offer.name,
      description: offer.description,
      type: offer.type,
      value: offer.value,
      buyQuantity: offer.buyQuantity || 1,
      getQuantity: offer.getQuantity || 1,
      applicableProducts: Array.isArray(offer.applicableProducts) 
        ? offer.applicableProducts.map(p => typeof p === 'string' ? p : p._id)
        : [],
      applicableCategories: offer.applicableCategories || [],
      applyToAll: offer.applyToAll,
      minPurchaseAmount: offer.minPurchaseAmount,
      maxDiscount: offer.maxDiscount,
      code: offer.code,
      usageLimit: offer.usageLimit,
      startDate: offer.startDate.split('T')[0],
      endDate: offer.endDate.split('T')[0],
      isActive: offer.isActive,
      priority: offer.priority,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingOffer(null)
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      buyQuantity: 1,
      getQuantity: 1,
      applicableProducts: [],
      applicableCategories: [],
      applyToAll: true,
      minPurchaseAmount: 0,
      maxDiscount: null,
      code: '',
      usageLimit: null,
      startDate: '',
      endDate: '',
      isActive: true,
      priority: 0,
    })
  }

  const getOfferTypeLabel = (type) => {
    const labels = {
      percentage: 'Percentage Off',
      fixed: 'Fixed Amount Off',
      bogo: 'Buy One Get One',
      buy_x_get_y: 'Buy X Get Y',
      free_shipping: 'Free Shipping',
    }
    return labels[type] || type
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>Manage Offers - VSTRA Admin</title>
      </Head>
      
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <div className="max-w-7xl mx-auto p-8 pt-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Offers & Promotions</h1>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchOffers()}
              disabled={loading}
              className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="px-6 py-3 bg-[#0A1628] text-white rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              Create New Offer
            </motion.button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold mb-2">No Offers Yet</h3>
            <p className="text-gray-600 mb-6">Create your first promotional offer to boost sales!</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="px-6 py-3 bg-[#0A1628] text-white rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              Create Your First Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 border-2 border-[#D4AF37]/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{offer.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold bg-[#D4AF37] text-black px-3 py-1 rounded">
                    {getOfferTypeLabel(offer.type)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{offer.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  {offer.code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-mono font-bold">{offer.code}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-semibold">
                      {offer.type === 'percentage' ? `${offer.value}%` : `₹${offer.value}`}
                    </span>
                  </div>
                  {offer.type === 'buy_x_get_y' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deal:</span>
                      <span className="font-semibold">
                        Buy {offer.buyQuantity} Get {offer.getQuantity}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid:</span>
                    <span className="text-xs">
                      {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used:</span>
                    <span>{offer.usedCount} {offer.usageLimit ? `/ ${offer.usageLimit}` : ''}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="flex-1 px-4 py-2 bg-[#0A1628] text-white rounded hover:bg-[#D4AF37] hover:text-black transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(offer._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold mb-6">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Offer Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Offer Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                      >
                        <option value="percentage">Percentage Off</option>
                        <option value="fixed">Fixed Amount Off</option>
                        <option value="bogo">Buy One Get One</option>
                        <option value="buy_x_get_y">Buy X Get Y</option>
                        <option value="free_shipping">Free Shipping</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                        required
                      />
                    </div>
                  </div>

                  {formData.type === 'buy_x_get_y' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Buy Quantity</label>
                        <input
                          type="number"
                          value={formData.buyQuantity}
                          onChange={(e) => setFormData({ ...formData, buyQuantity: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Get Quantity</label>
                        <input
                          type="number"
                          value={formData.getQuantity}
                          onChange={(e) => setFormData({ ...formData, getQuantity: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Offer Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g., SUMMER2024"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Purchase (₹)</label>
                      <input
                        type="number"
                        value={formData.minPurchaseAmount}
                        onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Discount (₹)</label>
                      <input
                        type="number"
                        value={formData.maxDiscount || ''}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usageLimit || ''}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.applyToAll}
                        onChange={(e) => setFormData({ ...formData, applyToAll: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Apply to All Products</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-[#0A1628] text-white rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </>
  )
}
