import { motion } from 'framer-motion'

export default function OfferBadge({ offer, className = '' }) {
  if (!offer) return null

  const getBadgeText = () => {
    switch (offer.type) {
      case 'percentage':
        return `${offer.value}% OFF`
      case 'fixed':
        return `₹${offer.value} OFF`
      case 'bogo':
        return 'BUY 1 GET 1'
      case 'buy_x_get_y':
        return `BUY ${offer.buyQuantity} GET ${offer.getQuantity}`
      case 'free_shipping':
        return 'FREE SHIPPING'
      default:
        return 'OFFER'
    }
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`absolute top-2 left-2 z-10 ${className}`}
    >
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
        {getBadgeText()}
      </div>
    </motion.div>
  )
}
