import mongoose from 'mongoose'

const WalletTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  paymentId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [WalletTransactionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt timestamp before saving
WalletSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Method to add money to wallet
WalletSchema.methods.addMoney = function(amount, description, paymentId) {
  this.balance += amount
  this.transactions.push({
    type: 'credit',
    amount,
    description,
    paymentId,
    status: 'completed'
  })
  return this.save()
}

// Method to deduct money from wallet
WalletSchema.methods.deductMoney = function(amount, description, orderId) {
  if (this.balance < amount) {
    throw new Error('Insufficient wallet balance')
  }
  this.balance -= amount
  this.transactions.push({
    type: 'debit',
    amount,
    description,
    orderId,
    status: 'completed'
  })
  return this.save()
}

// Method to check if user has sufficient balance
WalletSchema.methods.hasSufficientBalance = function(amount) {
  return this.balance >= amount
}

export default mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema)
