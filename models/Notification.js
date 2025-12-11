import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'new_order',
      'order_cancelled',
      'low_stock',
      'out_of_stock',
      'payment_received',
      'payment_pending',
      'new_review',
      'account_approved',
      'account_blocked',
      'commission_updated',
      'return_request',
      'general'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

// Index for efficient queries
NotificationSchema.index({ sellerId: 1, read: 1, createdAt: -1 })

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
