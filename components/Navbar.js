import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, memo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCartStore, useAuthStore, useWishlistStore } from '../store/useStore'
import SearchBar from './SearchBar'

// Subcollection data for dropdowns
const navDropdowns = {
  men: {
    label: 'Men',
    category: 'men',
    subcollections: [
      { name: 'Shirts', slug: 'Shirts', icon: '👔', desc: 'Formal & casual shirts' },
      { name: 'T-Shirts', slug: 'T-Shirts', icon: '👕', desc: 'Polos, round necks & more' },
      { name: 'Jeans', slug: 'Jeans', icon: '👖', desc: 'Slim, regular & relaxed fit' },
      { name: 'Trousers', slug: 'Trousers', icon: '👖', desc: 'Chinos & formal pants' },
      { name: 'Jackets', slug: 'Jackets', icon: '🧥', desc: 'Blazers, coats & more' },
    ],
  },
  women: {
    label: 'Women',
    category: 'women',
    subcollections: [
      { name: 'Sarees', slug: 'Sarees', icon: '🥻', desc: 'Traditional & designer sarees' },
      { name: 'Dresses', slug: 'Dresses', icon: '👗', desc: 'Casual & party dresses' },
      { name: 'Kurtas', slug: 'Kurtas', icon: '👘', desc: 'Everyday ethnic wear' },
      { name: 'Tops', slug: 'Tops', icon: '👚', desc: 'Blouses, tunics & crop tops' },
      { name: 'Leggings', slug: 'Leggings', icon: '👖', desc: 'Comfortable everyday wear' },
    ],
  },
  accessories: {
    label: 'Accessories',
    category: 'accessories',
    subcollections: [
      { name: 'Bags', slug: 'Bags', icon: '👜', desc: 'Handbags, backpacks & clutches' },
      { name: 'Jewellery', slug: 'Jewellery', icon: '💎', desc: 'Earrings, necklaces & more' },
      { name: 'Watches', slug: 'Watches', icon: '⌚', desc: 'Analogue & smart watches' },
      { name: 'Sunglasses', slug: 'Sunglasses', icon: '🕶️', desc: 'Trendy eyewear' },
      { name: 'Belts & Wallets', slug: 'Belts & Wallets', icon: '👛', desc: 'Leather goods & essentials' },
    ],
  },
  'new-arrivals': {
    label: 'New Arrivals',
    category: 'new-arrivals',
    subcollections: [
      { name: 'Trending Tops', slug: 'Trending Tops', icon: '🔥', desc: 'Viral styles & hot picks' },
      { name: 'Party Wear', slug: 'Party Wear', icon: '✨', desc: 'Glamorous evening outfits' },
      { name: 'Ethnic Fusion', slug: 'Ethnic Fusion', icon: '🏵️', desc: 'Modern traditional mix' },
      { name: 'Streetwear', slug: 'Streetwear', icon: '🛹', desc: 'Urban & casual vibes' },
      { name: 'Activewear', slug: 'Activewear', icon: '🧘', desc: 'Gym & workout essentials' },
    ],
  },
  kids: {
    label: 'Kids',
    category: 'kids',
    subcollections: [
      { name: 'Boys Clothing', slug: 'Boys Clothing', icon: '👦', desc: 'Cool styles for boys' },
      { name: 'Girls Clothing', slug: 'Girls Clothing', icon: '👧', desc: 'Cute outfits for girls' },
      { name: 'Kids Footwear', slug: 'Kids Footwear', icon: '👟', desc: 'Comfortable shoes for play' },
      { name: 'Kids Accessories', slug: 'Kids Accessories', icon: '🎒', desc: 'School bags & more' },
      { name: 'Baby Clothing', slug: 'Baby Clothing', icon: '👶', desc: 'Soft wear for infants' },
    ],
  },
}

