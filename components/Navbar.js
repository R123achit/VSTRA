import { useState, useEffect, memo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCartStore, useAuthStore, useWishlistStore } from '../store/useStore'
import SearchBar from './SearchBar'

// Westside-style mega menu data — multi-column text-only
const navDropdowns = {
  men: {
    label: 'Man',
    category: 'men',
    columns: [
      {
        heading: 'Western Wear',
        links: [
          { name: 'View All', slug: '' },
          { name: 'Casual Shirts', slug: 'Shirts', bold: true },
          { name: 'T-Shirts', slug: 'T-Shirts', bold: true },
          { name: 'Jeans', slug: 'Jeans' },
          { name: 'Trousers', slug: 'Trousers' },
          { name: 'Blazers | Jackets', slug: 'Jackets' },
          { name: 'Joggers | Shorts', slug: 'Shorts' },
        ],
      },
      {
        heading: 'Ethnic Wear',
        links: [
          { name: 'Kurtas', slug: 'Kurtas' },
          { name: 'Ethnic Sets', slug: 'Ethnic Sets' },
          { name: 'Nehru Jackets', slug: 'Nehru Jackets' },
        ],
      },
      {
        heading: 'Footwear',
        links: [
          { name: 'Trending Now', bold: true },
          { name: 'Casual Shoes', slug: 'Casual Shoes' },
          { name: 'Formal Shoes', slug: 'Formal Shoes' },
          { name: 'Sneakers', slug: 'Sneakers' },
          { name: 'Sandals | Slides', slug: 'Sandals' },
        ],
      },
    ],
  },
  women: {
    label: 'Woman',
    category: 'women',
    columns: [
      {
        heading: 'Western Wear',
        links: [
          { name: 'View All', slug: '' },
          { name: 'Dresses', slug: 'Dresses', bold: true },
          { name: 'Tops', slug: 'Tops' },
          { name: 'T-Shirts', slug: 'T-Shirts' },
          { name: 'Jeans', slug: 'Jeans' },
          { name: 'Trousers | Joggers', slug: 'Trousers' },
          { name: 'Blazers | Jackets', slug: 'Jackets' },
          { name: 'Skirts | Shorts', slug: 'Skirts' },
        ],
      },
      {
        heading: 'Ethnic Wear',
        links: [
          { name: 'View All', slug: '' },
          { name: 'Kurtas', slug: 'Kurtas', bold: true },
          { name: 'Sarees', slug: 'Sarees' },
          { name: 'Ethnic Dresses', slug: 'Ethnic Dresses' },
          { name: 'Leggings', slug: 'Leggings' },
          { name: 'Dupatta | Shawls', slug: 'Dupatta' },
        ],
      },
      {
        heading: 'Footwear',
        links: [
          { name: 'View All', slug: '' },
          { name: 'Heeled Sandals', slug: 'Heeled Sandals' },
          { name: 'Flat Sandals', slug: 'Flat Sandals' },
          { name: 'Sneakers', slug: 'Sneakers' },
          { name: 'Heels', slug: 'Heels' },
        ],
      },
      {
        heading: 'Accessories',
        links: [
          { name: 'Handbags', slug: 'Bags', bold: true },
          { name: 'Jewellery', slug: 'Jewellery', bold: true },
          { name: 'Sunglasses', slug: 'Sunglasses' },
          { name: 'Watches', slug: 'Watches' },
          { name: 'Belts', slug: 'Belts' },
        ],
      },
    ],
  },
  accessories: {
    label: 'Accessories',
    category: 'accessories',
    columns: [
      {
        heading: 'Bags',
        links: [
          { name: 'Handbags', slug: 'Bags', bold: true },
          { name: 'Backpacks', slug: 'Backpacks' },
          { name: 'Clutches', slug: 'Clutches' },
          { name: 'Tote Bags', slug: 'Tote Bags' },
        ],
      },
      {
        heading: 'Jewellery',
        links: [
          { name: 'Earrings', slug: 'Jewellery', bold: true },
          { name: 'Necklaces', slug: 'Necklaces' },
          { name: 'Bracelets', slug: 'Bracelets' },
          { name: 'Rings', slug: 'Rings' },
        ],
      },
      {
        heading: 'Eyewear',
        links: [
          { name: 'Sunglasses', slug: 'Sunglasses', bold: true },
          { name: 'Reading Glasses', slug: 'Reading Glasses' },
        ],
      },
      {
        heading: 'Others',
        links: [
          { name: 'Watches', slug: 'Watches', bold: true },
          { name: 'Belts', slug: 'Belts \u0026 Wallets' },
          { name: 'Wallets', slug: 'Wallets' },
          { name: 'Scarves', slug: 'Scarves' },
        ],
      },
    ],
  },
  'new-arrivals': {
    label: 'New Arrivals',
    category: 'new-arrivals',
    columns: [
      {
        heading: 'New In',
        links: [
          { name: 'View All', slug: '', bold: true },
          { name: 'Trending Now', slug: 'Trending Tops', bold: true },
        ],
      },
      {
        heading: 'Collections',
        links: [
          { name: 'Party Wear', slug: 'Party Wear' },
          { name: 'Ethnic Fusion', slug: 'Ethnic Fusion' },
          { name: 'Streetwear', slug: 'Streetwear' },
          { name: 'Activewear', slug: 'Activewear' },
        ],
      },
    ],
  },
  kids: {
    label: 'Kids',
    category: 'kids',
    columns: [
      {
        heading: 'Boys',
        links: [
          { name: 'View All', slug: '', bold: true },
          { name: 'T-Shirts', slug: 'Boys Clothing' },
          { name: 'Shirts', slug: 'Boys Clothing' },
          { name: 'Jeans | Trousers', slug: 'Boys Clothing' },
        ],
      },
      {
        heading: 'Girls',
        links: [
          { name: 'View All', slug: '', bold: true },
          { name: 'Dresses', slug: 'Girls Clothing' },
          { name: 'Tops', slug: 'Girls Clothing' },
          { name: 'Ethnic Wear', slug: 'Girls Clothing' },
        ],
      },
      {
        heading: 'Baby',
        links: [
          { name: 'Baby Clothing', slug: 'Baby Clothing', bold: true },
          { name: 'Rompers', slug: 'Baby Clothing' },
          { name: 'Sets', slug: 'Baby Clothing' },
        ],
      },
      {
        heading: 'Accessories',
        links: [
          { name: 'Footwear', slug: 'Kids Footwear', bold: true },
          { name: 'School Bags', slug: 'Kids Accessories' },
        ],
      },
    ],
  },
}

