import dbConnect from '../../../lib/mongodb'
import Wishlist from '../../../models/Wishlist'
import { verifyToken } from '../../../lib/auth'
import crypto from 'crypto'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

  try {
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    switch (method) {
      case 'POST':
        try {
          let wishlist = await Wishlist.findOne({ user: decoded.userId })

          if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' })
          }

          if (!wishlist.shareToken) {
            wishlist.shareToken = crypto.randomBytes(16).toString('hex')
            wishlist.isPublic = true
            await wishlist.save()
          }

          const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/wishlist/shared/${wishlist.shareToken}`

          res.status(200).json({ shareUrl, shareToken: wishlist.shareToken })
        } catch (error) {
          res.status(500).json({ message: 'Failed to generate share link', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
