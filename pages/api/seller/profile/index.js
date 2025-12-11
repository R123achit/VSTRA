import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    // Get seller profile
    try {
      const seller = await Seller.findById(req.seller._id).select('-password')

      res.status(200).json({
        success: true,
        seller,
      })
    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else if (req.method === 'PUT') {
    // Update seller profile
    try {
      const {
        businessName,
        phone,
        panNumber,
        bankDetails,
        pickupAddress,
        storeName,
        storeDescription,
        storeLogo,
      } = req.body

      const updateData = {}

      if (businessName) updateData.businessName = businessName
      if (phone) updateData.phone = phone
      if (panNumber) updateData.panNumber = panNumber
      if (bankDetails) updateData.bankDetails = bankDetails
      if (pickupAddress) updateData.pickupAddress = pickupAddress
      if (storeName) updateData.storeName = storeName
      if (storeDescription) updateData.storeDescription = storeDescription
      if (storeLogo) updateData.storeLogo = storeLogo

      const seller = await Seller.findByIdAndUpdate(
        req.seller._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password')

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        seller,
      })
    } catch (error) {
      console.error('Update profile error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withSellerAuth(handler)
