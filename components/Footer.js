import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-black text-white py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="border-b border-gray-800 pb-16 mb-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold tracking-tighter mb-4"
            >
              Stay Updated
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#A0A0A0] mb-8 tracking-wide"
            >
              Subscribe to receive exclusive offers and latest collections
            </motion.p>
            
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault()
                const email = e.target.email.value
                if (email) {
                  alert(`Thank you for subscribing!\n\nEmail: ${email}\n\nYou'll receive exclusive offers and latest collections.`)
                  e.target.reset()
                }
              }}
            >
              <motion.input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                whileFocus={{ scale: 1.02 }}
                className="flex-1 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/20 hover:border-white/40 transition-all duration-300"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black px-8 py-4 text-sm font-semibold tracking-widest uppercase rounded-full transition-all duration-300 cursor-pointer hover:shadow-lg"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </div>
        </div>

        {/* Footer Links - FIXED: Increased contrast for better readability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-16">
          {/* Shop Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h4 className="text-base font-bold tracking-wider uppercase text-[#A0A0A0]">Shop</h4>
            </div>
            <ul className="space-y-3.5">
              {['Men', 'Women', 'New Arrivals', 'Accessories', 'Sale'].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <motion.a
                    href="#categories"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    whileHover={{ x: 5, color: '#ffffff' }}
                    className="text-[#CCCCCC] hover:text-white transition-all duration-300 text-sm cursor-pointer inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
                    {item}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h4 className="text-base font-bold tracking-wider uppercase text-[#A0A0A0]">Company</h4>
            </div>
            <ul className="space-y-3.5">
              {['About Us', 'Careers', 'Sustainability', 'Press', 'Contact'].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <motion.a
                    href="#story"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    whileHover={{ x: 5, color: '#ffffff' }}
                    className="text-[#CCCCCC] hover:text-white transition-all duration-300 text-sm cursor-pointer inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
                    {item}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h4 className="text-base font-bold tracking-wider uppercase text-[#A0A0A0]">Support</h4>
            </div>
            <ul className="space-y-3.5">
              {[
                { label: 'FAQ', href: '#', onClick: () => alert('FAQ\n\nThis would navigate to the FAQ page.') },
                { label: 'Shipping', href: '#', onClick: () => alert('Shipping\n\nThis would navigate to the shipping page.') },
                { label: 'Returns & Exchanges', href: '/returns' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Size Guide', href: '#', onClick: () => alert('Size Guide\n\nThis would navigate to the size guide page.') }
              ].map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <motion.a
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault()
                        item.onClick()
                      }
                    }}
                    whileHover={{ x: 5, color: '#ffffff' }}
                    className="text-[#CCCCCC] hover:text-white transition-all duration-300 text-sm cursor-pointer inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
                    {item.label}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Follow Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <h4 className="text-base font-bold tracking-wider uppercase text-[#A0A0A0]">Follow Us</h4>
            </div>
            <ul className="space-y-3.5">
              {[
                { name: 'Instagram' },
                { name: 'Twitter' },
                { name: 'Facebook' },
                { name: 'Pinterest' },
                { name: 'YouTube' }
              ].map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <motion.a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      alert(`Follow us on ${item.name}!\n\n@VSTRA_Official\n\nThis would open our ${item.name} profile in a complete site.`)
                    }}
                    whileHover={{ x: 5, color: '#ffffff' }}
                    className="text-[#CCCCCC] hover:text-white transition-all duration-300 text-sm cursor-pointer inline-flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    {item.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-2xl md:text-3xl font-bold tracking-tighter cursor-pointer"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              VSTRA
            </motion.div>

            {/* Copyright */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-500 text-sm text-center order-last md:order-none"
            >
              © 2024 VSTRA. All rights reserved.
            </motion.p>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    alert(`${item} Policy\n\nThis would display the ${item.toLowerCase()} policy page in a complete ecommerce site.`)
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2, color: '#ffffff' }}
                  className="text-gray-500 hover:text-white transition-all duration-300 text-sm cursor-pointer font-medium"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 pt-6 border-t border-gray-800/50"
          >
            <p className="text-gray-500 text-xs text-center mb-4">Accepted Payment Methods</p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {['Visa', 'Mastercard', 'UPI', 'Net Banking', 'Razorpay'].map((method, index) => (
                <motion.span
                  key={method}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="px-3 py-1.5 bg-white/5 rounded-lg text-[#CCCCCC] text-xs font-medium"
                >
                  {method}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