function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
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

  // Scroll hiding state
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 20)

      if (currentScrollY > 120) {
        // Hide if scrolling down and no menus are actively open
        if (currentScrollY > lastScrollY.current && !mobileMenuOpen && !activeDropdown) {
          setNavVisible(false)
        // Show if scrolling up
        } else if (currentScrollY < lastScrollY.current) {
          setNavVisible(true)
        }
      } else {
        // Always show near the top
        setNavVisible(true)
      }

      lastScrollY.current = currentScrollY
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen, activeDropdown])

  useEffect(() => {
    const handleOffersBarVisibility = (e) => {
      setOffersBarVisible(e.detail.visible)
      if (e.detail.height) setOffersBarHeight(e.detail.height)
    }
    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    return () => window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
  }, [])

  useEffect(() => {
    const handleRouteChange = () => {
      setActiveDropdown(null)
      setMobileMenuOpen(false)
      setMobileExpandedCategory(null)
    }
    router.events.on('routeChangeStart', handleRouteChange)
    return () => router.events.off('routeChangeStart', handleRouteChange)
  }, [router])

  const handleLogout = () => { logout(); router.push('/') }

  const handleDropdownEnter = (key) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
    setActiveDropdown(key)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 200)
  }

  const isHome = router.pathname === '/'
  const isTransparent = isHome && !scrolled && !activeDropdown

  return (
    <nav
      style={{
        top: navVisible ? (offersBarVisible ? `${offersBarHeight}px` : '0px') : '-120%',
        zIndex: 50,
      }}
      className={`fixed left-0 right-0 transition-all duration-300 ease-in-out ${
        isTransparent ? 'bg-transparent text-black' : 'bg-white shadow-sm text-black'
      }`}
    >
      {/* Row 1: Logo — Search — Icons */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <span className="text-[26px] font-bold tracking-[-0.02em] cursor-pointer text-black select-none"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>V</span>STRA
            </span>
          </Link>

          {/* Search Bar — centered */}
          <div className="hidden md:flex flex-1 max-w-md mx-12">
            <SearchBar scrolled={true} />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-5">
            {/* Wishlist */}
            {mounted && (
              <Link href="/wishlist">
                <div className="relative cursor-pointer group" aria-label="Wishlist">
                  <svg className="w-[22px] h-[22px] text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium bg-black">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* Cart */}
            {mounted && (
              <Link href="/cart">
                <div className="relative cursor-pointer group" aria-label="Shopping Bag">
                  <svg className="w-[22px] h-[22px] text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium bg-black">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* Sign in / User menu */}
            {mounted && (
              <>
                {isAuthenticated ? (
                  <div className="relative group hidden md:block">
                    <div className="cursor-pointer flex items-center gap-1.5 px-2 py-1">
                      <span className="text-[13px] text-black font-medium tracking-wide">
                        Hi {user?.name ? user.name.split(' ')[0] : 'User'}
                      </span>
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {/* User dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link href="/account">
                        <span className="block px-5 py-3 text-[13px] text-black hover:bg-gray-50 cursor-pointer transition-colors">
                          My Account
                        </span>
                      </Link>
                      <Link href="/orders">
                        <span className="block px-5 py-3 text-[13px] text-black hover:bg-gray-50 cursor-pointer transition-colors">
                          My Orders
                        </span>
                      </Link>
                      <div className="h-px bg-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-5 py-3 text-[13px] text-black hover:bg-gray-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/login">
                    <span className="hidden md:block text-[13px] text-black cursor-pointer hover:underline underline-offset-4 transition-all">
                      Sign in
                    </span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Category Navigation — Westside style */}
      <div className="hidden md:block border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-center gap-0">
            {Object.entries(navDropdowns).map(([key, dropdown]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(key)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href={`/shop?category=${dropdown.category}`} onClick={() => setActiveDropdown(null)}>
                  <span className={`inline-flex items-center gap-1 px-5 py-4 text-[14.5px] font-medium tracking-[0.01em] cursor-pointer transition-all duration-200 ${
                    activeDropdown === key
                      ? 'text-black'
                      : 'text-gray-800 hover:text-black'
                  }`}>
                    {dropdown.label}
                    <svg className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${activeDropdown === key ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </Link>

                {/* Active underline indicator */}
                {activeDropdown === key && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-5 right-5 h-[1.5px] bg-black"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
            ))}

            {/* View More static link */}
            <div className="relative">
              <Link href="/view-more" onClick={() => setActiveDropdown(null)}>
                <span className={`inline-flex items-center gap-1 px-5 py-4 text-[14.5px] font-medium tracking-[0.01em] cursor-pointer transition-all duration-200 text-gray-800 hover:text-black`}>
                  View More
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mega Dropdown — Full width, Westside style */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 right-0 bg-white border-t border-gray-100 overflow-hidden z-40"
            onMouseEnter={() => handleDropdownEnter(activeDropdown)}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
              <div className="flex gap-12">

                {/* Editorial Image (left column) */}
                <div className="w-[200px] flex-shrink-0">
                  <div className="w-[200px] h-[260px] bg-[#f5f5f5] overflow-hidden">
                    <img
                      src={
                        navDropdowns[activeDropdown]?.category === 'men'
                          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=520&fit=crop'
                          : navDropdowns[activeDropdown]?.category === 'women'
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=520&fit=crop'
                          : navDropdowns[activeDropdown]?.category === 'kids'
                          ? 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=520&fit=crop'
                          : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=520&fit=crop'
                      }
                      alt={navDropdowns[activeDropdown]?.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[14px] text-black mt-3 font-normal">
                    {navDropdowns[activeDropdown]?.label}
                  </p>
                </div>

                {/* Text Columns */}
                <div className="flex-1 flex gap-12">
                  {navDropdowns[activeDropdown]?.columns.map((col, colIdx) => (
                    <div key={colIdx} className="min-w-[140px]">
                      <h4 className="text-[13px] font-bold text-black mb-3 tracking-wide">
                        {col.heading}
                      </h4>
                      <ul className="space-y-2">
                        {col.links.map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <Link
                              href={link.slug !== undefined
                                ? `/shop?category=${navDropdowns[activeDropdown].category}${link.slug ? `&subcategory=${encodeURIComponent(link.slug)}` : ''}`
                                : '#'
                              }
                              onClick={() => setActiveDropdown(null)}
                            >
                              <span className={`text-[13px] cursor-pointer transition-colors hover:text-black block ${
                                link.bold ? 'text-black font-semibold' : 'text-gray-500'
                              }`}>
                                {link.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom utility bar */}
            <div className="border-t border-gray-100">
              <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-3 flex items-center gap-8">
                <Link href="/about" onClick={() => setActiveDropdown(null)}>
                  <span className="text-[12px] text-gray-400 hover:text-black cursor-pointer transition-colors">About Us</span>
                </Link>
                <Link href="/shop" onClick={() => setActiveDropdown(null)}>
                  <span className="text-[12px] text-gray-400 hover:text-black cursor-pointer transition-colors">All Collections</span>
                </Link>
                <Link href="/contact" onClick={() => setActiveDropdown(null)}>
                  <span className="text-[12px] text-gray-400 hover:text-black cursor-pointer transition-colors">Contact Us</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when dropdown is open */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/10 z-[-1]"
            style={{ top: '100%' }}
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="py-4">
              {Object.entries(navDropdowns).map(([key, dropdown]) => (
                <div key={key}>
                  <div className="flex items-center">
                    <Link href={`/shop?category=${dropdown.category}`} className="flex-1">
                      <span
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-6 py-3 text-[14px] text-black cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {dropdown.label}
                      </span>
                    </Link>
                    <button
                      onClick={() => setMobileExpandedCategory(mobileExpandedCategory === key ? null : key)}
                      className="px-4 py-3"
                    >
                      <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${mobileExpandedCategory === key ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Mobile expandable subcategories */}
                  <AnimatePresence>
                    {mobileExpandedCategory === key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-gray-50"
                      >
                        <div className="py-2">
                          {dropdown.columns.map((col, colIdx) => (
                            <div key={colIdx} className="mb-2">
                              <span className="block px-8 py-1.5 text-[11px] text-gray-400 tracking-[0.1em] uppercase">
                                {col.heading}
                              </span>
                              {col.links.map((link, linkIdx) => (
                                <Link
                                  key={linkIdx}
                                  href={link.slug !== undefined
                                    ? `/shop?category=${dropdown.category}${link.slug ? `&subcategory=${encodeURIComponent(link.slug)}` : ''}`
                                    : '#'
                                  }
                                >
                                  <span
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-10 py-2 text-[13px] cursor-pointer hover:bg-gray-100 transition-colors ${
                                      link.bold ? 'text-black font-medium' : 'text-gray-500'
                                    }`}
                                  >
                                    {link.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Divider */}
              <div className="h-px bg-gray-100 my-2 mx-6" />

              {mounted && isAuthenticated && (
                <>
                  <Link href="/account">
                    <span onClick={() => setMobileMenuOpen(false)} className="block px-6 py-3 text-[14px] text-black cursor-pointer hover:bg-gray-50 transition-colors">
                      My Account
                    </span>
                  </Link>
                  <Link href="/orders">
                    <span onClick={() => setMobileMenuOpen(false)} className="block px-6 py-3 text-[14px] text-black cursor-pointer hover:bg-gray-50 transition-colors">
                      My Orders
                    </span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="block w-full text-left px-6 py-3 text-[14px] text-black hover:bg-gray-50 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              )}
              {mounted && !isAuthenticated && (
                <Link href="/auth/login">
                  <span onClick={() => setMobileMenuOpen(false)} className="block px-6 py-3 text-[14px] text-black cursor-pointer hover:bg-gray-50 transition-colors">
                    Sign in
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default memo(Navbar)
