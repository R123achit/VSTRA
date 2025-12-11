import connectDB from '../../../../lib/mongodb'
import Return from '../../../../models/Return'
import User from '../../../../models/User'
import Product from '../../../../models/Product'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { status } = req.query

    const query = { sellerId: req.seller._id }
    
    if (status && status !== 'all') {
      query.status = status
    }

    const returns = await Return.find(query)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber createdAt')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })

    // Calculate stats
    const stats = {
      total: returns.length,
      pending: returns.filter(r => r.status === 'pending').length,
      approved: returns.filter(r => r.status === 'approved').length,
      rejected: returns.filter(r => r.status === 'rejected').length,
      completed: returns.filter(r => r.status === 'refunded').length,
    }

    res.status(200).json({
      success: true,
      returns,
      stats
    })
  } catch (error) {
    console.error('Get seller returns error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
