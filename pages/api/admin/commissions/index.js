import connectDB from '../../../../lib/mongodb'
import Commission from '../../../../models/Commission'
import { adminAuth } from '../../../../middleware/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { page = 1, limit = 20, status, sellerId } = req.query

    const query = {}

    if (status) {
      query.status = status
    }

    if (sellerId) {
      query.sellerId = sellerId
    }

    const commissions = await Commission.find(query)
      .populate('sellerId', 'businessName email')
      .populate('orderId', 'orderNumber createdAt')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Commission.countDocuments(query)

    // Get platform earnings summary
    const platformSummary = await Commission.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$orderAmount' },
          totalCommissionEarned: { $sum: '$commissionAmount' },
          totalSellerPayouts: { $sum: '$finalSettlement' },
          pendingPayouts: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'processed']] },
                '$finalSettlement',
                0
              ]
            }
          },
        }
      }
    ])

    res.status(200).json({
      success: true,
      commissions,
      platformSummary: platformSummary[0] || {
        totalOrders: 0,
        totalSales: 0,
        totalCommissionEarned: 0,
        totalSellerPayouts: 0,
        pendingPayouts: 0,
      },
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    })
  } catch (error) {
    console.error('Get commissions error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default adminAuth(handler)
