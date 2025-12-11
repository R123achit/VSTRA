import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SellerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [seller, setSeller] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    const sellerData = localStorage.getItem('seller')

    if (!token) {
      router.push('/seller-login')
      return
    }

    if (sellerData) {
      setSeller(JSON.parse(sellerData))
    }

    fetchAnalytics(token)
  }, [])

  const fetchAnalytics = async (token) => {
    try {
      const response = await axios.get('/api/seller/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAnalytics(response.data.analytics)
      }
    } catch (error) {
      if (error.response?.status === 403) {
        // Pending approval - still show dashboard
      } else {
        console.error('Analytics error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('seller')
    toast.success('Logged out successfully')
    router.push('/seller-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Ultra Premium Header */}
      <header className="bg-white/95 backdrop-blur-2xl shadow-xl border-b border-gray-200/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-5">
              {/* Premium Logo */}
              {seller?.storeLogo ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <img 
                    src={seller.storeLogo} 
                    alt={seller.storeName || seller.businessName}
                    className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xl ring-2 ring-purple-100"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 p-4 rounded-2xl shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Store Info */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent tracking-tight">
                    {seller?.storeName || seller?.businessName || 'Your Store'}
                  </h1>
                  {seller?.status === 'approved' && (
                    <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Seller
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600 font-medium">{seller?.email}</p>
                  {seller?.rating > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
                      <span className="text-amber-500">⭐</span>
                      <span className="font-bold text-amber-700 text-sm">{seller.rating}</span>
                      <span className="text-gray-500 text-xs">({seller.numReviews || 0})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <button 
                onClick={() => router.push('/seller/notifications')}
                className="relative p-3 text-gray-600 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all duration-300 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {analytics?.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {analytics.unreadNotifications > 9 ? '9+' : analytics.unreadNotifications}
                  </span>
                )}
              </button>

              {/* Profile Button */}
              <button
                onClick={() => router.push('/seller/profile')}
                className="group px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:from-slate-900 hover:to-black transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2.5"
              >
                <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="hidden lg:inline">Profile</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Banners */}
      {seller?.status === 'pending' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  <strong>⏳ Account Pending Approval</strong> - Your seller account is awaiting admin approval. You'll have full access once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {seller?.status === 'blocked' && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">
                  <strong>🚫 Account Blocked</strong> - Your account has been blocked. Please contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Pending State */}
        {seller?.status === 'pending' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center mb-8 border border-gray-200">
            <div className="text-8xl mb-6">⏳</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Awaiting Approval</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Your seller account is currently under review. Our admin team will approve your account shortly, and you'll receive an email notification.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-sm font-semibold text-blue-900 mb-4">
                🎉 What happens after approval?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-blue-800">Add unlimited products</span>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-blue-800">Manage customer orders</span>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-blue-800">Track earnings & payouts</span>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-blue-800">Access analytics dashboard</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approved Seller Dashboard */}
        {seller?.status === 'approved' && (
          <>
            {/* Premium Stats Grid with Glass Morphism */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Orders */}
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
                  <p className="text-4xl font-bold text-gray-900 mb-2">{analytics?.orders?.total || 0}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      +{analytics?.orders?.last30Days || 0}
                    </span>
                    <span className="text-xs text-gray-500">this month</span>
                  </div>
                </div>
              </div>

              {/* Total Products */}
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Products</p>
                  <p className="text-4xl font-bold text-gray-900 mb-2">{analytics?.products?.total || 0}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      {analytics?.products?.outOfStock || 0}
                    </span>
                    <span className="text-xs text-gray-500">out of stock</span>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
                  <p className="text-4xl font-bold text-gray-900 mb-2">₹{(analytics?.earnings?.totalSales || 0).toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      -₹{(analytics?.earnings?.totalCommission || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">commission</span>
                  </div>
                </div>
              </div>

              {/* Net Earnings */}
              <div className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-lg hover:shadow-2xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Net Earnings</p>
                  <p className="text-4xl font-bold mb-2">₹{(analytics?.earnings?.totalEarnings || 0).toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      ₹{(analytics?.earnings?.pendingSettlement || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-white/80">pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Ultra Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/seller/products">
                <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-purple-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-4 inline-block p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-600 transition-colors">Products</h3>
                    <p className="text-gray-500 text-sm">Manage inventory</p>
                  </div>
                </div>
              </Link>

              <Link href="/seller/orders">
                <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-4 inline-block p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">Orders</h3>
                    <p className="text-gray-500 text-sm">Process orders</p>
                  </div>
                </div>
              </Link>

              <Link href="/seller/earnings">
                <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-emerald-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-4 inline-block p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">Earnings</h3>
                    <p className="text-gray-500 text-sm">View payouts</p>
                  </div>
                </div>
              </Link>

              <Link href="/seller/analytics">
                <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-amber-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-4 inline-block p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Analytics</h3>
                    <p className="text-gray-500 text-sm">View insights</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Seller Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Business Name</p>
                  <p className="font-semibold text-gray-900">{seller?.businessName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{seller?.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                  <p className="font-semibold text-gray-900">{analytics?.seller?.commissionRate || 10}%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
