import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WishlistButton from '../components/WishlistButton'
import PremiumOfferSystem from '../components/PremiumOfferSystem'
import ComparisonBar from '../components/ComparisonBar'
import ScrollToTop from '../components/ScrollToTop'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useCartStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

/* ─── Subcategory tabs per category ─── */
const subcategoryTabs = {
  all: [{ value: 'all', label: 'View All' }],
  men: [
    { value: 'all', label: 'View All' },
    { value: 'Shirts', label: 'Casual Shirts' },
    { value: 'T-Shirts', label: 'T-Shirts' },
    { value: 'Jeans', label: 'Jeans' },
    { value: 'Trousers', label: 'Trousers' },
    { value: 'Jackets', label: 'Blazers | Jackets' },
    { value: 'Shorts', label: 'Joggers | Shorts' },
    { value: 'Shoes', label: 'Footwear' },
    { value: 'Underwear', label: 'Innerwear' },
  ],
  women: [
    { value: 'all', label: 'View All' },
    { value: 'New In', label: 'New In' },
    { value: 'Trending', label: 'Trending Now' },
    { value: 'Dresses', label: 'Dresses | Jumpsuits' },
    { value: 'Tops', label: 'Shirts | Tops' },
    { value: 'Jeans', label: 'Jeans' },
    { value: 'T-Shirts', label: 'T-Shirts' },
    { value: 'Trousers', label: 'Trousers | Joggers' },
    { value: 'Jackets', label: 'Blazers | Jackets' },
    { value: 'Skirts', label: 'Skirts | Shorts' },
    { value: 'Sarees', label: 'Sarees' },
    { value: 'Kurtas', label: 'Kurtas' },
  ],
  kids: [
    { value: 'all', label: 'View All' },
    { value: 'Boys Clothing', label: 'Boys' },
    { value: 'Girls Clothing', label: 'Girls' },
    { value: 'Baby Clothing', label: 'Baby' },
    { value: 'Kids Footwear', label: 'Footwear' },
    { value: 'Kids Accessories', label: 'Accessories' },
  ],
  accessories: [
    { value: 'all', label: 'View All' },
    { value: 'Bags', label: 'Handbags' },
    { value: 'Jewellery', label: 'Jewellery' },
    { value: 'Sunglasses', label: 'Sunglasses' },
    { value: 'Watches', label: 'Watches' },
    { value: 'Belts', label: 'Belts' },
    { value: 'Footwear', label: 'Footwear' },
  ],
  'new-arrivals': [
    { value: 'all', label: 'View All' },
    { value: 'Trending', label: 'Trending Now' },
    { value: 'Party Wear', label: 'Party Wear' },
    { value: 'Streetwear', label: 'Streetwear' },
  ],
}

const categoryLabels = {
  all: 'All Products',
  men: 'Man',
  women: 'Woman',
  kids: 'Kids',
  'new-arrivals': 'New Arrivals',
  accessories: 'Accessories',
}

const sortOptions = [
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price-asc', label: 'Price (Lowest to Highest)' },
  { value: 'price-desc', label: 'Price (Highest to Lowest)' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Popularity' },
]

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const colorOptions = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Brown', hex: '#6B3E26' },
  { name: 'Red', hex: '#B22222' },
  { name: 'Pink', hex: '#E8A0BF' },
  { name: 'Blue', hex: '#4682B4' },
  { name: 'Green', hex: '#4A7C59' },
  { name: 'Yellow', hex: '#DAA520' },
  { name: 'Purple', hex: '#6A3D9A' },
]

const priceRanges = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: 100000 },
]

