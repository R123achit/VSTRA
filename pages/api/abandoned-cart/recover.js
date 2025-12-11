import connectDB from '../../../lib/mongodb'
import AbandonedCartService from '../../../lib/abandonedCartService'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID required' 
      })
    }

    await AbandonedCartService.markAsRecovered(sessionId)

    res.status(200).json({
      success: true,
      message: 'Cart marked as recovered'
    })
  } catch (error) {
    console.error('Error recovering cart:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to recover cart'
    })
  }
}
