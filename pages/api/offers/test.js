import dbConnect from '../../../lib/mongodb'
import Offer from '../../../models/Offer'

export default async function handler(req, res) {
  try {
    await dbConnect()

    const now = new Date()
    
    // Get ALL offers without any filters
    const allOffers = await Offer.find({}).lean()
    
    // Get offers that are marked as active
    const activeOffers = await Offer.find({ isActive: true }).lean()
    
    // Get offers within date range
    const dateRangeOffers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).lean()
    
    // Get offers that should be active
    const shouldBeActive = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).lean()

    res.status(200).json({
      success: true,
      currentServerTime: now,
      counts: {
        total: allOffers.length,
        markedActive: activeOffers.length,
        inDateRange: dateRangeOffers.length,
        shouldBeActive: shouldBeActive.length
      },
      allOffers: allOffers.map(o => ({
        _id: o._id,
        name: o.name,
        isActive: o.isActive,
        startDate: o.startDate,
        endDate: o.endDate,
        startDateValid: new Date(o.startDate) <= now,
        endDateValid: new Date(o.endDate) >= now,
        shouldShow: o.isActive && new Date(o.startDate) <= now && new Date(o.endDate) >= now
      }))
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: error.stack 
    })
  }
}
