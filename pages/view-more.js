import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PremiumOfferSystem from '../components/PremiumOfferSystem'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const roundedCategories = [
  { name: 'Ethnic', img: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Ethnic' },
  { name: 'Loungewear', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Loungewear' },
  { name: 'Curvy Woman', img: 'https://images.unsplash.com/photo-1549429402-1270bb383e20?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Curvy%20Woman' },
  { name: "Men's Footwear", img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Mens%20Footwear' },
  { name: "Women's Footwear", img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Womens%20Footwear' },
  { name: 'Kids', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Kids' },
  { name: 'Home', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Home' },
  { name: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=400', link: '/shop?category=Beauty' },
]

const westernWearBanners = [
  { name: 'Dresses', img: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Womens%20Western' },
  { name: 'Tops', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Womens%20Western' },
  { name: 'Denim', img: 'https://images.unsplash.com/photo-1528659555193-ee0d170624bb?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Womens%20Western' },
]

const ethnicWearBanners = [
  { name: 'Kurtas', img: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Womens%20Ethnic' },
  { name: 'Ethnic Sets', img: 'https://images.unsplash.com/photo-1610030469983-98e550e6155c?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Womens%20Ethnic' },
  { name: 'Sarees', img: 'https://images.unsplash.com/photo-1615886753866-79396abc446e?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Womens%20Ethnic' },
]

const mensWearBanners = [
  { name: 'Casual Shirts', img: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Men' },
  { name: 'T-Shirts', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Men' },
  { name: 'Footwear', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Mens%20Footwear' },
]

const kidsWearBanners = [
  { name: 'Girls', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Kids' },
  { name: 'Boys', img: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Kids' },
  { name: 'Infants', img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Kids' },
]

export default function ViewMore() {
  const [offersBarVisible, setOffersBarVisible] = useState(true)

  useEffect(() => {
    const handleOffersBarVisibility = (e) => setOffersBarVisible(e.detail.visible)
    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    return () => window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
  }, [])

  return (
    <>
      <Head>
        <title>View More Categories — VSTRA</title>
        <meta name="description" content="Explore more collections and categories on VSTRA." />
      </Head>

      <PremiumOfferSystem />
      <Navbar />

      <main
        className="bg-white min-h-screen transition-all duration-300"
        style={{ paddingTop: offersBarVisible ? '8rem' : '5rem' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
          
          {/* Top Circular Categories Filter Carousel */}
          <div className="relative group mb-20 group/carousel">
            <div className="flex gap-4 md:gap-8 xl:gap-[52px] overflow-x-auto scrollbar-hide snap-x snap-mandatory pt-4 pb-8" style={{ scrollbarWidth: 'none' }}>
              {roundedCategories.map((cat, idx) => (
                <Link key={idx} href={cat.link}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="flex flex-col items-center gap-4 cursor-pointer flex-shrink-0 snap-center"
                    style={{ width: '130px' }}
                  >
                    <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-50 flex items-center justify-center p-2 border border-gray-100 shadow-sm">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-[13.5px] text-gray-800 text-center font-normal tracking-wide leading-tight px-2">
                      {cat.name}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
            
            {/* Right arrow matching the specific subtle design */}
            <div className="absolute top-[40%] right-0 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-400 cursor-pointer hidden md:flex">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Women's Western Wear Section */}
          <div className="mb-20">
            <h2 className="text-[18px] text-gray-900 font-medium tracking-wide mb-8">
              Women's Western Wear
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {westernWearBanners.map((banner, idx) => (
                <Link key={idx} href={banner.link}>
                  <div className="aspect-[4/3] w-full bg-gray-50 overflow-hidden cursor-pointer group relative">
                    <img
                      src={banner.img}
                      alt={banner.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Women's Ethnic Wear Section */}
          <div className="mb-20">
            <h2 className="text-[18px] text-gray-900 font-medium tracking-wide mb-8">
              Women's Ethnic Wear
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ethnicWearBanners.map((banner, idx) => (
                <Link key={idx} href={banner.link}>
                  <div className="aspect-[4/3] w-full bg-gray-50 overflow-hidden cursor-pointer group relative">
                    <img
                      src={banner.img}
                      alt={banner.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Men's Wear Section */}
          <div className="mb-20">
            <h2 className="text-[18px] text-gray-900 font-medium tracking-wide mb-8">
              Men's Wear
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mensWearBanners.map((banner, idx) => (
                <Link key={idx} href={banner.link}>
                  <div className="aspect-[4/3] w-full bg-gray-50 overflow-hidden cursor-pointer group relative">
                    <img
                      src={banner.img}
                      alt={banner.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Kids Wear Section */}
          <div className="mb-20">
            <h2 className="text-[18px] text-gray-900 font-medium tracking-wide mb-8">
              Kids Wear
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kidsWearBanners.map((banner, idx) => (
                <Link key={idx} href={banner.link}>
                  <div className="aspect-[4/3] w-full bg-gray-50 overflow-hidden cursor-pointer group relative">
                    <img
                      src={banner.img}
                      alt={banner.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}
