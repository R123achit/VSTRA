import Razorpay from 'razorpay'

// Initialize Razorpay only if credentials are available
let razorpay = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

/**
 * Process refund through payment gateway
 */
export const processPaymentRefund = async (paymentId, amount, reason = 'Return request approved') => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      console.log('⚠️ Razorpay not configured, creating manual refund record')
      return {
        success: true,
        refundId: `MANUAL-REF-${Date.now()}`,
        amount: amount,
        status: 'pending_manual',
        requiresManualProcessing: true,
        message: 'Razorpay not configured. Manual processing required.'
      }
    }

    if (!paymentId) {
      throw new Error('Payment ID is required for refund')
    }

    // Process refund through Razorpay
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
      speed: 'normal', // 'normal' or 'optimum'
      notes: {
        reason: reason,
        processed_at: new Date().toISOString()
      }
    })

    console.log('✅ Razorpay refund processed:', refund)

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      paymentId: refund.payment_id,
      createdAt: refund.created_at
    }
  } catch (error) {
    console.error('❌ Razorpay refund error:', error)
    
    // If Razorpay fails, create a manual refund record
    return {
      success: true,
      error: error.message,
      refundId: `MANUAL-REF-${Date.now()}`,
      amount: amount,
      status: 'pending_manual',
      requiresManualProcessing: true
    }
  }
}

/**
 * Process refund for a return request
 */
export const processReturnRefund = async (returnRequest, order, commission) => {
  try {
    const refundAmount = returnRequest.refundAmount
    
    // 1. Process payment gateway refund
    let paymentRefund = null
    if (order.paymentResult?.id) {
      paymentRefund = await processPaymentRefund(
        order.paymentResult.id,
        refundAmount,
        `Return: ${returnRequest.reason}`
      )
    }

    // 2. Update commission record (reverse the commission)
    if (commission) {
      commission.status = 'refunded'
      commission.refundedAt = new Date()
      commission.refundAmount = refundAmount
      await commission.save({ validateBeforeSave: false }) // Skip validation in case model isn't reloaded
      
      console.log('✅ Commission reversed for return')
    }

    // 3. Update seller statistics (deduct from earnings)
    const Seller = require('../models/Seller').default
    await Seller.findByIdAndUpdate(returnRequest.sellerId, {
      $inc: {
        totalSales: -refundAmount,
        totalEarnings: -(refundAmount - (commission?.commissionAmount || 0))
      }
    })

    console.log('✅ Seller statistics updated')

    // 4. Restore product stock
    const Product = require('../models/Product').default
    await Product.findByIdAndUpdate(returnRequest.productId, {
      $inc: { stock: returnRequest.quantity }
    })

    console.log('✅ Product stock restored')

    // 5. Create refund notification for customer
    const Notification = require('../models/Notification').default
    const User = require('../models/User').default
    
    // Note: This would need a user notification system
    // For now, we'll just log it
    console.log('✅ Customer notification would be sent here')

    return {
      success: true,
      refundId: paymentRefund?.refundId || `REF-${Date.now()}`,
      amount: refundAmount,
      status: paymentRefund?.status || 'processed',
      requiresManualProcessing: paymentRefund?.requiresManualProcessing || false,
      message: paymentRefund?.requiresManualProcessing 
        ? 'Refund initiated. Manual processing required.'
        : 'Refund processed successfully'
    }
  } catch (error) {
    console.error('❌ Process refund error:', error)
    throw error
  }
}

/**
 * Calculate refund amount based on return policy
 */
export const calculateRefundAmount = (orderItem, returnRequest, daysFromDelivery) => {
  let refundAmount = orderItem.price * returnRequest.quantity
  
  // Apply deductions based on return policy
  if (daysFromDelivery > 30) {
    // No refund after 30 days
    return 0
  } else if (daysFromDelivery > 14) {
    // 20% restocking fee after 14 days
    refundAmount = refundAmount * 0.8
  }
  
  // Deduct shipping if customer is at fault
  const customerFaultReasons = ['Changed my mind', 'Found better price elsewhere', 'Ordered by mistake']
  if (customerFaultReasons.includes(returnRequest.reason)) {
    refundAmount = refundAmount - 50 // Deduct ₹50 shipping
  }
  
  return Math.max(0, refundAmount)
}

/**
 * Get refund status from payment gateway
 */
export const getRefundStatus = async (refundId) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay not configured'
      }
    }

    const refund = await razorpay.refunds.fetch(refundId)
    
    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
      paymentId: refund.payment_id
    }
  } catch (error) {
    console.error('Get refund status error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Process bulk refunds (for admin)
 */
export const processBulkRefunds = async (returnRequests) => {
  const results = {
    successful: [],
    failed: [],
    total: returnRequests.length
  }
  
  for (const returnRequest of returnRequests) {
    try {
      const Order = require('../models/Order').default
      const Commission = require('../models/Commission').default
      
      const order = await Order.findById(returnRequest.orderId)
      const commission = await Commission.findOne({
        orderId: returnRequest.orderId,
        productId: returnRequest.productId
      })
      
      const result = await processReturnRefund(returnRequest, order, commission)
      
      if (result.success) {
        results.successful.push({
          returnId: returnRequest._id,
          refundId: result.refundId,
          amount: result.amount
        })
      } else {
        results.failed.push({
          returnId: returnRequest._id,
          error: result.error
        })
      }
    } catch (error) {
      results.failed.push({
        returnId: returnRequest._id,
        error: error.message
      })
    }
  }
  
  return results
}
