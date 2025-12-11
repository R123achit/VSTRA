import mongoose from 'mongoose'

const CommissionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
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
  
  // Financial Details
  orderAmount: {
    type: Number,
    required: true,
  },
  commissionRate: {
    type: Number,
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true,
  },
  sellerEarnings: {
    type: Number,
    required: true,
  },
  
  // Deductions
  shippingDeduction: {
    type: Number,
    default: 0,
  },
  returnDeduction: {
    type: Number,
    default: 0,
  },
  penaltyDeduction: {
    type: Number,
    default: 0,
  },
  
  // Final Settlement
  finalSettlement: {
    type: Number,
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid', 'cancelled', 'refunded'],
    default: 'pending',
  },
  
  // Refund Details (if refunded)
  refundedAt: Date,
  refundAmount: Number,
  
  // Settlement Details
  settlementDate: Date,
  transactionId: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Commission || mongoose.model('Commission', CommissionSchema)
