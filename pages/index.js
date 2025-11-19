import { useEffect } from 'react'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Featured from '../components/Featured'
import Story from '../components/Story'
import Lookbook from '../components/Lookbook'
import Footer from '../components/Footer'

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
      <Navbar />
      
      <main>
        <Hero />
        <Categories />
        <Featured />
        <Story />
        <Lookbook />
        <Footer />
      </main>
    </>
  )
}
