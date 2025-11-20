import crypto from 'crypto'
import { authMiddleware } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment verification parameters' 
      })
    }

    // Create signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed' 
    })
  }
}

export default authMiddleware(handler)
