import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useComparisonStore } from '../store/useComparisonStore'
import { useCartStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function Compare() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { items, removeFromComparison, clearComparison } = useComparisonStore()
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = (product) => {
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

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Compare Products - VSTRA</title>
        </Head>
        <ActiveOffersBar />
        <Navbar />
        <main 
          className="pb-20 px-6 lg:px-12 min-h-screen transition-all duration-300" 
          style={{ marginTop: offersBarVisible ? 'calc(5rem + 3rem)' : '5rem' }}
        >
          <div className="max-w-7xl mx-auto text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h1 className="text-4xl font-bold mb-4">No Products to Compare</h1>
            <p className="text-gray-600 mb-8">Add products from the shop to start comparing</p>
            <Link href="/shop">
              <button className="px-8 py-3 bg-[#0A1628] text-white font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all">
                Browse Products
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const comparisonData = [
    { label: 'Product', key: 'product' },
    { label: 'Price', key: 'price' },
    { label: 'Rating', key: 'rating' },
    { label: 'Category', key: 'category' },
    { label: 'Fabric', key: 'fabric' },
    { label: 'Available Sizes', key: 'sizes' },
    { label: 'Available Colors', key: 'colors' },
    { label: 'Stock', key: 'stock' },
    { label: 'Reviews', key: 'numReviews' },
    { label: 'Shipping', key: 'shipping' },
  ]

  return (
    <>
      <Head>
        <title>Compare Products - VSTRA</title>
      </Head>
      <ActiveOffersBar />
      <Navbar />

      <main 
        className="pb-20 px-6 lg:px-12 min-h-screen bg-gray-50 transition-all duration-300" 
        style={{ marginTop: offersBarVisible ? 'calc(5rem + 3rem)' : '5rem' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">Compare Products</h1>
              <button
                onClick={clearComparison}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
              >
                Clear All
              </button>
            </div>
            <p className="text-gray-600 mt-2">Comparing {items.length} products</p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-lg">
              <thead>
                <tr className="bg-[#0A1628] text-white">
                  <th className="p-4 text-left font-semibold sticky left-0 bg-[#0A1628] z-10">Feature</th>
                  {items.map((item) => (
                    <th key={item._id} className="p-4 min-w-[250px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromComparison(item._id)}
                          className="absolute top-0 right-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-semibold sticky left-0 bg-inherit z-10 border-r">
                      {row.label}
                    </td>
                    {items.map((item) => (
                      <td key={item._id} className="p-4 text-center">
                        {row.key === 'product' && (
                          <div>
                            <Link href={`/product/${item._id}`}>
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                              />
                            </Link>
                            <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                            <div className="flex gap-2 overflow-x-auto">
                              {item.images.slice(1, 4).map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`${item.name} ${i + 2}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {row.key === 'price' && (
                          <div className="text-2xl font-bold text-[#D4AF37]">₹{item.price}</div>
                        )}
                        {row.key === 'rating' && (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-yellow-500 text-xl">★</span>
                            <span className="font-semibold">{item.rating || 'N/A'}</span>
                          </div>
                        )}
                        {row.key === 'category' && (
                          <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#0A1628] rounded-full text-sm font-medium">
                            {item.category}
                          </span>
                        )}
                        {row.key === 'fabric' && (
                          <span className="text-gray-700">{item.fabric || 'Cotton Blend'}</span>
                        )}
                        {row.key === 'sizes' && (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {item.sizes?.map((size) => (
                              <span key={size} className="px-2 py-1 border border-gray-300 rounded text-xs">
                                {size}
                              </span>
                            ))}
                          </div>
                        )}
                        {row.key === 'colors' && (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {item.colors?.map((color, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        )}
                        {row.key === 'stock' && (
                          <span className={`font-semibold ${item.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                          </span>
                        )}
                        {row.key === 'numReviews' && (
                          <span className="text-gray-700">{item.numReviews || 0} reviews</span>
                        )}
                        {row.key === 'shipping' && (
                          <div className="text-sm">
                            <div className="font-semibold text-green-600">Free Shipping</div>
                            <div className="text-gray-500">2-3 business days</div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-white">
                  <td className="p-4 font-semibold sticky left-0 bg-white z-10 border-r">Actions</td>
                  {items.map((item) => (
                    <td key={item._id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full px-4 py-2 bg-[#0A1628] text-white font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all"
                        >
                          Add to Cart
                        </button>
                        <Link href={`/product/${item._id}`}>
                          <button className="w-full px-4 py-2 border-2 border-[#0A1628] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0A1628] hover:text-white transition-all">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
