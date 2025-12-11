import connectDB from '../../../../lib/mongodb'
import Order from '../../../../models/Order'
import Product from '../../../../models/Product'
import User from '../../../../models/User'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { page = 1, limit = 20, status } = req.query

    console.log('🔍 Seller ID:', req.seller._id.toString())

    // Get all products by this seller
    const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id name sellerId')
    const productIds = sellerProducts.map(p => p._id)

    console.log('📦 Seller Products:', sellerProducts.length, 'products')
    if (sellerProducts.length > 0) {
      console.log('Sample product:', {
        id: sellerProducts[0]._id.toString(),
        name: sellerProducts[0].name,
        sellerId: sellerProducts[0].sellerId?.toString()
      })
    }

    // Find ALL orders first to debug
    const allOrders = await Order.find({}).populate('orderItems.product', 'name sellerId').lean()
    console.log('📋 Total Orders in DB:', allOrders.length)
    
    // Check which orders have seller's products
    let matchCount = 0
    allOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product) {
          const productSellerIdStr = item.product.sellerId?.toString()
          const currentSellerIdStr = req.seller._id.toString()
          
          console.log(`Order ${order._id} - Product: ${item.product.name}, ProductID: ${item.product._id}, SellerID: ${productSellerIdStr || 'NULL'}`)
          
          if (productSellerIdStr === currentSellerIdStr) {
            matchCount++
            console.log(`✅ MATCH FOUND! Order ${order._id} belongs to this seller`)
          }
        }
      })
    })
    
    console.log(`🎯 Total matches found: ${matchCount}`)

    // Find orders containing seller's products
    const query = {
      'orderItems.product': { $in: productIds }
    }

    if (status && status !== 'all') {
      query.status = status
    }

    console.log('🔎 Query:', JSON.stringify(query))

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    console.log('✅ Found Orders:', orders.length)

    // Filter items to show only seller's products
    const filteredOrders = orders.map(order => {
      const sellerItems = order.orderItems.filter(item => 
        item.product && productIds.some(id => id.equals(item.product._id))
      )
      
      return {
        ...order.toObject(),
        items: sellerItems,
        sellerTotal: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    })

    const count = await Order.countDocuments(query)

    res.status(200).json({
      success: true,
      orders: filteredOrders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    })
  } catch (error) {
    console.error('Get seller orders error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
