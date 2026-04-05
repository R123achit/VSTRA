import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

/**
 * ML-Powered Product Recommendations Component
 * Displays multiple types of recommendations like Amazon/Flipkart:
 * 1. Similar Products (Content-based)
 * 2. Frequently Bought Together
 * 3. Personalized Recommendations
 * 4. Trending Products
 */

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'

export default function MLRecommendations({ currentProductId, category }) {
  const [recommendations, setRecommendations] = useState({
    similar: [],
    frequentlyBought: [],
    personalized: [],
    trending: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('similar')
  
  const scrollRefs = {
    similar: useRef(null),
    frequentlyBought: useRef(null),
    personalized: useRef(null),
    trending: useRef(null)
  }

  useEffect(() => {
    if (currentProductId) {
      fetchRecommendations()
    }
  }, [currentProductId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      
      // Get user history from localStorage
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      const userHistory = recentlyViewed
        .map(p => p._id)
        .filter(id => id && id !== currentProductId)
        .slice(0, 10)
      
      // Use our Next.js API proxy which handles ID mapping
      const response = await axios.get('/api/recommendations', {
        params: {
          productId: currentProductId,
          history: userHistory.join(',')
        },
        timeout: 5000
      })
      
      if (response.data.success) {
        const recs = response.data.recommendations
        
        // Deduplicate across all recommendation types
        const allSeenIds = new Set([currentProductId])
        const allSeenNames = new Set()
        
        const deduplicateProducts = (products) => {
          const unique = []
          for (const product of products) {
            const productId = product._id?.toString()
            const productName = product.name?.toLowerCase()
            
            if (!productId || !productName) continue
            
            if (!allSeenIds.has(productId) && !allSeenNames.has(productName)) {
              allSeenIds.add(productId)
              allSeenNames.add(productName)
              unique.push(product)
            }
          }
          return unique
        }
        
        setRecommendations({
          similar: deduplicateProducts(recs.similar_products || []),
          frequentlyBought: deduplicateProducts(recs.frequently_bought_together || []),
          personalized: deduplicateProducts(recs.personalized || []),
          trending: deduplicateProducts(recs.trending || [])
        })
        
        setLoading(false)
        return
      }
      
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (section, direction) => {
    const ref = scrollRefs[section]
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const renderProductCard = (product) => {
    // Ensure we have a valid product ID
    const productId = product._id || product.id
    if (!productId) return null
    
    return (
      <Link key={productId} href={`/product/${productId}`}>
        <div className="min-w-[200px] md:min-w-[240px] xl:min-w-[280px] snap-start cursor-pointer group/card flex-shrink-0">
          {/* Product Image */}
          <div className="w-full aspect-[3/4] bg-[#f5f5f5] mb-4 overflow-hidden relative">
            <div className="absolute inset-0 p-4 pb-6 flex items-center justify-center">
              <img
                src={product.images?.[0] || product.image_url || '/placeholder.png'}
                alt={product.name || product.title}
                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover/card:scale-105 mix-blend-multiply"
                onError={(e) => {
                  e.target.src = '/placeholder.png'
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="text-left space-y-1.5">
            <p className="text-[11px] xl:text-[12px] text-gray-600 uppercase tracking-widest font-normal">
              {product.brand || 'VSTRA'}
            </p>
            <h3 className="text-[13px] xl:text-[14px] text-black leading-snug font-normal line-clamp-2">
              {product.name || product.title}
            </h3>
            <div className="text-[13px] xl:text-[14px] text-black normal-nums pt-0.5">
              ₹ {(product.price || product.sold_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  const renderSection = (title, products, sectionKey, description) => {
    if (!products || products.length === 0) return null

    return (
      <div className="mb-16">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[16px] xl:text-[18px] text-black font-bold tracking-wide mb-1">
              {title}
            </h2>
            {description && (
              <p className="text-[12px] text-gray-500">{description}</p>
            )}
          </div>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll(sectionKey, 'left')}
            className="absolute -left-6 xl:-left-10 top-[40%] -translate-y-1/2 w-8 h-8 xl:w-10 xl:h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors z-10 hidden md:flex"
          >
            <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollRefs[sectionKey]}
            className="flex gap-4 xl:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map(renderProductCard)}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll(sectionKey, 'right')}
            className="absolute -right-6 xl:-right-10 top-[40%] -translate-y-1/2 w-8 h-8 xl:w-10 xl:h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors z-10 hidden md:flex"
          >
            <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="h-6 bg-gray-100 rounded w-48 mb-8 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[240px] animate-pulse">
              <div className="aspect-[3/4] bg-gray-100 rounded mb-4" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Similar Products - Always show first */}
      {renderSection(
        'Similar Products',
        recommendations.similar,
        'similar',
        'Customers who viewed this item also viewed'
      )}

      {/* Frequently Bought Together */}
      {renderSection(
        'Frequently Bought Together',
        recommendations.frequentlyBought,
        'frequentlyBought',
        'Complete your look with these items'
      )}

      {/* Personalized Recommendations */}
      {recommendations.personalized.length > 0 && renderSection(
        'Recommended For You',
        recommendations.personalized,
        'personalized',
        'Based on your browsing history'
      )}

      {/* Trending Products */}
      {renderSection(
        'Trending Now',
        recommendations.trending,
        'trending',
        'Popular products in this category'
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
