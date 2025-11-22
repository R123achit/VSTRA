import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    const { code, cartTotal, cartItems } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Offer code is required' })
    }

    // Get the Offer model
    const Offer = mongoose.models.Offer || mongoose.model('Offer', new mongoose.Schema({}, { strict: false, collection: 'offers' }))

    // Find the offer by code
    const offer = await Offer.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    }).lean()

    if (!offer) {
      return res.status(404).json({ message: 'Invalid offer code' })
    }

    const now = new Date()
    const startDate = new Date(offer.startDate)
    const endDate = new Date(offer.endDate)

    // Check if offer is within valid date range
    if (startDate > now) {
      return res.status(400).json({ message: 'This offer has not started yet' })
    }

    if (endDate < now) {
      return res.status(400).json({ message: 'This offer has expired' })
    }

    // Check usage limit
    if (offer.usageLimit && offer.usageLimit > 0 && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ message: 'This offer has reached its usage limit' })
    }

    // Check minimum purchase amount
    if (offer.minPurchaseAmount && cartTotal < offer.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase of ₹${offer.minPurchaseAmount} required. Add ₹${offer.minPurchaseAmount - cartTotal} more to use this offer.` 
      })
    }

    // Calculate discount
    let discount = 0
    let discountedItems = []

    switch (offer.type) {
      case 'percentage':
        discount = (cartTotal * offer.value) / 100
        if (offer.maxDiscount && discount > offer.maxDiscount) {
          discount = offer.maxDiscount
        }
        break

      case 'fixed':
        discount = Math.min(offer.value, cartTotal)
        break

      case 'bogo':
      case 'buy_x_get_y':
        // For BOGO offers, calculate based on cart items
        // This is a simplified version - you may need to adjust based on your requirements
        if (cartItems && cartItems.length > 0) {
          const sortedItems = [...cartItems].sort((a, b) => b.price - a.price)
          const buyQty = offer.buyQuantity || 1
          const getQty = offer.getQuantity || 1
          
          if (sortedItems.length >= buyQty) {
            // Give discount on the cheapest items
            const freeItems = sortedItems.slice(buyQty, buyQty + getQty)
            discount = freeItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
            discountedItems = freeItems.map(item => item._id)
          }
        }
        break

      case 'free_shipping':
        // Free shipping doesn't affect cart total directly
        discount = 0
        break

      default:
        discount = 0
    }

    // Return the validated offer with discount details
    res.status(200).json({
      success: true,
      offer: {
        _id: offer._id,
        name: offer.name,
        code: offer.code,
        type: offer.type,
        value: offer.value,
        description: offer.description
      },
      discount: Math.round(discount * 100) / 100,
      discountedItems,
      finalTotal: Math.max(0, cartTotal - discount),
      message: `Offer "${offer.name}" applied successfully! You saved ₹${Math.round(discount)}`
    })

  } catch (error) {
    console.error('Error validating offer:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate offer',
      error: error.message 
    })
  }
}
