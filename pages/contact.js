import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'

export default function Contact() {
  const offersBarVisible = useOffersBarVisible()
  const [formatStatus, setFormatStatus] = useState('idle')

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormatStatus('submitting')
    // Simulate form submission
    setTimeout(() => {
      setFormatStatus('submitted')
      e.target.reset()
      setTimeout(() => setFormatStatus('idle'), 5000)
    }, 1500)
  }

  return (
    <>
      <Head>
        <title>Contact Us - VSTRA</title>
      </Head>

      <ActiveOffersBar />
      <Navbar />

      <main 
        className="pb-20 bg-white transition-all duration-300 min-h-screen" 
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] text-gray-400 tracking-wide mb-10">
            <Link href="/"><span className="hover:text-black transition-colors cursor-pointer">Home</span></Link>
            <span className="text-gray-300">/</span>
            <span className="text-black font-medium uppercase tracking-widest text-[11px]">Contact Us</span>
          </nav>

          <div className="text-center mb-16 lg:mb-24">
            <h1 className="text-3xl md:text-5xl font-bold tracking-[0.1em] text-[#000000] uppercase mb-4">Contact Us</h1>
            <p className="text-gray-500 text-sm tracking-[0.15em] uppercase">We're here to help</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 mb-16 max-w-6xl mx-auto">
            
            {/* Contact Information */}
            <div className="flex-1 lg:pt-8">
              <h2 className="text-sm font-bold tracking-[0.2em] text-[#000000] uppercase mb-8 pb-4 border-b-2 border-black">Get in touch</h2>
              
              <div className="space-y-12">
                <div>
                  <h3 className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-3">Customer Service</h3>
                  <p className="text-sm text-black font-medium tracking-wide mb-2 uppercase">support@vstra.com</p>
                  <p className="text-sm text-black font-medium tracking-wide uppercase">1-800-VSTRA-HELP</p>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed tracking-wide">Have a question about your order or need style advice? Our dedicated team is available to assist you.</p>
                </div>
                
                <div>
                  <h3 className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-3">Operational Hours</h3>
                  <p className="text-sm text-black font-medium tracking-wide mb-2 uppercase">Mon - Fri: 9:00 AM - 8:00 PM (EST)</p>
                  <p className="text-sm text-black font-medium tracking-wide uppercase">Sat - Sun: 10:00 AM - 6:00 PM (EST)</p>
                </div>

                <div>
                  <h3 className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-3">Corporate Office</h3>
                  <p className="text-sm text-black font-medium tracking-wide leading-relaxed uppercase">
                    VSTRA Headquarters<br/>
                    123 Fashion Avenue, Suite 400<br/>
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="flex-[1.5] bg-[#ffffff] border border-black p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-black transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
              
              <h2 className="text-sm font-bold tracking-[0.2em] text-[#000000] uppercase mb-10 text-center">Send a message</h2>

              {formatStatus === 'submitted' ? (
                <div className="bg-[#f5f5f5] p-12 text-center border border-[#e5e5e5] h-full flex flex-col justify-center animate-pulse">
                  <span className="text-4xl mb-4 block">✓</span>
                  <p className="text-sm font-bold text-black uppercase tracking-[0.15em] mb-3">Message Received</p>
                  <p className="text-xs text-gray-600 tracking-wide uppercase leading-relaxed">Thank you for reaching out.<br/>A representative will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">First Name *</label>
                      <input required type="text" className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors rounded-none bg-transparent" />
                    </div>
                    <div className="flex flex-col space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">Last Name *</label>
                      <input required type="text" className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors rounded-none bg-transparent" />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">Email Address *</label>
                    <input required type="email" className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors rounded-none bg-transparent" />
                  </div>

                  <div className="flex flex-col space-y-3">
                    <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">Order Number (Optional)</label>
                    <input type="text" className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors rounded-none bg-transparent" />
                  </div>

                  <div className="flex flex-col space-y-3">
                    <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">Message *</label>
                    <textarea required rows={4} className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none rounded-none bg-transparent"></textarea>
                  </div>

                  <button 
                    disabled={formatStatus === 'submitting'}
                    type="submit" 
                    className="w-full bg-[#000000] text-white py-5 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 mt-8 disabled:cursor-not-allowed"
                  >
                    {formatStatus === 'submitting' ? 'Submitting...' : 'Submit Message'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
