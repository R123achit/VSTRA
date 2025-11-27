import dbConnect from '../../../../lib/mongodb'
import Offer from '../../../../models/Offer'
import { verifyToken } from '../../../../lib/auth'
import User from '../../../../models/User'

export default async function handler(req, res) {
  try {
    // Connect to database with error handling
    await dbConnect()
  } catch (dbError) {
    console.error('Database connection failed:', dbError)
    return res.status(503).json({ 
      message: 'Database connection failed. Please try again.',
      error: dbError.message 
    })
  }

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
          console.log('Received offer data:', req.body)
          
          const offerData = {
            ...req.body,
            createdBy: decoded.userId,
          }

          // Validate dates
          if (new Date(offerData.startDate) >= new Date(offerData.endDate)) {
            console.log('Date validation failed')
            return res.status(400).json({ message: 'End date must be after start date' })
          }

          // Generate code if not provided
          if (!offerData.code || offerData.code.trim() === '') {
            offerData.code = `OFFER${Date.now().toString().slice(-6)}`
            console.log('Generated code:', offerData.code)
          }

          // Clean up empty arrays
          if (offerData.applicableProducts && offerData.applicableProducts.length === 0) {
            offerData.applicableProducts = []
          }
          if (offerData.applicableCategories && offerData.applicableCategories.length === 0) {
            offerData.applicableCategories = []
          }

          console.log('Creating offer with data:', offerData)
          const offer = await Offer.create(offerData)
          console.log('Offer created:', offer._id)
          
          await offer.populate('applicableProducts', 'name images price')

          res.status(201).json({ offer, message: 'Offer created successfully' })
        } catch (error) {
          console.error('Error creating offer:', error)
          console.error('Error details:', error.message)
          console.error('Error stack:', error.stack)
          
          if (error.code === 11000) {
            return res.status(400).json({ message: 'Offer code already exists' })
          }
          
          if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message)
            return res.status(400).json({ message: messages.join(', ') })
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
