import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const SellerSchema = new mongoose.Schema({
  // Business Information
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  
  // Legal & Tax Information
  gstNumber: {
    type: String,
    required: [true, 'Please provide GST number'],
    unique: true,
  },
  panNumber: {
    type: String,
  },
  
  // Bank Details
  bankDetails: {
    accountHolderName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    bankName: String,
    branch: String,
  },
  
  // Pickup Address
  pickupAddress: {
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'India',
    },
  },
  
  // Status & Verification
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked', 'rejected'],
    default: 'pending',
  },
  verificationDocuments: [{
    type: String,
    url: String,
  }],
  
  // Commission
  commissionRate: {
    type: Number,
    default: 10, // 10% default commission
    min: 0,
    max: 100,
  },
  
  // Statistics
  totalProducts: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  
  // Rating
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  
  // Store Information
  storeName: String,
  storeDescription: String,
  storeLogo: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
})

// Hash password before saving
SellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password
SellerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.models.Seller || mongoose.model('Seller', SellerSchema)
