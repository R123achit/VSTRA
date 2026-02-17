import Razorpay from 'razorpay'
import { authMiddleware } from '../../../lib/auth'

// Initialize Razorpay with proper error handling
let razorpay
try {
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ Razorpay credentials missing!')
    console.error('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Set' : 'Missing')
    console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Missing')
  }
  
  razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  console.log('✅ Razorpay initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error)
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error('❌ Razorpay not initialized')
      return res.status(500).json({ 
        success: false, 
        message: 'Payment system not configured. Please contact support.' 
      })
    }

    const { amount, currency = 'INR' } = req.body

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' })
    }

    console.log('Creating Razorpay order:', { amount, currency })

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    }

    const order = await razorpay.orders.create(options)
    
    console.log('✅ Razorpay order created:', order.id)

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    })
  }
}

export default authMiddleware(handler)
