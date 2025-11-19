import dbConnect from '../../../../lib/mongodb'
import Order from '../../../../models/Order'
import { verifyToken } from '../../../../lib/auth'

export default async function handler(req, res) {
  const { id } = req.query

  try {
    // Verify admin token
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    if (req.method === 'PUT') {
      const { status } = req.body

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      )

      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }

      return res.status(200).json({ order })
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
