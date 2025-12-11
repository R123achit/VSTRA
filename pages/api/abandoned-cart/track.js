import connectDB from '../../../lib/mongodb'
import AbandonedCartService from '../../../lib/abandonedCartService'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    console.log('📥 Track cart request received')
    console.log('Body:', req.body)

    await connectDB()
    console.log('✅ Database connected')

    const { sessionId, email, cartItems, userId } = req.body

    if (!sessionId || !email || !cartItems || cartItems.length === 0) {
      console.error('❌ Validation failed:', { sessionId: !!sessionId, email: !!email, cartItems: cartItems?.length })
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        received: { sessionId: !!sessionId, email: !!email, itemCount: cartItems?.length || 0 }
      })
    }

    console.log('📦 Tracking cart:', { sessionId, email, itemCount: cartItems.length })

    const cart = await AbandonedCartService.trackCart(sessionId, email, cartItems, userId)
    console.log('✅ Cart tracked successfully:', cart._id)

    res.status(200).json({
      success: true,
      message: 'Cart tracked successfully',
      cartId: cart._id
    })
  } catch (error) {
    console.error('❌ Error tracking abandoned cart:', error)
    console.error('Error stack:', error.stack)
    
    res.status(200).json({
      success: false,
      message: 'Failed to track cart',
      error: error.message
    })
  }
}
