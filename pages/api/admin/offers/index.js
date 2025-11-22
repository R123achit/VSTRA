import dbConnect from '../../../../lib/mongodb'
import Offer from '../../../../models/Offer'
import { verifyToken } from '../../../../lib/auth'
import User from '../../../../models/User'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

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
          const { active, search } = req.query
          let query = {}

          if (active === 'true') {
            query.isActive = true
            query.startDate = { $lte: new Date() }
            query.endDate = { $gte: new Date() }
          }

          if (search) {
            query.$or = [
              { name: { $regex: search, $options: 'i' } },
              { code: { $regex: search, $options: 'i' } },
            ]
          }

          const offers = await Offer.find(query)
            .populate('applicableProducts', 'name images price')
            .sort({ priority: -1, createdAt: -1 })
            .lean()

          console.log('Fetched offers:', offers.length)
          res.status(200).json({ offers })
        } catch (error) {
          console.error('Error fetching offers:', error)
          res.status(500).json({ message: 'Failed to fetch offers', error: error.message })
        }
        break

      case 'POST':
        try {
          const offerData = {
            ...req.body,
            createdBy: decoded.userId,
          }

          // Validate dates
          if (new Date(offerData.startDate) >= new Date(offerData.endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' })
          }

          // Generate code if not provided
          if (!offerData.code && offerData.type !== 'bogo') {
            offerData.code = `OFFER${Date.now().toString().slice(-6)}`
          }

          const offer = await Offer.create(offerData)
          await offer.populate('applicableProducts', 'name images price')

          res.status(201).json({ offer, message: 'Offer created successfully' })
        } catch (error) {
          if (error.code === 11000) {
            return res.status(400).json({ message: 'Offer code already exists' })
          }
          res.status(500).json({ message: 'Failed to create offer', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
