import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    // Get seller with password
    const seller = await Seller.findById(req.seller._id).select('+password')

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' })
    }

    // Verify current password
    const isPasswordValid = await seller.comparePassword(currentPassword)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password
    seller.password = newPassword
    await seller.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
