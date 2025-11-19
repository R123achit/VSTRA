import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSearchStore } from '../store/useStore'
import axios from 'axios'

export default function SearchBar({ scrolled }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [popularSearches, setPopularSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const { recentSearches, addSearch, removeSearch } = useSearchStore()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchPopularSearches()
  }, [])

  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(() => {
        fetchSuggestions()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [query])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/search/autocomplete?q=${query}`)
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPopularSearches = async () => {
    try {
      const { data } = await axios.get('/api/search/popular')
      setPopularSearches(data.searches || [])
    } catch (error) {
      console.error('Popular searches error:', error)
    }
  }

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      addSearch(searchQuery)
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(query)
  }

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products..."
          className={`w-64 px-4 py-2 pl-10 text-sm rounded-full transition-all focus:outline-none focus:ring-2 ${
            scrolled
              ? 'bg-gray-100 text-black placeholder-gray-500 focus:ring-black'
              : 'bg-white/10 text-white placeholder-white/60 focus:ring-white'
          }`}
        />
        <svg
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            scrolled ? 'text-gray-500' : 'text-white/60'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-96 bg-white rounded-lg shadow-2xl overflow-hidden z-50"
          >
            {/* Suggestions */}
            {query.length > 1 && (
              <div className="border-b border-gray-100">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Products
                    </div>
                    {suggestions.map((product) => (
                      <Link key={product._id} href={`/product/${product._id}`}>
                        <motion.div
                          whileHover={{ backgroundColor: '#f9fafb' }}
                          onClick={() => {
                            addSearch(query)
                            setIsOpen(false)
                            setQuery('')
                          }}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-black">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ${product.price}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No products found
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                  <span>Recent Searches</span>
                  <button
                    onClick={() => useSearchStore.getState().clearSearchHistory()}
                    className="text-xs text-red-500 hover:text-red-600 normal-case"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer group"
                    onClick={() => handleSearch(search)}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-black">{search}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSearch(search)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400 hover:text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {query.length === 0 && popularSearches.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Popular Searches
                </div>
                {popularSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span className="text-sm text-black">{search}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
