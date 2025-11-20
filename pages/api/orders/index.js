import connectDB from '../../../lib/mongodb'
import Order from '../../../models/Order'
import User from '../../../models/User'
import { authMiddleware } from '../../../lib/auth'
import { sendOrderConfirmationEmail } from '../../../lib/email'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      const orders = await Order.find({ user: req.userId })
        .populate('orderItems.product')
        .sort({ createdAt: -1 })

      res.status(200).json({ success: true, data: orders })
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

      // Get user details for email
      const user = await User.findById(req.userId)
      
      console.log('📧 Attempting to send email to:', user?.email)
      console.log('📧 Email config check:', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        emailUser: process.env.EMAIL_USER
      })
      
      // Send confirmation email (don't wait for it)
      if (user && user.email) {
        sendOrderConfirmationEmail(order, user.email, user.name)
          .then((result) => {
            if (result.success) {
              console.log('✅ Order confirmation email sent successfully to:', user.email)
              console.log('✅ Message ID:', result.messageId)
            } else {
              console.error('❌ Failed to send email:', result.error)
            }
          })
          .catch((error) => {
            console.error('❌ Email sending error:', error.message)
            console.error('❌ Full error:', error)
          })
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

