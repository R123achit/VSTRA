import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    const now = new Date()
    
    // Get the Offer model
    const Offer = mongoose.models.Offer || mongoose.model('Offer', new mongoose.Schema({}, { strict: false, collection: 'offers' }))
    
    // Get all offers to debug
    const allOffers = await Offer.find({}).lean()
    console.log('Total offers in DB:', allOffers.length)
    
    // Get all active offers first
    const allActiveOffers = await Offer.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .lean()

    console.log('Found active offers:', allActiveOffers.length)
    
    // Filter by date range and usage limit in JavaScript for better control
    const offers = allActiveOffers.filter(offer => {
      const startDate = new Date(offer.startDate)
      const endDate = new Date(offer.endDate)
      
      // Check date range
      const isInDateRange = startDate <= now && endDate >= now
      
      // Check usage limit - treat null, undefined, 0, or negative as unlimited
      const hasUsageAvailable = !offer.usageLimit || offer.usageLimit <= 0 || offer.usedCount < offer.usageLimit
      
      return isInDateRange && hasUsageAvailable
    }).slice(0, 10)

    console.log('Final offers count:', offers.length)
    res.status(200).json({ success: true, offers, debug: { totalInDB: allOffers.length, activeCount: allActiveOffers.length } })
  } catch (error) {
    console.error('Error fetching active offers:', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
