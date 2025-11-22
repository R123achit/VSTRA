import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WishlistButton from '../components/WishlistButton'
import ActiveOffersBar from '../components/ActiveOffersBar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useAuthStore, useCartStore, useWishlistStore } from '../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Wishlist() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { isAuthenticated, token } = useAuthStore()
  const { addToCart } = useCartStore()
  const { items, removeFromWishlist } = useWishlistStore()
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated])

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to cart')
  }

  const handleShare = async () => {
    try {
      const { data } = await axios.post(
        '/api/wishlist/share',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShareUrl(data.shareUrl)
      setShowShareModal(true)
    } catch (error) {
      toast.error('Failed to generate share link')
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>My Wishlist — VSTRA</title>
        <meta name="description" content="Your saved items" />
      </Head>

      <ActiveOffersBar />
      <Navbar />

      <main 
        className="min-h-screen bg-white pb-20 transition-all duration-300" 
        style={{ marginTop: offersBarVisible ? 'calc(5rem + 3rem)' : '5rem' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {items.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white font-medium hover:bg-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share Wishlist
              </motion.button>
            )}
          </div>

          {/* Wishlist Items */}
          {items.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="w-24 h-24 mx-auto mb-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">
                Save your favorite items to buy them later
              </p>
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Link href={`/product/${product._id}`}>
                    <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-gray-100 cursor-pointer">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 z-10">
                        <WishlistButton product={product} size="md" />
                      </div>
                    </div>
                  </Link>
                  <div className="space-y-2">
                    <Link href={`/product/${product._id}`}>
                      <h3 className="font-semibold text-lg hover:text-gray-600 transition-colors cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">?${product.price}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.compareAtPrice}
                        </span>
                      )}
                    </div>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(product.rating)
                                  ? 'fill-yellow-400 stroke-yellow-400'
                                  : 'fill-gray-200 stroke-gray-200'
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.numReviews})
                        </span>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Share Your Wishlist</h3>
            <p className="text-gray-600 mb-6">
              Anyone with this link can view your wishlist
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyShareLink}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-900 transition-colors"
              >
                Copy
              </motion.button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-3 border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  )
}

