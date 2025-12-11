import mongoose from 'mongoose'

const OfferSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'bogo', 'buy_x_get_y', 'free_shipping'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  // For Buy X Get Y offers
  buyQuantity: {
    type: Number,
    default: 1,
  },
  getQuantity: {
    type: Number,
    default: 1,
  },
  // Applicable products
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableCategories: [{
    type: String,
  }],
  // If empty, applies to all products
  applyToAll: {
    type: Boolean,
    default: false,
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null,
  },
  code: {
    type: String,
    sparse: true,
    uppercase: true,
  },
  usageLimit: {
    type: Number,
    default: null,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

// Create unique sparse index for code (allows null/undefined but enforces uniqueness when present)
OfferSchema.index({ code: 1 }, { unique: true, sparse: true })
OfferSchema.index({ isActive: 1, startDate: 1, endDate: 1 })

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema)
