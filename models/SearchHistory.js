import mongoose from 'mongoose'

const SearchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  query: {
    type: String,
    required: true,
    trim: true,
  },
  results: {
    type: Number,
    default: 0,
  },
  clicked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, // 30 days
  },
})

// Index for efficient queries
SearchHistorySchema.index({ user: 1, createdAt: -1 })
SearchHistorySchema.index({ query: 'text' })

export default mongoose.models.SearchHistory || mongoose.model('SearchHistory', SearchHistorySchema)
