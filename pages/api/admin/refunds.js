import connectDB from '../../../lib/mongodb'
import Return from '../../../models/Return'
import Order from '../../../models/Order'
import Commission from '../../../models/Commission'
import { adminAuth } from '../../../middleware/adminAuth'
import { processReturnRefund, getRefundStatus } from '../../../utils/refund'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    // Get all refunds with optional filters
    try {
      const { status, requiresManual } = req.query

      const query = { status: { $in: ['refunded', 'received'] } }
      
      if (status) {
        query.status = status
      }

      const returns = await Return.find(query)
        .populate('userId', 'name email')
        .populate('sellerId', 'businessName')
        .populate('orderId', 'orderNumber paymentResult')
        .populate('productId', 'name images')
        .sort({ refundedAt: -1 })

      // Filter for manual processing if requested
      let filteredReturns = returns
      if (requiresManual === 'true') {
        filteredReturns = returns.filter(ret => 
          ret.refundTransactionId?.startsWith('MANUAL-REF-')
        )
      }

      // Calculate totals
      const totalRefunded = returns.reduce((sum, ret) => sum + (ret.refundAmount || 0), 0)
      const pendingManual = returns.filter(ret => 
        ret.refundTransactionId?.startsWith('MANUAL-REF-')
      ).length

      res.status(200).json({
        success: true,
        returns: filteredReturns,
        stats: {
          total: returns.length,
          totalRefunded,
          pendingManual
        }
      })
    } catch (error) {
      console.error('Get refunds error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else if (req.method === 'POST') {
    // Manually process a refund
    try {
      const { returnId, refundTransactionId, notes } = req.body

      const returnRequest = await Return.findById(returnId)
      
      if (!returnRequest) {
        return res.status(404).json({ message: 'Return request not found' })
      }

      // Update with manual refund details
      returnRequest.refundTransactionId = refundTransactionId
      returnRequest.sellerResponse = {
        message: notes || 'Refund processed manually by admin',
        respondedAt: new Date()
      }
      
      await returnRequest.save()

      res.status(200).json({
        success: true,
        message: 'Manual refund recorded successfully',
        return: returnRequest
      })
    } catch (error) {
      console.error('Manual refund error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else if (req.method === 'PUT') {
    // Check refund status from payment gateway
    try {
      const { refundId } = req.body

      const status = await getRefundStatus(refundId)

      res.status(200).json({
        success: true,
        status
      })
    } catch (error) {
      console.error('Check refund status error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default adminAuth(handler)
