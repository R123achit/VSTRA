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

    // This endpoint is called when popup is shown
    // The actual marking happens in the service
    
    res.status(200).json({
      success: true,
      message: 'Popup tracked'
    })
  } catch (error) {
    console.error('Error tracking popup:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to track popup'
    })
  }
}
