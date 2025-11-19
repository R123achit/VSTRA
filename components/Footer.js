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
              className="text-gray-400 mb-8 tracking-wide"
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
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 bg-white/10 border border-white/20 px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-300 cursor-pointer"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase mb-6">Shop</h4>
            <ul className="space-y-3">
              {['Men', 'Women', 'New Arrivals', 'Accessories', 'Sale'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#categories"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    whileHover={{ x: 5 }}
                    className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase mb-6">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Sustainability', 'Press', 'Contact'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#story"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    whileHover={{ x: 5 }}
                    className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase mb-6">Support</h4>
            <ul className="space-y-3">
              {['FAQ', 'Shipping', 'Returns', 'Size Guide', 'Track Order'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      alert(`${item}\n\nThis would navigate to the ${item.toLowerCase()} page in a complete ecommerce site.`)
                    }}
                    whileHover={{ x: 5 }}
                    className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase mb-6">Follow</h4>
            <ul className="space-y-3">
              {['Instagram', 'Twitter', 'Facebook', 'Pinterest', 'YouTube'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      alert(`Follow us on ${item}!\n\n@VSTRA_Official\n\nThis would open our ${item} profile in a complete site.`)
                    }}
                    whileHover={{ x: 5 }}
                    className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold tracking-tighter cursor-pointer"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            VSTRA
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-500 text-sm"
          >
            © 2024 VSTRA. All rights reserved.
          </motion.p>

          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <motion.a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  alert(`${item} Policy\n\nThis would display the ${item.toLowerCase()} policy page in a complete ecommerce site.`)
                }}
                whileHover={{ y: -2 }}
                className="text-gray-500 hover:text-white transition-colors text-sm cursor-pointer"
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
