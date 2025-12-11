import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useAuthStore } from '../store/useStore'

export default function Wallet() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const offersBarVisible = useOffersBarVisible()
  const [loading, setLoading] = useState(true)
  const [wallet, setWallet] = useState(null)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [amount, setAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchWallet()
  }, [isAuthenticated])

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setWallet(response.data.wallet)
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
      toast.error('Failed to load wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async () => {
    const amountNum = parseFloat(amount)
    
    if (!amountNum || amountNum < 10) {
      toast.error('Minimum amount is ₹10')
      return
    }

    if (amountNum > 100000) {
      toast.error('Maximum amount is ₹1,00,000')
      return
    }

    setProcessing(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/wallet', {
        amount: amountNum,
        paymentId: `WALLET-ADD-${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success(response.data.message, {
          icon: '💰',
          duration: 3000
        })
        setAmount('')
        setShowAddMoney(false)
        fetchWallet()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add money')
    } finally {
      setProcessing(false)
    }
  }

  const getTransactionIcon = (type) => {
    return type === 'credit' ? '💰' : '🛍️'
  }

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>VSTRA Wallet — Your Digital Wallet</title>
      </Head>

      <Toaster position="top-center" />
      <ActiveOffersBar />
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50" style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              💳 VSTRA Wallet
            </h1>
            <p className="text-gray-600">Your secure digital wallet for seamless shopping</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <p className="text-purple-100 text-sm font-medium mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold mb-6">₹{wallet?.balance?.toLocaleString() || '0'}</h2>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddMoney(true)}
                  className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
                >
                  + Add Money
                </button>
                <button
                  onClick={() => router.push('/shop')}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
                >
                  🛍️ Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Instant Checkout</h3>
              <p className="text-gray-600 text-sm">Pay instantly without entering card details every time</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2">100% Secure</h3>
              <p className="text-gray-600 text-sm">Your money is safe with bank-grade security</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-bold text-lg mb-2">Exclusive Offers</h3>
              <p className="text-gray-600 text-sm">Get special discounts on wallet payments</p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6">Transaction History</h3>
            
            {!wallet?.transactions || wallet.transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-600 mb-4">No transactions yet</p>
                <button
                  onClick={() => setShowAddMoney(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                >
                  Add Money to Get Started
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {wallet.transactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getTransactionIcon(transaction.type)}</div>
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-500 capitalize">{transaction.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Add Money to Wallet</h3>
              <button
                onClick={() => setShowAddMoney(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Enter Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">Min: ₹10 | Max: ₹1,00,000</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">Quick Add</p>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="py-3 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all font-semibold"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddMoney}
              disabled={processing || !amount}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {processing ? 'Processing...' : 'Add Money'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Secured by 256-bit encryption
            </p>
          </div>
        </div>
      )}
    </>
  )
}
