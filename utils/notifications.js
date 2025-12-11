import Notification from '../models/Notification'

/**
 * Create a notification for a seller
 */
export const createNotification = async (sellerId, type, title, message, link = null, data = null) => {
  try {
    const notification = await Notification.create({
      sellerId,
      type,
      title,
      message,
      link,
      data,
    })

    console.log(`✅ Notification created for seller ${sellerId}: ${title}`)
    return notification
  } catch (error) {
    console.error('Create notification error:', error)
    throw error
  }
}

/**
 * Notification helpers for common events
 */

export const notifyNewOrder = async (sellerId, orderId, orderTotal) => {
  return createNotification(
    sellerId,
    'new_order',
    '🎉 New Order Received!',
    `You have a new order worth ₹${orderTotal}. Please process it soon.`,
    `/seller/orders`,
    { orderId, orderTotal }
  )
}

export const notifyLowStock = async (sellerId, productId, productName, stock) => {
  return createNotification(
    sellerId,
    'low_stock',
    '⚠️ Low Stock Alert',
    `${productName} is running low on stock (${stock} units left). Please restock soon.`,
    `/seller/products`,
    { productId, productName, stock }
  )
}

export const notifyOutOfStock = async (sellerId, productId, productName) => {
  return createNotification(
    sellerId,
    'out_of_stock',
    '🚫 Out of Stock',
    `${productName} is now out of stock. Please restock to continue selling.`,
    `/seller/products`,
    { productId, productName }
  )
}

export const notifyPaymentReceived = async (sellerId, amount, orderId) => {
  return createNotification(
    sellerId,
    'payment_received',
    '💰 Payment Received',
    `Payment of ₹${amount} has been received and will be settled soon.`,
    `/seller/earnings`,
    { amount, orderId }
  )
}

export const notifyAccountApproved = async (sellerId) => {
  return createNotification(
    sellerId,
    'account_approved',
    '✅ Account Approved!',
    `Congratulations! Your seller account has been approved. You can now start adding products.`,
    `/seller/dashboard`
  )
}

export const notifyAccountBlocked = async (sellerId, reason) => {
  return createNotification(
    sellerId,
    'account_blocked',
    '🚫 Account Blocked',
    `Your account has been blocked. Reason: ${reason}. Please contact support.`,
    null,
    { reason }
  )
}

export const notifyCommissionUpdated = async (sellerId, oldRate, newRate) => {
  return createNotification(
    sellerId,
    'commission_updated',
    '📊 Commission Rate Updated',
    `Your commission rate has been updated from ${oldRate}% to ${newRate}%.`,
    `/seller/earnings`,
    { oldRate, newRate }
  )
}

export const notifyNewReview = async (sellerId, productId, productName, rating) => {
  return createNotification(
    sellerId,
    'new_review',
    '⭐ New Review',
    `${productName} received a ${rating}-star review.`,
    `/seller/products`,
    { productId, productName, rating }
  )
}

export const notifyReturnRequest = async (sellerId, orderId, productName) => {
  return createNotification(
    sellerId,
    'return_request',
    '↩️ Return Request',
    `A return request has been initiated for ${productName}.`,
    `/seller/orders`,
    { orderId, productName }
  )
}
