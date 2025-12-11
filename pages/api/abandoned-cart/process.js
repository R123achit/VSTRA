import connectDB from '../../../lib/mongodb'
import AbandonedCartService from '../../../lib/abandonedCartService'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    // Process all pending notifications
    const result = await AbandonedCartService.processNotifications()

    res.status(200).json({
      success: true,
      message: 'Notifications processed',
      result
    })
  } catch (error) {
    console.error('❌ Error processing notifications:', error)
    console.error('Error stack:', error.stack)
    
    // Return success with error details instead of 500
    res.status(200).json({
      success: false,
      message: 'Processing completed with errors',
      error: error.message,
      result: {
        popupsSent: 0,
        emailsSent: 0,
        emailErrors: 1,
        cleaned: 0
      }
    })
  }
}
