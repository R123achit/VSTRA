import connectDB from '../../../lib/mongodb'
import Order from '../../../models/Order'
import { authMiddleware } from '../../../lib/auth'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      const orders = await Order.find({ user: req.userId })
        .populate('orderItems.product')
        .sort({ createdAt: -1 })

      res.status(200).json({ success: true, data: orders })
    } catch (error) {
      console.error('Get orders error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const orderData = {
        ...req.body,
        user: req.userId,
      }

      const order = await Order.create(orderData)

      res.status(201).json({ success: true, data: order })
    } catch (error) {
      console.error('Create order error:', error)
      res.status(400).json({ success: false, message: error.message })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}

export default authMiddleware(handler)
