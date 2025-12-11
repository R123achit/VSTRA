import connectDB from '../../../lib/mongodb'
import AbandonedCart from '../../../models/AbandonedCart'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    // Get counts
    const total = await AbandonedCart.countDocuments()
    const active = await AbandonedCart.countDocuments({ status: 'active' })
    const popupSent = await AbandonedCart.countDocuments({ status: 'popup-sent' })
    const emailSent = await AbandonedCart.countDocuments({ status: 'email-sent' })
    const recovered = await AbandonedCart.countDocuments({ status: 'recovered' })

    // Get recent carts
    const recentCarts = await AbandonedCart.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email totalAmount status createdAt')

    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        popupSent,
        emailSent,
        recovered
      },
      recentCarts
    })
  } catch (error) {
    console.error('Error testing abandoned cart:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message
    })
  }
}
