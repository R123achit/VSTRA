import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WishlistButton from '../components/WishlistButton'
import ProfileSidebar from '../components/ProfileSidebar'
import ActiveOffersBar from '../components/ActiveOffersBar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useAuthStore, useCartStore, useWishlistStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
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
  }, [isAuthenticated, router])

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to cart', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '13px', borderRadius: '0' },
    })
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
    toast.success('Link copied to clipboard!', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '13px', borderRadius: '0' },
    })
  }

  if (!isAuthenticated) return null

  return (
    <>
      <Head>
        <title>My Wishlist - VSTRA</title>
      </Head>

      <ActiveOffersBar />
      <Navbar />
      <Toaster position="top-center" />

      <main 
        className="pb-20 bg-white transition-all duration-300 min-h-screen" 
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] text-gray-400 tracking-wide mb-10">
            <Link href="/"><span className="hover:text-black transition-colors cursor-pointer">Home</span></Link>
            <span className="text-gray-300">/</span>
            <Link href="/account"><span className="hover:text-black transition-colors cursor-pointer">Profile</span></Link>
            <span className="text-gray-300">/</span>
            <span className="text-black font-medium">Wishlist</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            
            {/* Left Sidebar */}
            <ProfileSidebar activePage="wishlist" />

            {/* Main Content */}
            <div className="flex-1 lg:border-l border-gray-100 lg:pl-[4.5rem]">
              <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1a1a1a] uppercase tracking-wider mb-1">
                    My Wishlist
                  </h2>
                  <p className="text-[12px] text-gray-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
                {items.length > 0 && (
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-[6px] text-[12px] text-gray-500 hover:text-black transition-colors uppercase tracking-[0.05em] font-medium"
                  >
                    <svg className="w-[14px] h-[14px] mb-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    Share
                  </button>
                )}
              </div>

              {/* Wishlist Items Grid */}
              {items.length === 0 ? (
                <div className="text-center py-24 border border-gray-100 bg-[#fdfdfd]">
                  <svg className="w-12 h-12 mx-auto mb-5 text-gray-300 font-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-[14px] font-medium text-[#1a1a1a] mb-2 uppercase tracking-wide">Your wishlist is empty</h3>
                  <p className="text-[13px] text-gray-500 mb-8">
                    Save your favorite items to buy them later.
                  </p>
                  <Link href="/shop">
                    <button className="bg-[#1a1a1a] text-white px-10 py-[11px] text-[13px] tracking-[0.05em] uppercase hover:bg-black transition-colors font-medium">
                      Start Shopping
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                  {items.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-[3/4] mb-4 bg-[#f5f5f5] overflow-hidden">
                        <Link href={`/product/${product._id}`}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover object-top mix-blend-multiply cursor-pointer hover:scale-105 transition-transform duration-700"
                          />
                        </Link>
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => removeFromWishlist(product._id)}
                            className="w-8 h-8 bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors rounded-full"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col flex-1 text-center">
                        <Link href={`/product/${product._id}`}>
                          <h3 className="text-[13px] text-[#1a1a1a] hover:text-gray-600 transition-colors cursor-pointer tracking-wide uppercase mb-1 line-clamp-1 px-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="text-[13px] font-medium text-[#1a1a1a]">
                            ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-[12px] text-gray-400 line-through">
                              ₹{product.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full py-3 border border-black text-[#1a1a1a] text-[12px] tracking-[0.05em] uppercase font-bold hover:bg-black hover:text-white transition-colors"
                          >
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
               onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-8 max-w-[400px] w-full relative shadow-xl"
              >
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <h3 className="text-[18px] font-light tracking-wide text-[#1a1a1a] mb-2 uppercase">Share Wishlist</h3>
                <p className="text-[13px] text-gray-500 mb-6">
                  Anyone with this link can view the items you have saved.
                </p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-[13px] text-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={copyShareLink}
                    className="w-full py-3 bg-[#111111] text-white text-[13px] tracking-widest font-medium uppercase hover:bg-black transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

