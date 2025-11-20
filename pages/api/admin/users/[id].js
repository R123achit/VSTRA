import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'
import { verifyToken } from '../../../../lib/auth'

export default async function handler(req, res) {
  const { id } = req.query

  try {
    // Verify admin token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = verifyToken(req)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    if (req.method === 'PUT') {
      const { role } = req.body

      console.log('Updating user role:', { id, role })

      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' })
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-password')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      console.log('User role updated successfully:', user._id, user.role)
      return res.status(200).json({ success: true, user })
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
