import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminNavbar from '../../components/AdminNavbar'

export default function AdminSellers() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sellers, setSellers] = useState([])
  const [stats, setStats] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    // Get user from Zustand persist storage
    let user = null
    try {
      const authData = localStorage.getItem('vstra-auth')
      if (authData) {
        const parsed = JSON.parse(authData)
        user = parsed.state?.user
      }
    } catch (e) {
      console.error('Failed to parse auth data:', e)
    }

    console.log('Auth check:', { hasToken: !!token, user, userRole: user?.role })

    if (!token || user?.role !== 'admin') {
      console.log('Not authenticated as admin, redirecting to login')
      router.push('/admin/login')
      return
    }

    console.log('Authenticated as admin, loading sellers')
    setIsAuthenticated(true)
    fetchSellers()
  }, [filterStatus, router])

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await axios.get(`/api/admin/sellers${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setSellers(response.data.sellers)
        setStats(response.data.stats)
      }
    } catch (error) {
      toast.error('Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (sellerId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/sellers/approve', 
        { sellerId, approved: true },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      toast.success('Seller approved successfully!')
      fetchSellers()
    } catch (error) {
      toast.error('Failed to approve seller')
    }
  }

  const handleReject = async (sellerId) => {
    if (!confirm('Are you sure you want to reject this seller?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/sellers/approve', 
        { sellerId, approved: false },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      toast.success('Seller rejected')
      fetchSellers()
    } catch (error) {
      toast.error('Failed to reject seller')
    }
  }

  const handleBlock = async (sellerId) => {
    if (!confirm('Are you sure you want to block this seller?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/admin/sellers/${sellerId}`, 
        { status: 'blocked' },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      toast.success('Seller blocked')
      fetchSellers()
    } catch (error) {
      toast.error('Failed to block seller')
    }
  }

  const handleDelete = async (sellerId) => {
    if (!confirm('Are you sure you want to delete this seller? This will also delete all their products!')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/sellers/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Seller deleted successfully')
      fetchSellers()
    } catch (error) {
      toast.error('Failed to delete seller')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || badges.pending
  }

  const filteredSellers = sellers.filter(seller =>
    seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatCount = (status) => {
    const stat = stats.find(s => s._id === status)
    return stat ? stat.count : 0
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8 pt-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
          <p className="text-gray-600 mt-2">Manage and approve seller accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sellers</p>
                <p className="text-3xl font-bold text-gray-900">{sellers.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{getStatCount('pending')}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{getStatCount('approved')}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-3xl font-bold text-red-600">{getStatCount('blocked')}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('blocked')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'blocked'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Blocked
              </button>
            </div>
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSellers.map((seller) => (
                <tr key={seller._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{seller.businessName}</div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(seller.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{seller.email}</div>
                    <div className="text-sm text-gray-500">{seller.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seller.gstNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(seller.status)}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seller.totalProducts || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {seller.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(seller._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReject(seller._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            ✗
                          </button>
                        </>
                      )}
                      {seller.status === 'approved' && (
                        <button
                          onClick={() => handleBlock(seller._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Block"
                        >
                          🚫
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/admin/sellers/${seller._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDelete(seller._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSellers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No sellers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
