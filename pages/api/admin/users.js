import dbConnect from '../../../lib/mongodb'
import User from '../../../models/User'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    // Verify admin token
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'No token provided' })
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    if (req.method === 'GET') {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .lean()
      
      return res.status(200).json({ users })
    }

    if (req.method === 'PUT') {
      const { userId, role } = req.body
      
      if (!userId || !role) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password')

      return res.status(200).json({ user })
    }

    if (req.method === 'DELETE') {
      const { userId } = req.body
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID required' })
      }

      await User.findByIdAndDelete(userId)
      return res.status(200).json({ message: 'User deleted successfully' })
    }

    res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Admin users error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

