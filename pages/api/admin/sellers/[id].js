import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import Product from '../../../../models/Product'
import { adminAuth } from '../../../../middleware/adminAuth'

async function handler(req, res) {
  await connectDB()

  const { id } = req.query

  const seller = await Seller.findById(id)

  if (!seller) {
    return res.status(404).json({ message: 'Seller not found' })
  }

  if (req.method === 'GET') {
    // Get seller details with products
    try {
      const products = await Product.find({ sellerId: id }).limit(10)

      res.status(200).json({
        success: true,
        seller,
        recentProducts: products,
      })
    } catch (error) {
      console.error('Get seller error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else if (req.method === 'PUT') {
    // Update seller (approve, block, update commission, etc.)
    try {
      const { status, commissionRate, ...otherUpdates } = req.body

      const updates = { ...otherUpdates }

      if (status) {
        if (!['pending', 'approved', 'blocked', 'rejected'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' })
        }
        updates.status = status
      }

      if (commissionRate !== undefined) {
        if (commissionRate < 0 || commissionRate > 100) {
          return res.status(400).json({ message: 'Commission rate must be between 0 and 100' })
        }
        updates.commissionRate = commissionRate
      }

      const updatedSeller = await Seller.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )

      res.status(200).json({
        success: true,
        message: 'Seller updated successfully',
        seller: updatedSeller,
      })
    } catch (error) {
      console.error('Update seller error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else if (req.method === 'DELETE') {
    // Delete seller and their products
    try {
      await Product.deleteMany({ sellerId: id })
      await Seller.findByIdAndDelete(id)

      res.status(200).json({
        success: true,
        message: 'Seller and their products deleted successfully',
      })
    } catch (error) {
      console.error('Delete seller error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default adminAuth(handler)
