import connectDB from '../../../../lib/mongodb'
import Product from '../../../../models/Product'
import { adminAuth } from '../../../../middleware/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { page = 1, limit = 20, sellerId } = req.query

    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' })
    }

    const products = await Product.find({ sellerId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Product.countDocuments({ sellerId })

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    })
  } catch (error) {
    console.error('Get seller products error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default adminAuth(handler)
