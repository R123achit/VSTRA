import connectDB from '../../../../lib/mongodb'
import Notification from '../../../../models/Notification'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 20, unreadOnly } = req.query

      const query = { sellerId: req.seller._id }
      
      if (unreadOnly === 'true') {
        query.read = false
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const count = await Notification.countDocuments(query)
      const unreadCount = await Notification.countDocuments({ 
        sellerId: req.seller._id, 
        read: false 
      })

      res.status(200).json({
        success: true,
        notifications,
        unreadCount,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    } catch (error) {
      console.error('Get notifications error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withSellerAuth(handler)
