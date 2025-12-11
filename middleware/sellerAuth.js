import jwt from 'jsonwebtoken'
import connectDB from '../lib/mongodb'
import Seller from '../models/Seller'

export const sellerAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' })
    }

    await connectDB()
    const seller = await Seller.findById(decoded.id)

    if (!seller) {
      return res.status(401).json({ message: 'Seller not found' })
    }

    if (seller.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked' })
    }

    if (seller.status !== 'approved') {
      return res.status(403).json({ message: 'Your account is pending approval' })
    }

    req.seller = seller
    next()
  } catch (error) {
    console.error('Seller auth error:', error)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Helper function to use in API routes
export const withSellerAuth = (handler) => {
  return async (req, res) => {
    await sellerAuth(req, res, async () => {
      await handler(req, res)
    })
  }
}
