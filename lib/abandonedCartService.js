import AbandonedCart from '../models/AbandonedCart'
import { sendAbandonedCartEmail } from './emailService'

class AbandonedCartService {
  // Track cart when user adds items
  static async trackCart(sessionId, email, cartItems, userId = null) {
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      // Check if cart already exists for this session
      let cart = await AbandonedCart.findOne({ sessionId, status: { $in: ['active', 'popup-sent'] } })
      
      if (cart) {
        // Update existing cart
        cart.cartItems = cartItems
        cart.totalAmount = totalAmount
        cart.email = email
        cart.updatedAt = new Date()
        await cart.save()
      } else {
        // Create new abandoned cart
        cart = await AbandonedCart.create({
          userId,
          sessionId,
          email,
          cartItems,
          totalAmount,
          status: 'active',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })
      }
      
      return cart
    } catch (error) {
      console.error('Error tracking cart:', error)
      throw error
    }
  }

  // Mark cart as recovered when user completes purchase
  static async markAsRecovered(sessionId) {
    try {
      await AbandonedCart.updateMany(
        { sessionId, status: { $in: ['active', 'popup-sent', 'email-sent'] } },
        { 
          status: 'recovered',
          recoveredAt: new Date()
        }
      )
    } catch (error) {
      console.error('Error marking cart as recovered:', error)
    }
  }

  // Get carts that need popup notification (30 minutes old)
  static async getCartsForPopup() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      
      return await AbandonedCart.find({
        status: 'active',
        createdAt: { $lte: thirtyMinutesAgo },
        popupSentAt: null
      }).populate('cartItems.productId')
    } catch (error) {
      console.error('Error getting carts for popup:', error)
      return []
    }
  }

  // Get carts that need email notification (12 hours old)
  static async getCartsForEmail() {
    try {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
      
      return await AbandonedCart.find({
        status: { $in: ['active', 'popup-sent'] },
        createdAt: { $lte: twelveHoursAgo },
        emailSentAt: null
      }).populate('cartItems.productId')
    } catch (error) {
      console.error('Error getting carts for email:', error)
      return []
    }
  }

  // Mark popup as sent
  static async markPopupSent(cartId) {
    try {
      await AbandonedCart.findByIdAndUpdate(cartId, {
        status: 'popup-sent',
        popupSentAt: new Date()
      })
    } catch (error) {
      console.error('Error marking popup sent:', error)
    }
  }

  // Send email reminder
  static async sendEmailReminder(cartId) {
    try {
      const cart = await AbandonedCart.findById(cartId).populate('cartItems.productId')
      
      if (!cart) {
        console.log('Cart not found:', cartId)
        return false
      }
      
      // Skip if email is a guest/temp email
      if (cart.email.includes('@temp.vstra.com')) {
        console.log('Skipping email for guest user:', cart.email)
        return false
      }
      
      // Send email
      await sendAbandonedCartEmail(cart.email, cart.cartItems, cart.totalAmount)
      
      // Update cart status
      await AbandonedCart.findByIdAndUpdate(cartId, {
        status: 'email-sent',
        emailSentAt: new Date()
      })
      
      console.log('✅ Email sent to:', cart.email)
      return true
    } catch (error) {
      console.error('Error sending email reminder:', error.message)
      return false
    }
  }

  // Clean up expired carts (older than 7 days)
  static async cleanupExpiredCarts() {
    try {
      const result = await AbandonedCart.updateMany(
        {
          expiresAt: { $lte: new Date() },
          status: { $ne: 'expired' }
        },
        { status: 'expired' }
      )
      
      return result.modifiedCount
    } catch (error) {
      console.error('Error cleaning up expired carts:', error)
      return 0
    }
  }

  // Process all pending notifications
  static async processNotifications() {
    try {
      console.log('🔔 Processing abandoned cart notifications...')
      
      let popupsSent = 0
      let emailsSent = 0
      let emailErrors = 0
      
      // Send popup notifications
      try {
        const popupCarts = await this.getCartsForPopup()
        console.log(`Found ${popupCarts.length} carts for popup notification`)
        
        for (const cart of popupCarts) {
          try {
            await this.markPopupSent(cart._id)
            popupsSent++
          } catch (error) {
            console.error(`Error marking popup sent for cart ${cart._id}:`, error.message)
          }
        }
      } catch (error) {
        console.error('Error getting carts for popup:', error.message)
      }
      
      // Send email notifications
      try {
        const emailCarts = await this.getCartsForEmail()
        console.log(`Found ${emailCarts.length} carts for email notification`)
        
        for (const cart of emailCarts) {
          try {
            const sent = await this.sendEmailReminder(cart._id)
            if (sent) {
              emailsSent++
            } else {
              emailErrors++
            }
          } catch (error) {
            console.error(`Error sending email for cart ${cart._id}:`, error.message)
            emailErrors++
          }
        }
      } catch (error) {
        console.error('Error getting carts for email:', error.message)
      }
      
      // Cleanup expired carts
      let cleaned = 0
      try {
        cleaned = await this.cleanupExpiredCarts()
        console.log(`Cleaned up ${cleaned} expired carts`)
      } catch (error) {
        console.error('Error cleaning up carts:', error.message)
      }
      
      console.log('✅ Processing completed')
      
      return {
        popupsSent,
        emailsSent,
        emailErrors,
        cleaned
      }
    } catch (error) {
      console.error('Error processing notifications:', error)
      throw error
    }
  }
}

export default AbandonedCartService
