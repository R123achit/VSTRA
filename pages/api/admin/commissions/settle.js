import connectDB from '../../../../lib/mongodb'
import Commission from '../../../../models/Commission'
import { adminAuth } from '../../../../middleware/adminAuth'
import { settleCommission } from '../../../../utils/commission'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { commissionId, transactionId, bulkSettle } = req.body

    if (bulkSettle) {
      // Settle all pending/processed commissions for a seller
      const { sellerId } = req.body

      if (!sellerId) {
        return res.status(400).json({ message: 'Seller ID is required for bulk settlement' })
      }

      const commissions = await Commission.find({
        sellerId,
        status: { $in: ['pending', 'processed'] }
      })

      const settled = []

      for (const commission of commissions) {
        const settledCommission = await settleCommission(
          commission._id,
          transactionId || `BULK_${Date.now()}`
        )
        settled.push(settledCommission)
      }

      res.status(200).json({
        success: true,
        message: `${settled.length} commissions settled successfully`,
        settled,
      })
    } else {
      // Settle single commission
      if (!commissionId) {
        return res.status(400).json({ message: 'Commission ID is required' })
      }

      const commission = await settleCommission(commissionId, transactionId)

      res.status(200).json({
        success: true,
        message: 'Commission settled successfully',
        commission,
      })
    }
  } catch (error) {
    console.error('Settle commission error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default adminAuth(handler)
