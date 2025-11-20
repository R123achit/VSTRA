import Razorpay from 'razorpay'
import { authMiddleware } from '../../../lib/auth'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { amount, currency = 'INR' } = req.body

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' })
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    }

    const order = await razorpay.orders.create(options)

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create payment order' 
    })
  }
}

export default authMiddleware(handler)
