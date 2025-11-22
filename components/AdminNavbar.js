import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../store/useStore'

export default function AdminNavbar() {
  const router = useRouter()
  const { user } = useAuthStore()
  const currentPath = router.pathname

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/offers', label: 'Offers', special: true },
    { href: '/admin/users', label: 'Users' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-lg text-black"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/admin/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold tracking-tighter cursor-pointer"
            >
              VSTRA Admin
            </motion.div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12" role="navigation" aria-label="Admin navigation">
            {navItems.map((item) => {
              const isActive = currentPath === item.href
              const isSpecial = item.special

              return (
                <Link key={item.href} href={item.href} className="relative group">
                  <motion.span
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm font-semibold tracking-wider uppercase cursor-pointer inline-block px-3 py-2 transition-all duration-300 ${
                      isSpecial
                        ? 'text-[#D4AF37] hover:text-[#B8941F]'
                        : 'text-black hover:text-gray-600'
                    }`}
                  >
                    {item.label}
                  </motion.span>
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                      isActive
                        ? `w-full ${isSpecial ? 'bg-[#D4AF37]' : 'bg-black'}`
                        : `w-0 ${isSpecial ? 'bg-[#D4AF37]' : 'bg-black'} group-hover:w-full`
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg bg-black text-white hover:bg-gray-800"
              >
                View Site
              </motion.button>
            </Link>
            <Link href="/admin/profile">
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=000&color=fff`}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full border-2 border-transparent hover:border-black/20 transition-all"
                />
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
