import Commission from '@/models/Commission'
import Seller from '@/models/Seller'

/**
 * Calculate commission for a seller order
 */
export const calculateCommission = async (orderId, sellerId, productId, orderAmount) => {
  try {
    // Get seller's commission rate
    const seller = await Seller.findById(sellerId)
    
    if (!seller) {
      throw new Error('Seller not found')
    }

    const commissionRate = seller.commissionRate || 10
    const commissionAmount = (orderAmount * commissionRate) / 100
    const sellerEarnings = orderAmount - commissionAmount

    // Create commission record
    const commission = await Commission.create({
      orderId,
      sellerId,
      productId,
      orderAmount,
      commissionRate,
      commissionAmount,
      sellerEarnings,
      finalSettlement: sellerEarnings, // Can be adjusted with deductions
      status: 'pending',
    })

    // Update seller statistics
    await Seller.findByIdAndUpdate(sellerId, {
      $inc: {
        totalOrders: 1,
        totalSales: orderAmount,
        totalEarnings: sellerEarnings,
      }
    })

    return commission
  } catch (error) {
    console.error('Calculate commission error:', error)
    throw error
  }
}

/**
 * Process commission deductions (shipping, returns, penalties)
 */
export const applyDeductions = async (commissionId, deductions) => {
  try {
    const commission = await Commission.findById(commissionId)
    
    if (!commission) {
      throw new Error('Commission record not found')
    }

    const { shippingDeduction = 0, returnDeduction = 0, penaltyDeduction = 0 } = deductions

    const totalDeductions = shippingDeduction + returnDeduction + penaltyDeduction
    const finalSettlement = commission.sellerEarnings - totalDeductions

    commission.shippingDeduction = shippingDeduction
    commission.returnDeduction = returnDeduction
    commission.penaltyDeduction = penaltyDeduction
    commission.finalSettlement = finalSettlement

    await commission.save()

    return commission
  } catch (error) {
    console.error('Apply deductions error:', error)
    throw error
  }
}

/**
 * Mark commission as paid
 */
export const settleCommission = async (commissionId, transactionId) => {
  try {
    const commission = await Commission.findByIdAndUpdate(
      commissionId,
      {
        status: 'paid',
        settlementDate: new Date(),
        transactionId,
      },
      { new: true }
    )

    return commission
  } catch (error) {
    console.error('Settle commission error:', error)
    throw error
  }
}

/**
 * Get seller earnings summary
 */
export const getSellerEarningsSummary = async (sellerId) => {
  try {
    const summary = await Commission.aggregate([
      { $match: { sellerId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$orderAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalEarnings: { $sum: '$sellerEarnings' },
          totalDeductions: {
            $sum: {
              $add: ['$shippingDeduction', '$returnDeduction', '$penaltyDeduction']
            }
          },
          pendingSettlement: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$finalSettlement', 0]
            }
          },
          processedSettlement: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processed'] }, '$finalSettlement', 0]
            }
          },
          paidSettlement: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$finalSettlement', 0]
            }
          },
        }
      }
    ])

    return summary[0] || {
      totalOrders: 0,
      totalSales: 0,
      totalCommission: 0,
      totalEarnings: 0,
      totalDeductions: 0,
      pendingSettlement: 0,
      processedSettlement: 0,
      paidSettlement: 0,
    }
  } catch (error) {
    console.error('Get earnings summary error:', error)
    throw error
  }
}
