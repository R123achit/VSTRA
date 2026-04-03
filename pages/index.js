import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Featured from '../components/Featured'
import ComparisonBar from '../components/ComparisonBar'
import PremiumOfferSystem from '../components/PremiumOfferSystem'

// Lazy load heavy components
const Footer = dynamic(() => import('../components/Footer'), { ssr: false })
const StyleAssistant = dynamic(() => import('../components/StyleAssistant'), { ssr: false })
const RecentlyViewed = dynamic(() => import('../components/RecentlyViewed'), { ssr: false })
const ScrollToTop = dynamic(() => import('../components/ScrollToTop'), { ssr: false })
const LiveChat = dynamic(() => import('../components/LiveChat'), { ssr: false })
const NewsletterPopup = dynamic(() => import('../components/NewsletterPopup'), { ssr: false })

export default function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <>
      <Head>
        <title>VSTRA — Redefine Your Style</title>
        <meta name="description" content="Premium clothing crafted for modern elegance. Shop curated collections for men, women, and kids." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="top-center" />
      <PremiumOfferSystem />
      <NewsletterPopup />
      <Navbar />
      <StyleAssistant />
      <ComparisonBar />
      <LiveChat />
      <ScrollToTop />

      <main className="bg-white">
        <Hero />
        <Featured />
        <Categories />
        <RecentlyViewed />
        <Footer />
      </main>
    </>
  )
}
