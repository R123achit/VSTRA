import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import { adminAuth } from '../../../../middleware/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { sellerId, approved } = req.body

    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' })
    }

    const seller = await Seller.findById(sellerId)

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' })
    }

    seller.status = approved ? 'approved' : 'rejected'
    await seller.save()

    res.status(200).json({
      success: true,
      message: `Seller ${approved ? 'approved' : 'rejected'} successfully`,
      seller,
    })
  } catch (error) {
    console.error('Approve seller error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default adminAuth(handler)
