import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  // Seller Information
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    default: null, // null means platform-owned product
  },
  
  // Basic Information
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  brand: {
    type: String,
    default: 'VSTRA'
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  
  // Category
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['men', 'women', 'new-arrivals', 'accessories', 'kids'],
  },
  subcategory: {
    type: String,
  },
  
  // Images
  images: [{
    type: String,
    required: true,
  }],
  
  // Variants
  sizes: [{
    type: String,
  }],
  colors: [{
    name: String,
    hex: String,
  }],
  
  // Inventory
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Product Details (Optional - for realistic ecommerce)
  material: String,
  pattern: String,
  fit: String,
  neckType: String,
  sleeveType: String,
  occasion: String,
  fabricCare: String,
  idealFor: String,
  
  // Shipping (Optional)
  weight: String,
  dimensions: String,
  
  // Legal & Compliance (Optional)
  hsnCode: String,
  countryOfOrigin: {
    type: String,
    default: 'India'
  },
  manufacturer: String,
  
  // Customer Service (Optional)
  returnPolicy: {
    type: String,
    default: '7 Days Replacement'
  },
  warranty: String,
  
  // Display
  featured: {
    type: Boolean,
    default: false,
  },
  
  // Reviews & Ratings
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
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String,
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create compound index to prevent duplicate products
ProductSchema.index({ name: 1, category: 1 }, { unique: true })

// Add text index for search
ProductSchema.index({ name: 'text', description: 'text' })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
