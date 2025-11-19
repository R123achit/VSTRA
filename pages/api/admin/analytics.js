import dbConnect from '../../../lib/mongodb'
import Order from '../../../models/Order'
import Product from '../../../models/Product'
import User from '../../../models/User'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'No token provided' })
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(10)

    // Get top selling products (mock data for now)
    const topProducts = await Product.find()
      .sort({ numReviews: -1 })
      .limit(5)

    // Calculate revenue by month
    const orders = await Order.find()
    const revenueByMonth = {}
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' })
      revenueByMonth[month] = (revenueByMonth[month] || 0) + order.totalPrice
    })

    res.status(200).json({
      recentOrders,
      lowStockProducts,
      topProducts,
      revenueByMonth
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
