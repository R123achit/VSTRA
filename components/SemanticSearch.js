import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import axios from 'axios'

export default function SemanticSearch({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await axios.post('/api/search/semantic', {
        query: query.trim(),
        top_k: 12
      })

      if (response.data.success) {
        setResults(response.data.products)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const exampleQueries = [
    'blue cotton saree for women',
    'black formal trouser men',
    'sports bra women',
    'red silk saree wedding',
    'casual shirt men'
  ]

  const handleExampleClick = (example) => {
    setQuery(example)
    setTimeout(() => {
      document.getElementById('semantic-search-form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      )
    }, 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[10000] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a]">AI-Powered Search</h2>
            <p className="text-sm text-neutral-500 mt-1">Find products using natural language</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Form */}
        <div className="px-6 py-4 border-b border-neutral-200">
          <form id="semantic-search-form" onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., blue cotton saree for women..."
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#1a1a1a] text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-[#1a1a1a] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Example Queries */}
          <div className="mt-4">
            <p className="text-xs text-neutral-500 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs text-neutral-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-neutral-600 mb-2">No products found</p>
              <p className="text-sm text-neutral-400">Try a different search query</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-neutral-600 mb-2">Ready to search!</p>
              <p className="text-sm text-neutral-400">Enter a description or click an example above</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((product, idx) => (
                <Link key={product._id || idx} href={`/product/${product._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden mb-2">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mb-1">{product.brand || product.category}</p>
                    <h3 className="text-sm font-medium text-[#1a1a1a] line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      ₹{product.price?.toFixed(2) || '0.00'}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
