import dbConnect from '../../../../lib/mongodb'
import FlashSale from '../../../../models/FlashSale'
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
          const flashSales = await FlashSale.find()
            .populate('products.product', 'name images price category')
            .populate('createdBy', 'name email')
            .sort({ startTime: -1 })

          res.status(200).json({ flashSales })
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch flash sales', error: error.message })
        }
        break

      case 'POST':
        try {
          const flashSaleData = {
            ...req.body,
            createdBy: decoded.userId,
          }

          if (new Date(flashSaleData.startTime) >= new Date(flashSaleData.endTime)) {
            return res.status(400).json({ message: 'End time must be after start time' })
          }

          const flashSale = await FlashSale.create(flashSaleData)
          await flashSale.populate('products.product', 'name images price category')

          res.status(201).json({ flashSale, message: 'Flash sale created successfully' })
        } catch (error) {
          res.status(500).json({ message: 'Failed to create flash sale', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
