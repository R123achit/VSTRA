import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'
import { verifyToken } from '../../../../lib/auth'

export default async function handler(req, res) {
  const { id } = req.query

  try {
    // Verify admin token
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    if (req.method === 'PUT') {
      const { role } = req.body

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-password')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      return res.status(200).json({ user })
    }

    if (req.method === 'DELETE') {
      const user = await User.findByIdAndDelete(id)

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      return res.status(200).json({ message: 'User deleted' })
    }

    res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Admin user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
