import mongoose from 'mongoose'

const ReturnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  
  // Return Details
  reason: {
    type: String,
    required: true,
    enum: [
      'Size too small',
      'Size too large',
      'Different from description',
      'Quality not as expected',
      'Wrong item received',
      'Damaged or defective',
      'Changed my mind',
      'Found better price elsewhere',
      'Ordered by mistake',
      'Other'
    ]
  },
  customReason: String,
  comments: String,
  
  // Item Details
  itemName: String,
  itemPrice: Number,
  quantity: {
    type: Number,
    default: 1
  },
  
  // Images (for damaged/defective items)
  images: [String],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'picked_up', 'received', 'refunded'],
    default: 'pending'
  },
  
  // Seller Response
  sellerResponse: {
    message: String,
    respondedAt: Date,
  },
  
  // Pickup Details
  pickupScheduled: Date,
  pickupAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
  },
  
  // Refund Details
  refundAmount: Number,
  refundMethod: {
    type: String,
    enum: ['original_payment', 'store_credit', 'bank_transfer'],
    default: 'original_payment'
  },
  refundedAt: Date,
  refundTransactionId: String,
  
  // Quality Check (when item is received back)
  qualityCheck: {
    passed: Boolean,
    notes: String,
    checkedAt: Date,
    checkedBy: String,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
})

// Update the updatedAt timestamp before saving
ReturnSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.models.Return || mongoose.model('Return', ReturnSchema)
