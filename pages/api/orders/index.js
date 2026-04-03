import connectDB from '../../../lib/mongodb'
import Order from '../../../models/Order'
import User from '../../../models/User'
import Product from '../../../models/Product'
import { authMiddleware } from '../../../lib/auth'
import { sendOrderConfirmationEmail } from '../../../lib/email'
import { calculateCommission } from '../../../utils/commission'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      // Find orders by user field
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .lean()

      console.log('📦 Found orders for user:', req.userId, 'Count:', orders.length)
      
      // Transform orders to match frontend expectations
      const transformedOrders = orders.map(order => ({
        _id: order._id,
        orderId: order.orderId || order._id.toString().slice(-8).toUpperCase(),
        createdAt: order.createdAt,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize status
        totalAmount: order.totalPrice,
        items: order.orderItems.map(item => ({
          product: item.product, // Include product ID for returns
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        shippingCost: order.shippingPrice,
        tax: order.taxPrice
      }))
      
      console.log('📦 Transformed orders:', transformedOrders.length)
      
      // Return orders directly (not wrapped in success/data)
      res.status(200).json(transformedOrders)
    } catch (error) {
      console.error('Get orders error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const orderData = {
        ...req.body,
        user: req.userId,
      }

      const order = await Order.create(orderData)

      // Process commissions for seller products
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product)
        
        if (product && product.sellerId) {
          // This is a seller product, calculate commission
          const itemTotal = item.price * item.quantity
          
          try {
            await calculateCommission(
              order._id,
              product.sellerId,
              product._id,
              itemTotal
            )
            console.log(`✅ Commission calculated for seller product: ${product.name}`)
          } catch (error) {
            console.error('❌ Commission calculation error:', error)
          }
        }
      }

      // Get user details for email
      const user = await User.findById(req.userId)
      
      console.log('📧 Attempting to send email to:', user?.email)
      console.log('📧 Email config check:', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        emailUser: process.env.EMAIL_USER
      })
      
      // Send confirmation email immediately and wait for it
      if (user && user.email) {
        try {
          const emailResult = await sendOrderConfirmationEmail(order, user.email, user.name)
          if (emailResult.success) {
            console.log('✅ Order confirmation email sent successfully to:', user.email)
            console.log('✅ Message ID:', emailResult.messageId)
          } else {
            console.error('❌ Failed to send email:', emailResult.error)
          }
        } catch (error) {
          console.error('❌ Email sending error:', error.message)
          console.error('❌ Full error:', error)
          // Don't fail the order if email fails
        }
      } else {
        console.error('❌ No user email found for user ID:', req.userId)
      }

      res.status(201).json({ success: true, data: order })
    } catch (error) {
      console.error('Create order error:', error)
      res.status(400).json({ success: false, message: error.message })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}

export default authMiddleware(handler)

