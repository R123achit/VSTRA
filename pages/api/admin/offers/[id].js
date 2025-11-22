import dbConnect from '../../../../lib/mongodb'
import Offer from '../../../../models/Offer'
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
      case 'GET':
        try {
          const offer = await Offer.findById(id)
            .populate('applicableProducts', 'name images price')
            .populate('createdBy', 'name email')

          if (!offer) {
            return res.status(404).json({ message: 'Offer not found' })
          }

          res.status(200).json({ offer })
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch offer', error: error.message })
        }
        break

      case 'PUT':
        try {
          const offer = await Offer.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
          ).populate('applicableProducts', 'name images price')

          if (!offer) {
            return res.status(404).json({ message: 'Offer not found' })
          }

          res.status(200).json({ offer, message: 'Offer updated successfully' })
        } catch (error) {
          res.status(500).json({ message: 'Failed to update offer', error: error.message })
        }
        break

      case 'DELETE':
        try {
          const offer = await Offer.findByIdAndDelete(id)

          if (!offer) {
            return res.status(404).json({ message: 'Offer not found' })
          }

          res.status(200).json({ message: 'Offer deleted successfully' })
        } catch (error) {
          res.status(500).json({ message: 'Failed to delete offer', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
