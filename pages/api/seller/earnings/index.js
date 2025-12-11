import connectDB from '../../../../lib/mongodb'
import Commission from '../../../../models/Commission'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { page = 1, limit = 20, status } = req.query

    const query = { sellerId: req.seller._id }
    
    if (status) {
      query.status = status
    }

    const commissions = await Commission.find(query)
      .populate('orderId', 'orderNumber createdAt')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Commission.countDocuments(query)

    // Calculate totals
    const totals = await Commission.aggregate([
      { $match: { sellerId: req.seller._id } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$orderAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalEarnings: { $sum: '$sellerEarnings' },
          totalDeductions: { 
            $sum: { 
              $add: ['$shippingDeduction', '$returnDeduction', '$penaltyDeduction'] 
            } 
          },
          totalSettlement: { $sum: '$finalSettlement' },
        }
      }
    ])

    const summary = totals[0] || {
      totalSales: 0,
      totalCommission: 0,
      totalEarnings: 0,
      totalDeductions: 0,
      totalSettlement: 0,
    }

    res.status(200).json({
      success: true,
      commissions,
      summary,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    })
  } catch (error) {
    console.error('Get seller earnings error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
