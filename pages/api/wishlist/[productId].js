import dbConnect from '../../../lib/mongodb'
import Wishlist from '../../../models/Wishlist'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  await dbConnect()

  const { method, query } = req
  const { productId } = query

  try {
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    switch (method) {
      case 'DELETE':
        try {
          const wishlist = await Wishlist.findOne({ user: decoded.userId })

          if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' })
          }

          wishlist.items = wishlist.items.filter(
            (item) => item.product.toString() !== productId
          )

          await wishlist.save()
          await wishlist.populate('items.product')

          res.status(200).json({ wishlist })
        } catch (error) {
          res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
