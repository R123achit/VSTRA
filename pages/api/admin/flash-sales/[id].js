import dbConnect from '../../../../lib/mongodb'
import FlashSale from '../../../../models/FlashSale'
import { verifyToken } from '../../../../lib/auth'
import User from '../../../../models/User'

export default async function handler(req, res) {
  await dbConnect()

  const { method, query } = req
  const { id } = query

  try {
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    switch (method) {
      case 'PUT':
        try {
          const flashSale = await FlashSale.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
          ).populate('products.product', 'name images price category')

          if (!flashSale) {
            return res.status(404).json({ message: 'Flash sale not found' })
          }

          res.status(200).json({ flashSale, message: 'Flash sale updated successfully' })
        } catch (error) {
          res.status(500).json({ message: 'Failed to update flash sale', error: error.message })
        }
        break

      case 'DELETE':
        try {
          const flashSale = await FlashSale.findByIdAndDelete(id)

          if (!flashSale) {
            return res.status(404).json({ message: 'Flash sale not found' })
          }

          res.status(200).json({ message: 'Flash sale deleted successfully' })
        } catch (error) {
          res.status(500).json({ message: 'Failed to delete flash sale', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
