import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'
import Order from '../../../models/Order'
import User from '../../../models/User'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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

    // Fetch all stats
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.find()
    ])

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)

    res.status(200).json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue.toFixed(2)
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