function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [scrollOpacity, setScrollOpacity] = useState(0.95)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [offersBarVisible, setOffersBarVisible] = useState(false)
  const [offersBarHeight, setOffersBarHeight] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null)
  const dropdownTimeoutRef = useRef(null)
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
      const opacity = Math.min(0.95 + (scrollY / 200) * 0.05, 1)
      setScrollOpacity(opacity)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleOffersBarVisibility = (e) => {
      setOffersBarVisible(e.detail.visible)
      if (e.detail.height) {
        setOffersBarHeight(e.detail.height)
      }
    }
    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    return () => window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
  }, [])

  // Close dropdown & mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setActiveDropdown(null)
      setMobileMenuOpen(false)
      setMobileExpandedCategory(null)
    }
    router.events.on('routeChangeStart', handleRouteChange)
    return () => router.events.off('routeChangeStart', handleRouteChange)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleDropdownEnter = (key) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
    setActiveDropdown(key)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1], staggerChildren: 0.04 }
    },
    exit: { 
      opacity: 0, y: 4, scale: 0.99,
      transition: { duration: 0.15, ease: 'easeIn' }
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ 
        backgroundColor: `rgba(255, 255, 255, ${scrollOpacity})`,
        backdropFilter: scrollOpacity < 1 ? 'blur(10px)' : 'none',
        top: offersBarVisible ? `${offersBarHeight}px` : '0px',
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
              className="text-3xl font-bold tracking-tighter cursor-pointer mr-8"
            >
              VSTRA
            </motion.div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" role="navigation" aria-label="Main navigation">
            {/* Men, Women, Accessories - with mega-dropdowns */}
            {Object.entries(navDropdowns).map(([key, dropdown]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(key)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href={`/shop?category=${dropdown.category}`} onClick={() => setActiveDropdown(null)}>
                  <motion.span
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm font-semibold tracking-wider uppercase cursor-pointer inline-flex items-center gap-1 px-4 py-2 transition-all duration-300 rounded-lg ${
                      activeDropdown === key 
                        ? 'text-black bg-gray-50' 
                        : 'text-black hover:text-gray-600'
                    }`}
                  >
                    {dropdown.label}
                    <motion.svg 
                      className="w-3.5 h-3.5 ml-0.5"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      animate={{ rotate: activeDropdown === key ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.span>
                </Link>

                {/* Mega Dropdown Panel */}
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[340px] origin-top"
                      onMouseEnter={() => handleDropdownEnter(key)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      {/* Arrow indicator */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 z-10" />
                      
                      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden z-20"
                        style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)' }}
                      >
                        {/* Header */}
                        <div className="px-6 pt-5 pb-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
                              {dropdown.label}&apos;s Collection
                            </h3>
                            <Link href={`/shop?category=${dropdown.category}`} onClick={() => setActiveDropdown(null)}>
                              <span className="text-xs font-semibold text-black hover:underline cursor-pointer transition-colors">
                                View All →
                              </span>
                            </Link>
                          </div>
                          <div className="mt-2 h-px bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
                        </div>

                        {/* Subcollection Items */}
                        <div className="px-3 pb-4 space-y-0.5">
                          {dropdown.subcollections.map((sub) => (
                            <motion.div key={sub.slug} variants={itemVariants}>
                              <Link href={`/shop?category=${dropdown.category}&subcategory=${encodeURIComponent(sub.slug)}`} onClick={() => setActiveDropdown(null)}>
                                <motion.div 
                                  className="flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group/item"
                                  whileHover={{ backgroundColor: '#f9fafb', x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover/item:bg-white group-hover/item:shadow-md transition-all duration-200">
                                    {sub.icon}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-black group-hover/item:text-black tracking-wide">
                                      {sub.name}
                                    </p>
                                    <p className="text-xs text-gray-400 group-hover/item:text-gray-500 mt-0.5 truncate">
                                      {sub.desc}
                                    </p>
                                  </div>
                                  <svg className="w-4 h-4 text-gray-300 group-hover/item:text-black transition-all duration-200 group-hover/item:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </motion.div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50/80 px-6 py-3 border-t border-gray-100">
                          <Link href={`/shop?category=${dropdown.category}`} onClick={() => setActiveDropdown(null)}>
                            <motion.span
                              whileHover={{ x: 3 }}
                              className="text-xs font-semibold text-gray-500 hover:text-black cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                              Explore all {dropdown.label.toLowerCase()}
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </motion.span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search */}
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
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden border border-gray-100 z-50">
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
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 py-4 bg-white overflow-hidden"
            >
              <div className="flex flex-col space-y-1">
                {/* Categories with expandable subcollections */}
                {Object.entries(navDropdowns).map(([key, dropdown]) => (
                  <div key={key}>
                    <div className="flex items-center mx-2">
                      <Link href={`/shop?category=${dropdown.category}`} className="flex-1">
                        <motion.span
                          onClick={() => setMobileMenuOpen(false)}
                          whileTap={{ scale: 0.98 }}
                          className="block px-4 py-3 text-sm font-semibold cursor-pointer rounded-lg transition-all text-black hover:bg-gray-100"
                        >
                          {dropdown.label}
                        </motion.span>
                      </Link>
                      <motion.button
                        onClick={() => setMobileExpandedCategory(mobileExpandedCategory === key ? null : key)}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <motion.svg 
                          className="w-4 h-4 text-gray-500"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          animate={{ rotate: mobileExpandedCategory === key ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </motion.button>
                    </div>

                    {/* Expandable subcollections */}
                    <AnimatePresence>
                      {mobileExpandedCategory === key && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 mr-2 mb-2 py-2 space-y-0.5 border-l-2 border-gray-200 pl-4">
                            {dropdown.subcollections.map((sub) => (
                              <Link key={sub.slug} href={`/shop?category=${dropdown.category}&subcategory=${encodeURIComponent(sub.slug)}`}>
                                <motion.span
                                  onClick={() => setMobileMenuOpen(false)}
                                  whileHover={{ x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-lg transition-all text-gray-600 hover:text-black hover:bg-gray-50"
                                >
                                  <span className="text-lg">{sub.icon}</span>
                                  <div>
                                    <span className="font-medium">{sub.name}</span>
                                    <span className="block text-xs text-gray-400 mt-0.5">{sub.desc}</span>
                                  </div>
                                </motion.span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Divider */}
                <div className="border-t border-gray-100 my-2 mx-4" />

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
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default memo(Navbar)
