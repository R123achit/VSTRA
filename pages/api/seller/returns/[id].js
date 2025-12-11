import connectDB from '../../../../lib/mongodb'
import Return from '../../../../models/Return'
import Order from '../../../../models/Order'
import Commission from '../../../../models/Commission'
import User from '../../../../models/User'
import { withSellerAuth } from '../../../../middleware/sellerAuth'
import { processReturnRefund } from '../../../../utils/refund'
import { sendReturnApprovedEmail, sendReturnRejectedEmail, sendRefundProcessedEmail } from '../../../../lib/returnEmails'

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  const { id } = req.query
  const { action, message, qualityCheck } = req.body

  try {
    const returnRequest = await Return.findById(id)

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' })
    }

    // Verify return belongs to seller
    if (returnRequest.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Get the order
    const order = await Order.findById(returnRequest.orderId)

    switch (action) {
      case 'approve':
        returnRequest.status = 'approved'
        returnRequest.sellerResponse = {
          message: message || 'Return request approved. Pickup will be scheduled soon.',
          respondedAt: new Date()
        }
        returnRequest.pickupScheduled = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
        break

      case 'reject':
        returnRequest.status = 'rejected'
        returnRequest.sellerResponse = {
          message: message || 'Return request rejected.',
          respondedAt: new Date()
        }
        break

      case 'mark_picked_up':
        returnRequest.status = 'picked_up'
        break

      case 'mark_received':
        returnRequest.status = 'received'
        if (qualityCheck) {
          returnRequest.qualityCheck = {
            ...qualityCheck,
            checkedAt: new Date(),
            checkedBy: req.seller.businessName
          }
        }
        
        // Update order status to 'returned' if quality check passed
        if (order && qualityCheck?.passed !== false) {
          console.log('🔄 Updating order status to returned. Order ID:', order._id)
          console.log('Previous status:', order.status)
          order.status = 'returned'
          await order.save({ validateBeforeSave: false }) // Skip validation in case model isn't reloaded
          console.log('✅ Order status updated to:', order.status)
        } else {
          console.log('❌ Order not updated. Order exists:', !!order, 'Quality passed:', qualityCheck?.passed)
        }
        break

      case 'process_refund':
        if (returnRequest.status !== 'received') {
          return res.status(400).json({ message: 'Item must be received before processing refund' })
        }
        
        // Check quality
        if (returnRequest.qualityCheck && !returnRequest.qualityCheck.passed) {
          return res.status(400).json({ message: 'Quality check failed. Cannot process refund.' })
        }

        // Get commission record
        const commission = await Commission.findOne({
          orderId: returnRequest.orderId,
          productId: returnRequest.productId,
          sellerId: req.seller._id
        })

        console.log('💰 Processing refund for return:', returnRequest._id)
        console.log('Order payment ID:', order.paymentResult?.id)
        console.log('Refund amount:', returnRequest.refundAmount)

        // Process the refund
        try {
          const refundResult = await processReturnRefund(returnRequest, order, commission)
          
          console.log('✅ Refund result:', refundResult)

          returnRequest.status = 'refunded'
          returnRequest.refundedAt = new Date()
          returnRequest.refundTransactionId = refundResult.refundId
          returnRequest.refundMethod = 'original_payment'
          
          // Add refund details
          if (refundResult.requiresManualProcessing) {
            returnRequest.sellerResponse = {
              message: 'Refund initiated. Manual processing required by admin.',
              respondedAt: new Date()
            }
          }
          
          // Ensure order status is 'returned'
          if (order && order.status !== 'returned') {
            order.status = 'returned'
            await order.save({ validateBeforeSave: false })
          }
        } catch (refundError) {
          console.error('❌ Refund processing failed:', refundError)
          return res.status(500).json({ 
            message: 'Failed to process refund', 
            error: refundError.message 
          })
        }
        break

      default:
        return res.status(400).json({ message: 'Invalid action' })
    }

    await returnRequest.save()

    // Send email notification to customer
    const user = await User.findById(returnRequest.userId)
    if (user && user.email) {
      if (action === 'approve') {
        sendReturnApprovedEmail(returnRequest, user.email, user.name)
          .then((result) => {
            if (result.success) {
              console.log('✅ Return approved email sent to customer')
            }
          })
          .catch((error) => {
            console.error('❌ Failed to send return approved email:', error)
          })
      } else if (action === 'reject') {
        sendReturnRejectedEmail(returnRequest, user.email, user.name)
          .then((result) => {
            if (result.success) {
              console.log('✅ Return rejected email sent to customer')
            }
          })
          .catch((error) => {
            console.error('❌ Failed to send return rejected email:', error)
          })
      } else if (action === 'process_refund' && returnRequest.status === 'refunded') {
        sendRefundProcessedEmail(returnRequest, user.email, user.name)
          .then((result) => {
            if (result.success) {
              console.log('✅ Refund processed email sent to customer')
            }
          })
          .catch((error) => {
            console.error('❌ Failed to send refund processed email:', error)
          })
      }
    }

    res.status(200).json({
      success: true,
      message: 'Return request updated successfully',
      return: returnRequest
    })
  } catch (error) {
    console.error('Update return error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
