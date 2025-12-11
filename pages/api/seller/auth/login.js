import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    // Find seller with password
    const seller = await Seller.findOne({ email }).select('+password')

    if (!seller) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if seller is blocked
    if (seller.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked. Contact admin.' })
    }

    // Check if seller is rejected
    if (seller.status === 'rejected') {
      return res.status(403).json({ message: 'Your registration was rejected. Contact admin.' })
    }

    // Verify password
    const isPasswordValid = await seller.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Update last login
    seller.lastLogin = new Date()
    await seller.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: seller._id, role: 'seller' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(200).json({
      success: true,
      token,
      seller: {
        id: seller._id,
        businessName: seller.businessName,
        email: seller.email,
        status: seller.status,
        storeName: seller.storeName,
        rating: seller.rating,
        totalProducts: seller.totalProducts,
        totalOrders: seller.totalOrders,
      },
    })
  } catch (error) {
    console.error('Seller login error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
