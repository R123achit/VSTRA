import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['men', 'women', 'new-arrivals', 'accessories'],
  },
  subcategory: {
    type: String,
  },
  images: [{
    type: String,
    required: true,
  }],
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  }],
  colors: [{
    name: String,
    hex: String,
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
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

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
