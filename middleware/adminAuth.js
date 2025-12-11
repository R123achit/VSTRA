import { verifyToken } from '../lib/auth'

export const adminAuth = (handler) => {
  return async (req, res) => {
    try {
      // Verify admin token
      const decoded = verifyToken(req)
      
      if (!decoded) {
        return res.status(401).json({ message: 'No token provided' })
      }

      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' })
      }

      req.userId = decoded.id
      req.userRole = decoded.role

      return await handler(req, res)
    } catch (error) {
      console.error('Admin auth error:', error)
      return res.status(401).json({ message: 'Invalid token' })
    }
  }
}
