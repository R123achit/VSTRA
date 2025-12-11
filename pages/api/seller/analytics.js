import connectDB from '../../../lib/mongodb'
import Product from '../../../models/Product'
import Order from '../../../models/Order'
import Commission from '../../../models/Commission'
import Notification from '../../../models/Notification'
import { withSellerAuth } from '../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    // Get seller's products
    const products = await Product.find({ sellerId: req.seller._id })
    const productIds = products.map(p => p._id)

    // Total products
    const totalProducts = products.length

    // Total stock
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

    // Out of stock products
    const outOfStock = products.filter(p => p.stock === 0).length

    // Get orders containing seller's products
    const orders = await Order.find({
      'orderItems.product': { $in: productIds }
    })

    const totalOrders = orders.length

    // Calculate order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $match: { 'orderItems.product': { $in: productIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    // Get earnings summary
    const earningsSummary = await Commission.aggregate([
      { $match: { sellerId: req.seller._id } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$orderAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalEarnings: { $sum: '$sellerEarnings' },
          pendingSettlement: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$finalSettlement', 0]
            }
          },
          paidSettlement: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$finalSettlement', 0]
            }
          }
        }
      }
    ])

    const earnings = earningsSummary[0] || {
      totalSales: 0,
      totalCommission: 0,
      totalEarnings: 0,
      pendingSettlement: 0,
      paidSettlement: 0,
    }

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.product': { $in: productIds } } },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ])

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentOrders = await Order.countDocuments({
      'orderItems.product': { $in: productIds },
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentRevenue = await Commission.aggregate([
      {
        $match: {
          sellerId: req.seller._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$orderAmount' }
        }
      }
    ])

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      sellerId: req.seller._id,
      read: false
    })

    res.status(200).json({
      success: true,
      analytics: {
        products: {
          total: totalProducts,
          totalStock,
          outOfStock,
        },
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus,
          last30Days: recentOrders,
        },
        earnings: {
          ...earnings,
          last30DaysRevenue: recentRevenue[0]?.revenue || 0,
        },
        topProducts,
        seller: {
          rating: req.seller.rating,
          numReviews: req.seller.numReviews,
          commissionRate: req.seller.commissionRate,
        },
        unreadNotifications
      }
    })
  } catch (error) {
    console.error('Get seller analytics error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
