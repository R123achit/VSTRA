import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  comment: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  notHelpful: {
    type: Number,
    default: 0,
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vote: {
      type: String,
      enum: ['helpful', 'notHelpful'],
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for efficient queries
ReviewSchema.index({ product: 1, createdAt: -1 })
ReviewSchema.index({ user: 1 })

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)
