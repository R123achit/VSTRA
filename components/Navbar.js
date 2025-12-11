import { motion } from 'framer-motion'
import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCartStore, useAuthStore, useWishlistStore } from '../store/useStore'
import SearchBar from './SearchBar'

function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [scrollOpacity, setScrollOpacity] = useState(0.95)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [offersBarVisible, setOffersBarVisible] = useState(true)
  const cartCount = useCartStore((state) => state.getCartCount())
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount())
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 50)
      
      // Calculate opacity: starts at 0.95, reaches 1 at 200px scroll
      const opacity = Math.min(0.95 + (scrollY / 200) * 0.05, 1)
      setScrollOpacity(opacity)
    }
    handleScroll() // Set initial opacity
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleOffersBarVisibility = (e) => {
      setOffersBarVisible(e.detail.visible)
    }
    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    return () => window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ 
        backgroundColor: `rgba(255, 255, 255, ${scrollOpacity})`,
        backdropFilter: scrollOpacity < 1 ? 'blur(10px)' : 'none',
        top: offersBarVisible ? '3rem' : '0rem',
        zIndex: 50
      }}
      className={`fixed left-0 right-0 transition-all duration-300 ease-in-out ${
        scrolled 
          ? 'shadow-lg text-black' 
          : 'text-black shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold tracking-tighter cursor-pointer"
            >
              VSTRA
            </motion.div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12" role="navigation" aria-label="Main navigation">
            <Link href="/shop?category=men" className="relative group">
              <motion.span
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold tracking-wider uppercase cursor-pointer inline-block px-3 py-2 transition-all duration-300 text-black hover:text-gray-600"
              >
                Men
              </motion.span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/shop?category=women" className="relative group">
              <motion.span
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold tracking-wider uppercase cursor-pointer inline-block px-3 py-2 transition-all duration-300 text-black hover:text-gray-600"
              >
                Women
              </motion.span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/shop?category=new-arrivals" className="relative group">
              <motion.span
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold tracking-wider uppercase cursor-pointer inline-block px-3 py-2 transition-all duration-300 text-black hover:text-gray-600"
              >
                New Arrivals
              </motion.span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/shop?category=accessories" className="relative group">
              <motion.span
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold tracking-wider uppercase cursor-pointer inline-block px-3 py-2 transition-all duration-300 text-black hover:text-gray-600"
              >
                Accessories
              </motion.span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search - Always Visible */}
            <div className="hidden lg:block">
              <SearchBar scrolled={true} />
            </div>

            {/* Wishlist */}
            {mounted && (
              <Link href="/wishlist">
                <motion.div
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors ml-6"
                  aria-label="Wishlist"
                >
                  <svg className="w-6 h-6 text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold bg-red-600 shadow-lg"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )}

            {/* Cart */}
            {mounted && (
              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors ml-6"
                  aria-label="Shopping Cart"
                >
                  <svg className="w-6 h-6 text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold bg-red-600 shadow-lg"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )}

            {/* User Menu - Desktop */}
            {mounted && (
              <>
                {isAuthenticated ? (
                  <div className="relative group hidden md:block ml-2">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-9 h-9 rounded-full border-2 border-transparent group-hover:border-black/20 transition-all"
                      />
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden border border-gray-100 z-50"
                    >
                      <div className="py-2">
                        <Link href="/account">
                          <motion.span
                            whileHover={{ x: 5, backgroundColor: '#f9fafb' }}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-black cursor-pointer transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Account
                          </motion.span>
                        </Link>
                        <Link href="/orders">
                          <motion.span
                            whileHover={{ x: 5, backgroundColor: '#f9fafb' }}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-black cursor-pointer transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            My Orders
                          </motion.span>
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <motion.button
                          onClick={handleLogout}
                          whileHover={{ x: 5, backgroundColor: '#fef2f2' }}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden md:block px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg ml-6 bg-black text-white hover:bg-gray-800"
                    >
                      Login
                    </motion.button>
                  </Link>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4 bg-white"
          >
            <div className="flex flex-col space-y-2">
              <Link href="/shop?category=men">
                <motion.span
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg mx-2 transition-all text-black hover:bg-gray-100"
                >
                  Men
                </motion.span>
              </Link>
              <Link href="/shop?category=women">
                <motion.span
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg mx-2 transition-all text-black hover:bg-gray-100"
                >
                  Women
                </motion.span>
              </Link>
              <Link href="/shop?category=new-arrivals">
                <motion.span
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg mx-2 transition-all text-black hover:bg-gray-100"
                >
                  New Arrivals
                </motion.span>
              </Link>
              <Link href="/shop?category=accessories">
                <motion.span
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg mx-2 transition-all text-black hover:bg-gray-100"
                >
                  Accessories
                </motion.span>
              </Link>
              {mounted && isAuthenticated && (
                <>
                  <Link href="/account">
                    <motion.span
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg mx-2 transition-all text-black hover:bg-gray-100"
                    >
                      My Account
                    </motion.span>
                  </Link>
                  <Link href="/orders">
                    <motion.span
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg mx-2 transition-all text-black hover:bg-gray-100"
                    >
                      My Orders
                    </motion.span>
                  </Link>
                  <motion.button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg mx-2 transition-all text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </motion.button>
                </>
              )}
              {mounted && !isAuthenticated && (
                <Link href="/auth/login">
                  <motion.span
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg mx-2 transition-all text-black hover:bg-gray-100"
                  >
                    Login
                  </motion.span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default memo(Navbar)

