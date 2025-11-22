import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WishlistButton from '../components/WishlistButton'
import StyleAssistant from '../components/StyleAssistant'
import ActiveOffersBar from '../components/ActiveOffersBar'
import WeatherRecommendations from '../components/WeatherRecommendations'
import ComparisonBar from '../components/ComparisonBar'
import CompareButton from '../components/CompareButton'
import ShopPageOfferBanner from '../components/ShopPageOfferBanner'
import StickyOfferSidebar from '../components/StickyOfferSidebar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useCartStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function Shop() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [showFilters, setShowFilters] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  // Get category and search from URL query
  useEffect(() => {
    if (router.query.category) {
      setCategory(router.query.category)
    }
    if (router.query.search) {
      setSearchQuery(router.query.search)
    }
  }, [router.query.category, router.query.search])

  useEffect(() => {
    fetchProducts()
  }, [category, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/products', {
        params: { category, sort: sortBy }
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

  // Memoize filtered products for better performance
  useEffect(() => {
    let filtered = [...products]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      )
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes?.some(size => selectedSizes.includes(size))
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, priceRange, selectedSizes])

  const handleQuickAdd = (product) => {
    const defaultSize = product.sizes?.[0] || 'M'
    const defaultColor = product.colors?.[0] || { name: 'Default', hex: '#000000' }
    
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: defaultSize,
      color: defaultColor.name,
    })
    
    toast.success(`${product.name} added to cart!`)
  }

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setPriceRange([0, 10000])
    setSelectedSizes([])
    setCategory('all')
  }

  const categories = [
    { value: 'all', label: 'All Products', count: products.length },
    { value: 'men', label: 'Men', count: products.filter(p => p.category === 'men').length },
    { value: 'women', label: 'Women', count: products.filter(p => p.category === 'women').length },
    { value: 'new-arrivals', label: 'New Arrivals', count: products.filter(p => p.category === 'new-arrivals').length },
    { value: 'accessories', label: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
  ]

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  return (
    <>
      <Head>
        <title>Shop All - VSTRA</title>
        <meta name="description" content="Discover our complete collection of premium clothing" />
      </Head>
      <Toaster position="top-center" />
      <ActiveOffersBar />
      <Navbar />
      <StyleAssistant />
      <ComparisonBar />
      
      <StickyOfferSidebar />
      
      <main 
        className="pb-20 px-6 lg:px-12 min-h-screen bg-vstra-light transition-all duration-300" 
        style={{ marginTop: offersBarVisible ? 'calc(5rem + 3rem)' : '5rem' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-4">
              Shop All
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Discover our complete collection — {filteredProducts.length} products
            </p>
          </motion.div>

          {/* Weather-Based Recommendations */}
          <WeatherRecommendations />

          {/* Offer Banners */}
          <ShopPageOfferBanner />

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative group">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 text-base placeholder-gray-400 bg-white"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-black transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="bg-white p-4 sm:p-6 shadow-lg lg:sticky lg:top-32">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Category</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          category === cat.value
                            ? 'bg-black text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex justify-between items-center">
                          <span>{cat.label}</span>
                          <span className="text-sm opacity-60">({cat.count})</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range - FIXED: Added ₹ symbol to inputs */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                          placeholder="Min"
                          min="0"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                          className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 placeholder-gray-400"
                          placeholder="Max"
                          min="0"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-black"
                    />
                    <p className="text-sm text-gray-600 font-semibold">
                      ₹{priceRange[0].toFixed(2)} - ₹{priceRange[1].toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Sizes - FIXED: Improved button states and hover effects */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <motion.button
                        key={size}
                        onClick={() => toggleSize(size)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`py-2.5 border-2 rounded-lg font-semibold transition-all duration-300 ${
                          selectedSizes.includes(size)
                            ? 'border-black bg-black text-white shadow-md'
                            : 'border-gray-300 bg-white text-black hover:border-black hover:shadow-sm'
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 hover:border-gray-400 transition-all duration-300 bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* View Mode Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <p className="text-gray-600 text-sm sm:text-base">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 border-2 transition-colors ${
                      viewMode === 'grid' ? 'border-black bg-black text-white' : 'border-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 border-2 transition-colors ${
                      viewMode === 'list' ? 'border-black bg-black text-white' : 'border-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">No products found</p>
                  <motion.button
                    onClick={clearFilters}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-8 py-3 md:py-4 text-sm md:text-base font-semibold tracking-wider uppercase hover:bg-gray-900 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl min-h-[48px] md:min-h-[52px] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Clear Filters
                  </motion.button>
                </div>
              ) : (
                <div
                  className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                  }
                >
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className={viewMode === 'list' 
                        ? 'flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-4 sm:p-6 shadow-lg rounded-lg' 
                        : 'group bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full'
                      }
                    >
                      {/* Product Image */}
                      <Link href={`/product/${product._id}`}>
                        <div className={`relative overflow-hidden cursor-pointer ${
                          viewMode === 'list' 
                            ? 'w-full sm:w-48 h-48 flex-shrink-0 rounded-lg' 
                            : 'w-full aspect-[3/4]'
                        }`}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                          
                          {/* Action Buttons */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                            <CompareButton product={product} size="md" />
                            <WishlistButton product={product} size="md" />
                          </div>
                          
                          {/* Stock Badge */}
                          {product.stock < 10 && product.stock > 0 && (
                            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-semibold rounded">
                              Only {product.stock} left
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 text-xs font-semibold rounded">
                              Out of Stock
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                        {/* Product Name */}
                        <Link href={`/product/${product._id}`}>
                          <h3 className="text-base sm:text-lg font-semibold hover:text-gray-600 transition-colors cursor-pointer line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Description (List View Only) */}
                        {viewMode === 'list' && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                        )}
                        
                        {/* Price Section - FIXED: Format to 2 decimals, minimum ₹99.00 */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <p className="text-xl sm:text-2xl font-bold text-black">
                            ₹{Math.max(product.price, 99).toFixed(2)}
                          </p>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <p className="text-sm text-gray-400 line-through">
                              ₹{Math.max(product.compareAtPrice, 99).toFixed(2)}
                            </p>
                          )}
                        </div>
                        
                        {/* Rating Section - FIXED: Consistent star display */}
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-base ${
                                    i < Math.floor(product.rating) 
                                      ? 'text-yellow-500' 
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-1">
                              {product.rating.toFixed(1)} ({product.numReviews || 0})
                            </span>
                          </div>
                        )}
                        
                        {/* Sizes - FIXED: Improved hover states */}
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {product.sizes.slice(0, 4).map((size) => (
                              <motion.span 
                                key={size}
                                whileHover={{ scale: 1.1, borderColor: '#000' }}
                                className="text-xs border-2 border-gray-300 bg-white px-2.5 py-1.5 rounded font-semibold hover:border-black transition-all duration-300 cursor-pointer"
                              >
                                {size}
                              </motion.span>
                            ))}
                          </div>
                        )}
                        
                        {/* Add to Cart Button */}
                        <motion.button
                          onClick={() => handleQuickAdd(product)}
                          disabled={product.stock === 0}
                          whileHover={{ scale: product.stock === 0 ? 1 : 1.02 }}
                          whileTap={{ scale: product.stock === 0 ? 1 : 0.98 }}
                          className="w-full bg-black text-white py-3 px-4 md:py-4 text-sm md:text-base font-semibold tracking-wider uppercase hover:bg-gray-900 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-lg hover:shadow-xl mt-auto min-h-[48px] md:min-h-[52px] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

