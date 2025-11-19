import dbConnect from '../../../lib/mongodb'
import Order from '../../../models/Order'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
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

    if (req.method === 'GET') {
      const orders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
      
      return res.status(200).json({ orders })
    }

    res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Admin orders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
