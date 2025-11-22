import dbConnect from '../../../lib/mongodb'
import FlashSale from '../../../models/FlashSale'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

  try {
    switch (method) {
      case 'GET':
        try {
          const now = new Date()
          
          const flashSales = await FlashSale.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now },
          })
            .populate('products.product', 'name images category')
            .sort({ priority: -1, startTime: -1 })

          res.status(200).json({ flashSales })
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch flash sales', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
