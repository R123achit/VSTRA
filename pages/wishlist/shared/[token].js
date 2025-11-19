import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { useCartStore } from '../../../store/useStore'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function SharedWishlist() {
  const router = useRouter()
  const { token } = router.query
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCartStore()

  useEffect(() => {
    if (token) {
      fetchSharedWishlist()
    }
  }, [token])

  const fetchSharedWishlist = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/wishlist/shared/${token}`)
      setWishlist(data.wishlist)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to cart')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </>
    )
  }

  if (!wishlist) {
    return (
      <>
        <Head>
          <title>Wishlist Not Found — VSTRA</title>
        </Head>
        <Navbar />
        <main className="min-h-screen bg-white pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Wishlist Not Found</h1>
            <p className="text-gray-600 mb-8">
              This wishlist doesn't exist or is no longer available
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
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Shared Wishlist — VSTRA</title>
        <meta name="description" content="Check out this wishlist" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Shared Wishlist</h1>
            <p className="text-gray-600">
              {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Wishlist Items */}
          {wishlist.items.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-2">This wishlist is empty</h2>
              <p className="text-gray-600 mb-8">No items have been added yet</p>
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                >
                  Browse Products
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.items.map((item) => {
                const product = item.product
                return (
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
                      </div>
                    </Link>
                    <div className="space-y-2">
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-semibold text-lg hover:text-gray-600 transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">${product.price}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.compareAtPrice}
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
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
