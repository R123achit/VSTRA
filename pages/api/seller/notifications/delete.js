import connectDB from '../../../../lib/mongodb'
import Notification from '../../../../models/Notification'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { notificationId, deleteAll } = req.body

    if (deleteAll) {
      // Delete all read notifications
      const result = await Notification.deleteMany({
        sellerId: req.seller._id,
        read: true,
      })

      res.status(200).json({
        success: true,
        message: `${result.deletedCount} notifications deleted`,
      })
    } else {
      // Delete single notification
      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' })
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        sellerId: req.seller._id,
      })

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' })
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted',
      })
    }
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
