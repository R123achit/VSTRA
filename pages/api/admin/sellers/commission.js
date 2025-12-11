import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import { adminAuth } from '../../../../middleware/adminAuth'

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { sellerId, commissionRate, applyToAll } = req.body

    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ message: 'Valid commission rate (0-100) is required' })
    }

    if (applyToAll) {
      // Update commission for all sellers
      await Seller.updateMany({}, { commissionRate })

      res.status(200).json({
        success: true,
        message: `Commission rate updated to ${commissionRate}% for all sellers`,
      })
    } else {
      // Update commission for specific seller
      if (!sellerId) {
        return res.status(400).json({ message: 'Seller ID is required' })
      }

      const seller = await Seller.findByIdAndUpdate(
        sellerId,
        { commissionRate },
        { new: true }
      )

      if (!seller) {
        return res.status(404).json({ message: 'Seller not found' })
      }

      res.status(200).json({
        success: true,
        message: `Commission rate updated to ${commissionRate}% for ${seller.businessName}`,
        seller,
      })
    }
  } catch (error) {
    console.error('Update commission error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default adminAuth(handler)
