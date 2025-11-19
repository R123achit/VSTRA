import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCartStore, useAuthStore } from '../store/useStore'

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = useCartStore((state) => state.getCartCount())
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm text-black' : 'bg-black/20 backdrop-blur-sm text-white'
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
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/shop?category=men">
              <motion.span
                whileHover={{ y: -2 }}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer inline-block ${
                  scrolled ? 'hover:text-gray-600' : 'hover:text-gray-300'
                }`}
              >
                Men
              </motion.span>
            </Link>
            <Link href="/shop?category=women">
              <motion.span
                whileHover={{ y: -2 }}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer inline-block ${
                  scrolled ? 'hover:text-gray-600' : 'hover:text-gray-300'
                }`}
              >
                Women
              </motion.span>
            </Link>
            <Link href="/shop?category=new-arrivals">
              <motion.span
                whileHover={{ y: -2 }}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer inline-block ${
                  scrolled ? 'hover:text-gray-600' : 'hover:text-gray-300'
                }`}
              >
                New Arrivals
              </motion.span>
            </Link>
            <Link href="/shop?category=accessories">
              <motion.span
                whileHover={{ y: -2 }}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer inline-block ${
                  scrolled ? 'hover:text-gray-600' : 'hover:text-gray-300'
                }`}
              >
                Accessories
              </motion.span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Cart */}
            {mounted && (
              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className={`absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      scrolled ? 'bg-red-600' : 'bg-red-600'
                    }`}>
                      {cartCount}
                    </span>
                  )}
                </motion.div>
              </Link>
            )}

            {/* User Menu - Desktop */}
            {mounted && (
              <>
                {isAuthenticated ? (
                  <div className="relative group hidden md:block">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-8 h-8 rounded-full"
                      />
                    </motion.div>
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <Link href="/account">
                        <span className="block px-4 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer">
                          My Account
                        </span>
                      </Link>
                      <Link href="/orders">
                        <span className="block px-4 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer">
                          My Orders
                        </span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`hidden md:block px-6 py-2.5 text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                        scrolled 
                          ? 'bg-black text-white hover:bg-gray-900' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
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
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col space-y-4">
              <Link href="/shop?category=men">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100"
                >
                  Men
                </span>
              </Link>
              <Link href="/shop?category=women">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100"
                >
                  Women
                </span>
              </Link>
              <Link href="/shop?category=new-arrivals">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100"
                >
                  New Arrivals
                </span>
              </Link>
              <Link href="/shop?category=accessories">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100"
                >
                  Accessories
                </span>
              </Link>
              {mounted && isAuthenticated && (
                <>
                  <Link href="/account">
                    <span
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100"
                    >
                      My Account
                    </span>
                  </Link>
                  <Link href="/orders">
                    <span
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100"
                    >
                      My Orders
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              )}
              {mounted && !isAuthenticated && (
                <Link href="/auth/login">
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100"
                  >
                    Login
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