/* ─── Accordion Section Component ─── */
function FilterAccordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-6 text-left group"
      >
        <span className="text-[14px] text-[#1a1a1a] font-medium tracking-wide">{title}</span>
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*                 S H O P                     */
/* ═══════════════════════════════════════════ */
export default function Shop() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const tabsRef = useRef(null)

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [subcategory, setSubcategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState(null)
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [gridCols, setGridCols] = useState(4)
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [showSortDrawer, setShowSortDrawer] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)

  /* ─── URL sync ─── */
  useEffect(() => {
    if (router.query.category) setCategory(router.query.category)
    if (router.query.subcategory) setSubcategory(router.query.subcategory)
    if (router.query.search) setSearchQuery(router.query.search)
  }, [router.query.category, router.query.subcategory, router.query.search])

  /* ─── Fetch ─── */
  useEffect(() => { fetchProducts() }, [category, subcategory, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/products', {
        params: {
          category,
          subcategory: subcategory !== 'all' ? subcategory : undefined,
          sort: sortBy,
          _t: Date.now(),
        }
      })
      setProducts(response.data.data)
      setFilteredProducts(response.data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  /* ─── Client-side filtering ─── */
  useEffect(() => {
    let filtered = [...products]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      )
    }
    if (selectedPriceRange) {
      filtered = filtered.filter(p => p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max)
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => p.sizes?.some(s => selectedSizes.includes(s)))
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors?.some(c => selectedColors.includes(c.name))
      )
    }
    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedPriceRange, selectedSizes, selectedColors])

  /* ─── Tabs scroll detection ─── */
  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 5)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
    }
    check()
    el.addEventListener('scroll', check)
    window.addEventListener('resize', check)
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [category])

  const scrollTabs = (dir) => {
    if (!tabsRef.current) return
    tabsRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

  /* ─── Quick add ─── */
  const handleQuickAdd = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to bag', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '13px', letterSpacing: '0.5px', borderRadius: '0' },
      iconTheme: { primary: '#fff', secondary: '#1a1a1a' },
    })
  }

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedPriceRange(null)
    setSelectedSizes([])
    setSelectedColors([])
  }

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedSizes.length > 0 ? 1 : 0) +
    (selectedPriceRange ? 1 : 0) +
    (selectedColors.length > 0 ? 1 : 0)

  const currentTabs = subcategoryTabs[category] || subcategoryTabs.all

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (showFilterDrawer || showSortDrawer) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showFilterDrawer, showSortDrawer])

  return (
    <>
      <Head>
        <title>{categoryLabels[category] || 'Shop'} - VSTRA</title>
        <meta name="description" content={`Shop ${categoryLabels[category] || 'all'} products at VSTRA`} />
      </Head>
      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <Navbar />
      <ComparisonBar />

      <main
        className="min-h-screen bg-white transition-all duration-300"
        style={{ paddingTop: offersBarVisible ? '10rem' : '7.5rem' }}
      >
        <div className="max-w-[1600px] mx-auto px-4 lg:px-10">

          {/* ─── Breadcrumb ─── */}
          <div className="py-4">
            <div className="flex items-center gap-2 text-[12px] text-neutral-400">
              <Link href="/">
                <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Home</span>
              </Link>
              <span>/</span>
              {category !== 'all' ? (
                <>
                  <span className="text-[#1a1a1a] font-semibold">{categoryLabels[category]}</span>
                  {subcategory !== 'all' && (
                    <>
                      <span>/</span>
                      <span className="text-[#1a1a1a] font-semibold">{subcategory}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-[#1a1a1a] font-semibold">All Products</span>
              )}
            </div>
          </div>

          {/* ─── Subcategory tabs ─── */}
          <div className="relative border-b border-neutral-200">
            <div className="flex items-center">
              {canScrollLeft && (
                <button
                  onClick={() => scrollTabs(-1)}
                  className="flex-shrink-0 w-10 h-11 flex items-center justify-center text-neutral-400 hover:text-[#1a1a1a] transition-colors bg-gradient-to-r from-white via-white to-transparent z-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <div
                ref={tabsRef}
                className="flex items-center gap-0 overflow-x-auto flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
                {currentTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSubcategory(tab.value)}
                    className={`whitespace-nowrap px-5 py-3.5 text-[13px] transition-all border-b-2 -mb-[2px] ${
                      subcategory === tab.value
                        ? 'text-[#1a1a1a] font-semibold border-[#1a1a1a]'
                        : 'text-neutral-400 border-transparent hover:text-[#1a1a1a] hover:border-neutral-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {canScrollRight && (
                <button
                  onClick={() => scrollTabs(1)}
                  className="flex-shrink-0 w-10 h-11 flex items-center justify-center text-neutral-400 hover:text-[#1a1a1a] transition-colors border border-neutral-200 rounded-full ml-2 bg-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ─── Controls bar: count | grid slider | FILTER + SORT ─── */}
          <div className="flex items-center justify-between py-4">
            <p className="text-[12px] text-neutral-400 hidden md:block">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>

            {/* Grid slider */}
            <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
              <button
                onClick={() => setGridCols(2)}
                className={`w-5 h-5 grid grid-cols-2 gap-[2px] ${gridCols === 2 ? 'opacity-100' : 'opacity-25 hover:opacity-50'} transition-opacity`}
              >
                {[...Array(4)].map((_, i) => <span key={i} className="bg-[#1a1a1a] rounded-[1px]" />)}
              </button>
              <input
                type="range"
                min={2} max={4}
                value={gridCols}
                onChange={(e) => setGridCols(parseInt(e.target.value))}
                className="w-28 h-[2px] accent-[#1a1a1a] appearance-none bg-neutral-300 cursor-pointer"
              />
              <button
                onClick={() => setGridCols(4)}
                className={`w-5 h-5 grid grid-cols-4 gap-[1px] ${gridCols === 4 ? 'opacity-100' : 'opacity-25 hover:opacity-50'} transition-opacity`}
              >
                {[...Array(16)].map((_, i) => <span key={i} className="bg-[#1a1a1a] rounded-[0.5px]" />)}
              </button>
            </div>

            {/* Filter + Sort buttons */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => { setShowFilterDrawer(true); setShowSortDrawer(false) }}
                className="flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase text-[#1a1a1a] hover:text-neutral-500 transition-colors font-medium"
              >
                <span>Filter</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                {activeFiltersCount > 0 && (
                  <span className="w-[18px] h-[18px] rounded-full bg-[#1a1a1a] text-white text-[9px] flex items-center justify-center font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setShowSortDrawer(true); setShowFilterDrawer(false) }}
                className="flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase text-[#1a1a1a] hover:text-neutral-500 transition-colors font-medium"
              >
                <span>Sort</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* ─── Product Grid ─── */}
          <div className="pb-12">
            {loading ? (
              <div className={`grid gap-x-3 gap-y-10 ${
                gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-[#f2f0ed] mb-3 rounded-sm" />
                    <div className="h-2.5 bg-[#f2f0ed] w-16 mb-2 rounded" />
                    <div className="h-3 bg-[#f2f0ed] w-36 mb-2 rounded" />
                    <div className="h-3 bg-[#f2f0ed] w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f2f0ed] flex items-center justify-center">
                  <svg className="w-7 h-7 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-[15px] text-neutral-500 mb-2">No products found</p>
                <p className="text-[13px] text-neutral-400 mb-6">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-[12px] tracking-[0.15em] uppercase text-[#1a1a1a] border border-[#1a1a1a] px-6 py-2.5 hover:bg-[#1a1a1a] hover:text-white transition-all font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-x-3 gap-y-10 ${
                gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {filteredProducts.map((product, index) => (
                  <ProductCardInline
                    key={product._id}
                    product={product}
                    index={index}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══ FILTER DRAWER (slide from right) ═══ */}
      <AnimatePresence>
        {showFilterDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/30 z-[9998]"
              onClick={() => setShowFilterDrawer(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[9999] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
                <h2 className="text-[18px] font-semibold text-[#1a1a1a] tracking-wide">Filter</h2>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable filter sections */}
              <div className="flex-1 overflow-y-auto">
                {/* Search */}
                <div className="px-6 py-4 border-b border-neutral-200">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 text-[13px] focus:outline-none focus:border-[#1a1a1a] transition-colors bg-white rounded-none"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <FilterAccordion title="Price Range" defaultOpen>
                  <div className="space-y-1">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setSelectedPriceRange(
                          selectedPriceRange?.label === range.label ? null : range
                        )}
                        className={`w-full flex items-center gap-3 py-2 text-[13px] transition-colors ${
                          selectedPriceRange?.label === range.label
                            ? 'text-[#1a1a1a] font-medium'
                            : 'text-neutral-500 hover:text-[#1a1a1a]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedPriceRange?.label === range.label
                            ? 'border-[#1a1a1a]'
                            : 'border-neutral-300'
                        }`}>
                          {selectedPriceRange?.label === range.label && (
                            <span className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                          )}
                        </span>
                        {range.label}
                      </button>
                    ))}
                  </div>
                </FilterAccordion>

                {/* Size */}
                <FilterAccordion title="Size" defaultOpen>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`min-w-[44px] px-3 py-2 text-[12px] border transition-all font-medium ${
                          selectedSizes.includes(size)
                            ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                            : 'border-neutral-200 text-neutral-600 hover:border-[#1a1a1a]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </FilterAccordion>

                {/* Color */}
                <FilterAccordion title="Color">
                  <div className="grid grid-cols-2 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => toggleColor(color.name)}
                        className={`flex items-center gap-2.5 py-2 px-2 text-[12px] transition-all rounded-sm ${
                          selectedColors.includes(color.name)
                            ? 'bg-neutral-100 text-[#1a1a1a] font-medium'
                            : 'text-neutral-500 hover:text-[#1a1a1a] hover:bg-neutral-50'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                            selectedColors.includes(color.name)
                              ? 'border-[#1a1a1a]'
                              : 'border-neutral-200'
                          } ${color.name === 'White' ? 'border-neutral-300' : ''}`}
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </FilterAccordion>

                {/* Category */}
                <FilterAccordion title="Collections">
                  <div className="space-y-1">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setCategory(key); setSubcategory('all') }}
                        className={`w-full text-left py-2 text-[13px] transition-colors ${
                          category === key
                            ? 'text-[#1a1a1a] font-medium'
                            : 'text-neutral-500 hover:text-[#1a1a1a]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </FilterAccordion>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 px-6 py-4 flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 text-[12px] tracking-[0.1em] uppercase text-[#1a1a1a] border border-neutral-200 hover:border-[#1a1a1a] transition-colors font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 py-3 text-[12px] tracking-[0.1em] uppercase text-white bg-[#1a1a1a] hover:bg-black transition-colors font-medium"
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ SORT DRAWER (slide from right) ═══ */}
      <AnimatePresence>
        {showSortDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/30 z-[9998]"
              onClick={() => setShowSortDrawer(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-white z-[9999] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
                <h2 className="text-[18px] font-semibold text-[#1a1a1a] tracking-wide">Sort By</h2>
                <button
                  onClick={() => setShowSortDrawer(false)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sort options */}
              <div className="flex-1 py-2">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortDrawer(false) }}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-[14px] transition-colors ${
                      sortBy === opt.value
                        ? 'text-[#1a1a1a] font-medium bg-neutral-50'
                        : 'text-neutral-500 hover:text-[#1a1a1a] hover:bg-neutral-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      sortBy === opt.value ? 'border-[#1a1a1a]' : 'border-neutral-300'
                    }`}>
                      {sortBy === opt.value && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ScrollToTop />
      <Footer />
    </>
  )
}

/* ═══ Inline Product Card (shop-specific) ═══ */
function ProductCardInline({ product, index, onQuickAdd }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)
  const [hovered, setHovered] = useState(false)

  const displayImg = hovered && product.images.length > 1 && currentImg === 0
    ? product.images[1]
    : product.images[currentImg] || product.images[0]

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5), duration: 0.3 }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setCurrentImg(0) }}
    >
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f0ed] cursor-pointer">
          {!imgLoaded && <div className="absolute inset-0 bg-[#eae8e4] animate-pulse" />}
          <img
            src={displayImg}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            } ${hovered ? 'scale-[1.03]' : 'scale-100'}`}
            loading="lazy"
          />

          <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
            <WishlistButton product={product} size="md" />
          </div>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="bg-[#1a1a1a] text-white text-[9px] tracking-[0.15em] px-2.5 py-1 uppercase font-medium">New</span>
            )}
            {discount > 0 && (
              <span className="bg-[#c0392b] text-white text-[9px] tracking-[0.1em] px-2.5 py-1 uppercase font-medium">-{discount}%</span>
            )}
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 font-medium">Sold Out</span>
            </div>
          )}

          {product.images.length > 1 && (
            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 transition-opacity ${hovered ? 'opacity-0' : 'opacity-100'}`}>
              {product.images.slice(0, 4).map((_, idx) => (
                <span key={idx} className={`w-[6px] h-[6px] rounded-full ${idx === currentImg ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a]/25'}`} />
              ))}
            </div>
          )}

          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
              hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
            onClick={(e) => onQuickAdd(e, product)}
          >
            <button
              disabled={product.stock === 0}
              className="w-full bg-[#1a1a1a]/95 backdrop-blur-sm text-white py-3.5 text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-black transition-colors disabled:bg-neutral-400"
            >
              {product.stock === 0 ? 'Sold Out' : '+ Quick Add'}
            </button>
          </div>
        </div>
      </Link>

      <div className="pt-3 pb-1 px-0.5">
        <p className="text-[10px] text-neutral-400 tracking-[0.12em] uppercase mb-1 font-medium">
          {product.brand || 'VSTRA'}
        </p>
        <Link href={`/product/${product._id}`}>
          <h3 className="text-[13px] text-[#1a1a1a] leading-[1.4] cursor-pointer hover:underline underline-offset-[3px] decoration-neutral-300 line-clamp-2 mb-1.5 font-normal transition-all">
            {product.name}
          </h3>
        </Link>
        {product.colors && product.colors.length > 1 && (
          <div className="flex gap-1 mb-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                className="w-3.5 h-3.5 rounded-full border border-neutral-200"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <p className="text-[14px] text-[#1a1a1a] font-medium">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <p className="text-[12px] text-neutral-400 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#c0392b] font-medium">({discount}% off)</p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
