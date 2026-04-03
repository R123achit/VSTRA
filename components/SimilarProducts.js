import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function SimilarProducts({ currentProductId, category }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (category) {
      fetchSimilarProducts()
    }
  }, [category, currentProductId])

  const fetchSimilarProducts = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/products?category=${encodeURIComponent(category)}&limit=10`)
      // Filter out the current product
      const similar = res.data.data?.filter(p => p._id !== currentProductId) || []
      setProducts(similar)
    } catch (error) {
      console.error('Failed to fetch similar products:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (loading) return null
  if (!products || products.length === 0) return null

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[16px] xl:text-[18px] text-black font-bold tracking-wide">
          Similar Products
        </h2>
      </div>

      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-6 xl:-left-10 top-[40%] -translate-y-1/2 w-8 h-8 xl:w-10 xl:h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors z-10 hidden md:flex"
        >
          <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 xl:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <Link key={product._id} href={`/product/${product._id}`}>
              <div className="min-w-[200px] md:min-w-[240px] xl:min-w-[280px] snap-start cursor-pointer group/card flex-shrink-0">
                {/* Product Image */}
                <div className="w-full aspect-[3/4] bg-[#f5f5f5] mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 p-4 pb-6 flex items-center justify-center">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover/card:scale-105 mix-blend-multiply"
                    />
                  </div>
                </div>

                {/* Product Info - Strictly identical to screenshot */}
                <div className="text-left space-y-1.5">
                  <p className="text-[11px] xl:text-[12px] text-gray-600 uppercase tracking-widest font-normal">
                    {product.brand || 'VSTRA'}
                  </p>
                  <h3 className="text-[13px] xl:text-[14px] text-black leading-snug font-normal line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-[13px] xl:text-[14px] text-black normal-nums pt-0.5">
                    ₹ {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-6 xl:-right-10 top-[40%] -translate-y-1/2 w-8 h-8 xl:w-10 xl:h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors z-10 hidden md:flex"
        >
          <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
