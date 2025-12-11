import connectDB from '../../../../lib/mongodb'
import Order from '../../../../models/Order'
import Product from '../../../../models/Product'
import User from '../../../../models/User'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  await connectDB()

  const { id } = req.query

  // Verify order contains seller's products
  const order = await Order.findById(id).populate('orderItems.product')

  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id')
  const productIds = sellerProducts.map(p => p._id.toString())

  const hasSellerProduct = order.orderItems.some(item => 
    item.product && productIds.includes(item.product._id.toString())
  )

  if (!hasSellerProduct) {
    return res.status(403).json({ message: 'Unauthorized access to this order' })
  }

  if (req.method === 'GET') {
    // Get order details
    res.status(200).json({ success: true, order })
  } else if (req.method === 'PUT') {
    // Update order status (for seller's items only)
    try {
      const { status, trackingId } = req.body

      const allowedStatuses = ['processing', 'shipped', 'delivered']
      
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' })
      }

      order.status = status
      
      if (trackingId) {
        order.trackingId = trackingId
      }

      await order.save()

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        order,
      })
    } catch (error) {
      console.error('Update order error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withSellerAuth(handler)
