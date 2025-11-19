import connectDB from '../../../lib/mongodb'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    await connectDB()

    // Check if any admin exists
    const admin = await User.findOne({ role: 'admin' })

    res.status(200).json({
      success: true,
      exists: !!admin,
      data: admin ? {
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt
      } : null
    })
  } catch (error) {
    console.error('Check admin error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
