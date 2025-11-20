import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const generateToken = (userId, role = 'user') => {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: '30d',
  })
}

export const verifyToken = (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const authMiddleware = (handler) => async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      console.error('Auth middleware: No authorization header')
      return res.status(401).json({ success: false, message: 'No token provided' })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    if (!token) {
      console.error('Auth middleware: Token is empty after Bearer removal')
      return res.status(401).json({ success: false, message: 'No token provided' })
    }
    
    console.log('Auth middleware: Verifying token:', token.substring(0, 20) + '...')
    
    const decoded = jwt.verify(token, JWT_SECRET)
    
    if (!decoded || !decoded.userId) {
      console.error('Auth middleware: Token decoded but no userId found')
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }
    
    console.log('Auth middleware: Token verified for user:', decoded.userId)
    req.userId = decoded.userId
    req.userRole = decoded.role
    return handler(req, res)
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token format' })
    }
    return res.status(401).json({ success: false, message: 'Authentication failed' })
  }
}
