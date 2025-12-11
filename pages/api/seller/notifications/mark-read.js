import connectDB from '../../../../lib/mongodb'
import Notification from '../../../../models/Notification'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { notificationId, markAll } = req.body

    if (markAll) {
      // Mark all notifications as read
      await Notification.updateMany(
        { sellerId: req.seller._id, read: false },
        { read: true }
      )

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      })
    } else {
      // Mark single notification as read
      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' })
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, sellerId: req.seller._id },
        { read: true },
        { new: true }
      )

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' })
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        notification,
      })
    }
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
