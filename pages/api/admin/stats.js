import dbConnect from '../../../lib/mongodb'
import User from '../../../models/User'
import Product from '../../../models/Product'
import Order from '../../../models/Order'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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

    // Get stats
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    
    // Calculate total revenue (only from paid orders)
    const orders = await Order.find({ 
      isPaid: true,
      status: { $ne: 'cancelled' } 
    })
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

    console.log('Stats calculated:', {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue)
    })

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

