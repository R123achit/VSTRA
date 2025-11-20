import dbConnect from '../../../lib/mongodb'
import Order from '../../../models/Order'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    // Verify admin token
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'No token provided' })
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    if (req.method === 'GET') {
      const orders = await Order.find()
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price images')
        .sort({ createdAt: -1 })
        .lean()
      
      console.log('Admin orders fetched:', orders.length)
      return res.status(200).json({ success: true, orders })
    }

    if (req.method === 'PUT') {
      const { orderId, status } = req.body
      
      if (!orderId || !status) {
        return res.status(400).json({ message: 'Order ID and status are required' })
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      )
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price images')

      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }

      console.log('Order status updated:', order._id, status)
      return res.status(200).json({ success: true, order })
    }

    if (req.method === 'DELETE') {
      const { orderId } = req.body
      
      if (!orderId) {
        return res.status(400).json({ message: 'Order ID required' })
      }

      await Order.findByIdAndDelete(orderId)
      return res.status(200).json({ message: 'Order deleted successfully' })
    }

    res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Admin orders error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

