import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto" aria-label="Breadcrumb">
      <Link href="/">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="text-gray-600 hover:text-black transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </motion.span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1 sm:space-x-2">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          {item.href ? (
            <Link href={item.href}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-gray-600 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </Link>
          ) : (
            <span className="text-black font-semibold whitespace-nowrap">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
