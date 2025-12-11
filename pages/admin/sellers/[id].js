import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminNavbar from '../../../components/AdminNavbar'

export default function SellerDetails() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [commissionRate, setCommissionRate] = useState(10)

  useEffect(() => {
    if (id) {
      fetchSellerDetails()
    }
  }, [id])

  const fetchSellerDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const [sellerRes, productsRes] = await Promise.all([
        axios.get(`/api/admin/sellers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/admin/sellers/products?sellerId=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (sellerRes.data.success) {
        setSeller(sellerRes.data.seller)
        setCommissionRate(sellerRes.data.seller.commissionRate || 10)
      }

      if (productsRes.data.success) {
        setProducts(productsRes.data.products)
      }
    } catch (error) {
      toast.error('Failed to load seller details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCommission = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.put('/api/admin/sellers/commission', 
        { sellerId: id, commissionRate },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      toast.success('Commission rate updated!')
      fetchSellerDetails()
    } catch (error) {
      toast.error('Failed to update commission')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Seller not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8 pt-32 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/admin/sellers')}
          className="mb-6 text-purple-600 hover:text-purple-700 font-medium"
        >
          ← Back to Sellers
        </button>

        {/* Seller Info */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{seller.businessName}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{seller.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{seller.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                    seller.status === 'approved' ? 'bg-green-100 text-green-800' :
                    seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {seller.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Business Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">GST Number</p>
                  <p className="font-medium">{seller.gstNumber}</p>
                </div>
                {seller.panNumber && (
                  <div>
                    <p className="text-sm text-gray-600">PAN Number</p>
                    <p className="font-medium">{seller.panNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-medium">{new Date(seller.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Holder</p>
              <p className="font-medium">{seller.bankDetails?.accountHolderName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-medium">{seller.bankDetails?.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IFSC Code</p>
              <p className="font-medium">{seller.bankDetails?.ifscCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium">{seller.bankDetails?.bankName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Pickup Address</h2>
          <p className="text-gray-700">
            {seller.pickupAddress?.addressLine1}<br />
            {seller.pickupAddress?.addressLine2 && <>{seller.pickupAddress.addressLine2}<br /></>}
            {seller.pickupAddress?.city}, {seller.pickupAddress?.state} - {seller.pickupAddress?.zipCode}
          </p>
        </div>

        {/* Commission Settings */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Commission Settings</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              min="0"
              max="100"
              step="0.1"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-gray-700">%</span>
            <button
              onClick={handleUpdateCommission}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Update Commission
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold mb-4">Products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-gray-600">No products yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product._id} className="border rounded-lg p-4">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-purple-600 font-bold">₹{product.price}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
