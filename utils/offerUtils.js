// Auto-apply best deal logic
export const findBestOffer = (offers, cartItems, cartTotal) => {
  if (!offers || offers.length === 0) return null

  let bestOffer = null
  let maxDiscount = 0

  offers.forEach(offer => {
    const discount = calculateOfferDiscount(offer, cartItems, cartTotal)
    if (discount > maxDiscount) {
      maxDiscount = discount
      bestOffer = { ...offer, calculatedDiscount: discount }
    }
  })

  return bestOffer
}

export const calculateOfferDiscount = (offer, cartItems, cartTotal) => {
  // Check if offer is valid
  const now = new Date()
  if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) {
    return 0
  }

  if (!offer.isActive) return 0
  if (cartTotal < offer.minPurchaseAmount) return 0
  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) return 0

  // Find applicable items
  let applicableItems = []
  if (offer.applyToAll) {
    applicableItems = cartItems
  } else if (offer.applicableProducts?.length > 0) {
    const productIds = offer.applicableProducts.map(p => 
      typeof p === 'string' ? p : p._id?.toString()
    )
    applicableItems = cartItems.filter(item => 
      productIds.includes(item._id?.toString() || item.product?._id?.toString())
    )
  } else if (offer.applicableCategories?.length > 0) {
    applicableItems = cartItems.filter(item => 
      offer.applicableCategories.includes(item.category)
    )
  }

  if (applicableItems.length === 0) return 0

  const applicableTotal = applicableItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  )

  let discount = 0

  switch (offer.type) {
    case 'percentage':
      discount = (applicableTotal * offer.value) / 100
      break
    case 'fixed':
      discount = offer.value
      break
    case 'bogo':
    case 'buy_x_get_y':
      const totalQty = applicableItems.reduce((sum, item) => sum + item.quantity, 0)
      const sets = Math.floor(totalQty / (offer.buyQuantity || 1))
      const freeItems = sets * (offer.getQuantity || 1)
      const avgPrice = applicableTotal / totalQty
      discount = freeItems * avgPrice
      break
    case 'free_shipping':
      discount = 0 // Handled separately
      break
  }

  if (offer.maxDiscount && discount > offer.maxDiscount) {
    discount = offer.maxDiscount
  }

  return Math.round(discount)
}

export const generateCouponCode = (prefix = 'OFFER') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = prefix
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const formatTimeLeft = (endDate) => {
  const now = new Date().getTime()
  const end = new Date(endDate).getTime()
  const distance = end - now

  if (distance < 0) return 'Expired'

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}
