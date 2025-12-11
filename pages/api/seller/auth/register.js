import connectDB from '../../../../lib/mongodb'
import Seller from '../../../../models/Seller'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const {
      businessName,
      email,
      phone,
      password,
      gstNumber,
      panNumber,
      bankDetails,
      pickupAddress,
    } = req.body

    // Validation
    if (!businessName || !email || !phone || !password || !gstNumber) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }

    if (!bankDetails || !bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
      return res.status(400).json({ message: 'Please provide complete bank details' })
    }

    if (!pickupAddress || !pickupAddress.addressLine1 || !pickupAddress.city || !pickupAddress.state || !pickupAddress.zipCode) {
      return res.status(400).json({ message: 'Please provide complete pickup address' })
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ 
      $or: [{ email }, { gstNumber }] 
    })

    if (existingSeller) {
      return res.status(400).json({ 
        message: existingSeller.email === email 
          ? 'Email already registered' 
          : 'GST number already registered' 
      })
    }

    // Create seller
    const seller = await Seller.create({
      businessName,
      email,
      phone,
      password,
      gstNumber,
      panNumber,
      bankDetails,
      pickupAddress,
      status: 'pending', // Requires admin approval
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: seller._id, role: 'seller' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(201).json({
      success: true,
      message: 'Seller registration successful. Awaiting admin approval.',
      token,
      seller: {
        id: seller._id,
        businessName: seller.businessName,
        email: seller.email,
        status: seller.status,
      },
    })
  } catch (error) {
    console.error('Seller registration error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
