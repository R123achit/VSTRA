import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import { adminAuth } from '../../../../middleware/adminAuth'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    // Get all sellers
    try {
      const { page = 1, limit = 20, status, search } = req.query

      const query = {}

      if (status) {
        query.status = status
      }

      if (search) {
        query.$or = [
          { businessName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ]
      }

      const sellers = await Seller.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const count = await Seller.countDocuments(query)

      // Get statistics
      const stats = await Seller.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])

      res.status(200).json({
        success: true,
        sellers,
        stats,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    } catch (error) {
      console.error('Get sellers error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default adminAuth(handler)
