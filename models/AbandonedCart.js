import mongoose from 'mongoose'

const AbandonedCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for guest users
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  cartItems: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    image: String,
    quantity: Number,
    size: String,
    color: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'popup-sent', 'email-sent', 'recovered', 'expired'],
    default: 'active'
  },
  popupSentAt: {
    type: Date
  },
  emailSentAt: {
    type: Date
  },
  recoveredAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Index for efficient queries
AbandonedCartSchema.index({ status: 1, createdAt: 1 })
AbandonedCartSchema.index({ status: 1, popupSentAt: 1 })
AbandonedCartSchema.index({ status: 1, emailSentAt: 1 })

// Update timestamp on save
AbandonedCartSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.models.AbandonedCart || mongoose.model('AbandonedCart', AbandonedCartSchema)
