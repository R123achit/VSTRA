import dbConnect from '../../../../lib/mongodb'
import Order from '../../../../models/Order'
import { verifyToken } from '../../../../lib/auth'
import { sendOrderStatusEmail } from '../../../../lib/email'

export default async function handler(req, res) {
  const { id } = req.query

  try {
    // Verify admin token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = verifyToken(req)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    if (req.method === 'PUT') {
      const { status } = req.body

      console.log('Updating order status:', { id, status })

      if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' })
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('user', 'name email')

      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }

      console.log('Order status updated successfully:', order._id, order.status)

      // Send status update email (don't wait for it)
      if (order.user && order.user.email) {
        sendOrderStatusEmail(order, order.user.email, order.user.name, status)
          .then((result) => {
            if (result.success) {
              console.log('✅ Status update email sent to:', order.user.email)
            }
          })
          .catch((error) => {
            console.error('❌ Email error:', error)
          })
      }

      return res.status(200).json({ success: true, order })
    }

    if (req.method === 'DELETE') {
      const order = await Order.findByIdAndDelete(id)

      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }

      return res.status(200).json({ message: 'Order deleted' })
    }

    res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Admin order error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
