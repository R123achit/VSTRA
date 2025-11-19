import dbConnect from '../../../../lib/mongodb'
import Wishlist from '../../../../models/Wishlist'

export default async function handler(req, res) {
  await dbConnect()

  const { method, query } = req
  const { token } = query

  try {
    switch (method) {
      case 'GET':
        try {
          const wishlist = await Wishlist.findOne({
            shareToken: token,
            isPublic: true,
          }).populate('items.product')

          if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' })
          }

          res.status(200).json({ wishlist })
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
