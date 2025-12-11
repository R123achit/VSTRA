import connectDB from '../../../lib/mongodb'
import Return from '../../../models/Return'
import Order from '../../../models/Order'
import Product from '../../../models/Product'
import User from '../../../models/User'
import { authMiddleware } from '../../../lib/auth'
import { sendReturnRequestEmail } from '../../../lib/returnEmails'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    // Get user's return requests
    try {
      const returns = await Return.find({ userId: req.userId })
        .populate('orderId', 'orderNumber createdAt')
        .populate('productId', 'name images')
        .populate('sellerId', 'businessName')
        .sort({ createdAt: -1 })

      res.status(200).json({ success: true, returns })
    } catch (error) {
      console.error('Get returns error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else if (req.method === 'POST') {
    // Create new return request
    try {
      const { orderId, productId, reason, customReason, comments, quantity, pickupAddress } = req.body

      // Verify order belongs to user
      const order = await Order.findById(orderId).populate('orderItems.product')
      
      if (!order || order.user.toString() !== req.userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' })
      }

      // Check if order is delivered
      if (order.status !== 'delivered') {
        return res.status(400).json({ success: false, message: 'Can only return delivered orders' })
      }

      // Find the product in order
      const orderItem = order.orderItems.find(item => item.product._id.toString() === productId)
      
      if (!orderItem) {
        return res.status(404).json({ success: false, message: 'Product not found in order' })
      }

      // Get product details
      const product = await Product.findById(productId)
      
      if (!product.sellerId) {
        return res.status(400).json({ success: false, message: 'Cannot return platform products' })
      }

      // Check if return request already exists for this product in this order
      const existingReturn = await Return.findOne({
        orderId,
        productId,
        userId: req.userId,
        status: { $nin: ['rejected'] } // Allow new request only if previous was rejected
      })

      if (existingReturn) {
        return res.status(400).json({ 
          success: false, 
          message: `You already have a ${existingReturn.status} return request for this item.` 
        })
      }

      // Create return request
      const returnRequest = await Return.create({
        orderId,
        userId: req.userId,
        sellerId: product.sellerId,
        productId,
        reason,
        customReason: reason === 'Other' ? customReason : undefined,
        comments,
        itemName: orderItem.name,
        itemPrice: orderItem.price,
        quantity: quantity || 1,
        pickupAddress: pickupAddress || order.shippingAddress,
        refundAmount: orderItem.price * (quantity || 1),
      })

      // Create notification for seller
      const Notification = require('../../../models/Notification').default
      await Notification.create({
        sellerId: product.sellerId,
        type: 'return_request',
        title: '🔄 New Return Request',
        message: `Customer has requested to return "${orderItem.name}". Reason: ${reason}`,
        link: '/seller/returns',
        data: {
          returnId: returnRequest._id,
          orderId,
          productId,
          reason
        }
      })

      // Send email to customer
      const user = await User.findById(req.userId)
      if (user && user.email) {
        sendReturnRequestEmail(returnRequest, user.email, user.name)
          .then((result) => {
            if (result.success) {
              console.log('✅ Return request email sent to customer')
            }
          })
          .catch((error) => {
            console.error('❌ Failed to send return request email:', error)
          })
      }

      res.status(201).json({ 
        success: true, 
        message: 'Return request submitted successfully',
        return: returnRequest 
      })
    } catch (error) {
      console.error('Create return error:', error)
      res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}

export default authMiddleware(handler)
