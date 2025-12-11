import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Featured from '../components/Featured'
import FlashSaleBanner from '../components/FlashSaleBanner'
import ComparisonBar from '../components/ComparisonBar'
import AutoScrollCarousel from '../components/AutoScrollCarousel'
import PremiumOfferSystem from '../components/PremiumOfferSystem'
import PremiumOffersShowcase from '../components/PremiumOffersShowcase'

// Lazy load heavy components
const Story = dynamic(() => import('../components/Story'), { ssr: false })
const Lookbook = dynamic(() => import('../components/Lookbook'), { ssr: false })
const Footer = dynamic(() => import('../components/Footer'), { ssr: false })
const StyleAssistant = dynamic(() => import('../components/StyleAssistant'), { ssr: false })
const RecentlyViewed = dynamic(() => import('../components/RecentlyViewed'), { ssr: false })
const TrustBadges = dynamic(() => import('../components/TrustBadges'), { ssr: false })
const ScrollToTop = dynamic(() => import('../components/ScrollToTop'), { ssr: false })
const LiveChat = dynamic(() => import('../components/LiveChat'), { ssr: false })
const NewsletterPopup = dynamic(() => import('../components/NewsletterPopup'), { ssr: false })

export default function Home() {
  useEffect(() => {
    // Initialize smooth scrolling with CSS
    document.documentElement.style.scrollBehavior = 'smooth'
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <>
      <Head>
        <title>VSTRA — Redefine Your Style</title>
        <meta name="description" content="Premium clothing crafted for modern elegance" />
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
      
      <main>
        <Hero />
        <TrustBadges />
        <PremiumOffersShowcase />
        <FlashSaleBanner />
        <Categories />
        <Featured />
        <RecentlyViewed />
        <Story />
        <Lookbook />
        <Footer />
      </main>
    </>
  )
}

