import { motion } from 'framer-motion'
import { Tag, Gift, Zap } from 'lucide-react'

export default function ProductOfferBadge({ offer, className = '' }) {
  if (!offer) return null

  const getOfferText = () => {
    switch (offer.type) {
      case 'percentage':
        return `${offer.value}% OFF`
      case 'fixed':
        return `₹${offer.value} OFF`
      case 'bogo':
        return 'BOGO'
      case 'buy_x_get_y':
        return `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`
      case 'free_shipping':
        return 'FREE SHIP'
      default:
        return 'OFFER'
    }
  }

  const getIcon = () => {
    switch (offer.type) {
      case 'bogo':
      case 'buy_x_get_y':
        return <Gift className="w-3 h-3" />
      case 'percentage':
      case 'fixed':
        return <Tag className="w-3 h-3" />
      default:
        return <Zap className="w-3 h-3" />
    }
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={`absolute top-2 right-2 z-10 ${className}`}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
        className="bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-black px-3 py-1.5 rounded-lg shadow-lg font-bold text-xs flex items-center gap-1"
      >
        {getIcon()}
        {getOfferText()}
      </motion.div>
      
      {/* Pulse effect */}
      <motion.div
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
        className="absolute inset-0 bg-[#D4AF37] rounded-lg -z-10"
      />
    </motion.div>
  )
}
