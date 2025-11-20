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

    // Get all orders
    const orders = await Order.find().populate('user', 'name email')
    
    // Calculate total revenue (only from paid orders)
    const totalRevenue = orders
      .filter(order => order.isPaid)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0)

    // Total orders
    const totalOrders = orders.length

    // Total products
    const totalProducts = await Product.countDocuments()

    // Total users
    const totalUsers = await User.countDocuments()

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(10)

    // Get top rated products
    const topProducts = await Product.find({ rating: { $gt: 0 } })
      .sort({ rating: -1, numReviews: -1 })
      .limit(6)

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const revenueOrders = await Order.find({ 
      createdAt: { $gte: sixMonthsAgo },
      isPaid: true 
    })

    const revenueByMonth = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    revenueOrders.forEach(order => {
      const date = new Date(order.createdAt)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.totalPrice
    })

    const revenueData = Object.keys(revenueByMonth).map(month => ({
      month,
      revenue: Math.round(revenueByMonth[month])
    }))

    // Orders by status
    const ordersByStatus = [
      { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
      { name: 'Processing', value: orders.filter(o => o.status === 'processing').length },
      { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length },
      { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
      { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
    ].filter(item => item.value > 0)

    // Top categories
    const products = await Product.find()
    const categoryCount = {}
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
    })

    const topCategories = Object.keys(categoryCount).map(category => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: categoryCount[category]
    }))

    // Stock health summary
    const stockSummary = {
      outOfStock: products.filter(p => p.stock === 0).length,
      critical: products.filter(p => p.stock > 0 && p.stock < 3).length,
      low: products.filter(p => p.stock >= 3 && p.stock < 10).length,
      healthy: products.filter(p => p.stock >= 10).length
    }

    res.status(200).json({
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      topProducts,
      revenueData,
      ordersByStatus,
      topCategories,
      stockSummary
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
