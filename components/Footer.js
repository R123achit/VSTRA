import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Newsletter Section */}
      <div className="bg-[#252525] py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">SIGN UP FOR VSTRA UPDATES</h3>
              <p className="text-sm text-gray-400">Be the first to know about our new arrivals, exclusive offers and more</p>
            </div>
            
            <form
              className="flex w-full md:w-auto gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const email = e.target.email.value
                if (email) {
                  alert(`Thank you for subscribing!\n\nEmail: ${email}\n\nYou'll receive exclusive offers and latest collections.`)
                  e.target.reset()
                }
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="flex-1 md:w-80 bg-white text-black px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase">Customer Service</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Contact Us', href: '#', onClick: () => alert('Contact Us\n\nEmail: support@vstra.com\nPhone: 1800-XXX-XXXX') },
                { label: 'Track Order', href: '/orders' },
                { label: 'Return Order', href: '/returns' },
                { label: 'Cancel Order', href: '/orders' },
                { label: 'FAQ', href: '#', onClick: () => alert('FAQ\n\nThis would navigate to the FAQ page.') }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault()
                        item.onClick()
                      }
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase">About</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '#story', scroll: true },
                { label: 'Careers', href: '#', onClick: () => alert('Careers\n\nJoin our team! This would navigate to careers page.') },
                { label: 'Store Locator', href: '#', onClick: () => alert('Store Locator\n\nFind VSTRA stores near you.') },
                { label: 'Sustainability', href: '#', onClick: () => alert('Sustainability\n\nOur commitment to sustainable fashion.') }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault()
                        item.onClick()
                      } else if (item.scroll) {
                        e.preventDefault()
                        document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase">Shop</h4>
            <ul className="space-y-2.5">
              {['Men', 'Women', 'Kids', 'Accessories', 'Sale'].map((item) => (
                <li key={item}>
                  <a
                    href="#categories"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase">Policies</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms & Conditions', href: '#' },
                { label: 'Shipping Policy', href: '#' },
                { label: 'Return Policy', href: '/returns' }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.href === '#') {
                        e.preventDefault()
                        alert(`${item.label}\n\nThis would display the ${item.label.toLowerCase()} page.`)
                      }
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase">Connect With Us</h4>
            
            {/* Social Media */}
            <div className="flex gap-3 mb-6">
              {[
                { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { name: 'Instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 6.5h11v11h-11z' },
                { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { name: 'YouTube', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z' }
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    alert(`Follow us on ${social.name}!\n\n@VSTRA_Official`)
                  }}
                  className="w-9 h-9 bg-[#2a2a2a] hover:bg-white hover:text-black rounded-full flex items-center justify-center transition-all cursor-pointer"
                  aria-label={social.name}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>

            {/* App Download */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-2">DOWNLOAD THE APP</p>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Download on App Store\n\nThis would redirect to the iOS app.')
                  }}
                  className="bg-[#2a2a2a] hover:bg-[#333] px-3 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">Download on the</div>
                    <div className="text-xs font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Get it on Google Play\n\nThis would redirect to the Android app.')
                  }}
                  className="bg-[#2a2a2a] hover:bg-[#333] px-3 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">GET IT ON</div>
                    <div className="text-xs font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>


        {/* Payment & Security */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-400 mb-3">WE ACCEPT</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {['Visa', 'Mastercard', 'Amex', 'UPI', 'Paytm', 'Net Banking'].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400 mb-3">100% SECURE PAYMENTS</p>
              <div className="flex items-center gap-2 justify-center md:justify-end">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs text-gray-400">SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                VSTRA
              </span>
              <span className="hidden md:inline">|</span>
              <span>© 2024 VSTRA. All Rights Reserved.</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy\n\nThis would display the privacy policy.') }} className="hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </a>
              <span>|</span>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service\n\nThis would display the terms of service.') }} className="hover:text-white transition-colors cursor-pointer">
                Terms of Service
              </a>
              <span>|</span>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Sitemap\n\nThis would display the sitemap.') }} className="hover:text-white transition-colors cursor-pointer">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
