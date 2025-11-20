import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'No token provided' })
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    await dbConnect()

    const { productIds } = req.body

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: 'Invalid product IDs' })
    }

    await Product.deleteMany({ _id: { $in: productIds } })

    res.status(200).json({ 
      message: `${productIds.length} products deleted successfully` 
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

