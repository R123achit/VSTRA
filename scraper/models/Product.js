const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    default: 'VSTRA'
  },
  category: {
    type: String,
    required: true
  },
  
  // Pricing
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  gst: {
    type: Number,
    default: 12
  },
  
  // Product Details
  color: {
    type: String,
    default: ''
  },
  colors: [{
    type: String
  }],
  material: {
    type: String,
    default: ''
  },
  idealFor: {
    type: String,
    default: 'Men'
  },
  sizes: [{
    type: String
  }],
  pattern: {
    type: String,
    default: ''
  },
  fit: {
    type: String,
    default: 'Regular Fit'
  },
  neckType: {
    type: String,
    default: ''
  },
  sleeveType: {
    type: String,
    default: ''
  },
  occasion: {
    type: String,
    default: 'Casual'
  },
  fabricCare: {
    type: String,
    default: 'Machine wash'
  },
  description: {
    type: String,
    default: ''
  },
  
  // Images
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  
  // Inventory
  hsnCode: {
    type: String,
    default: ''
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  
  // Shipping
  weight: {
    type: String,
    default: ''
  },
  dimensions: {
    type: String,
    default: ''
  },
  
  // Legal & Compliance
  countryOfOrigin: {
    type: String,
    default: 'India'
  },
  manufacturer: {
    type: String,
    default: 'VSTRA Clothing Co.'
  },
  packer: {
    type: String,
    default: 'VSTRA Clothing Co.'
  },
  importer: {
    type: String,
    default: 'N/A'
  },
  
  // Customer Service
  customerCare: {
    email: {
      type: String,
      default: 'support@vstra.com'
    },
    phone: {
      type: String,
      default: '9876543210'
    }
  },
  returnPolicy: {
    type: String,
    default: '7 Days Replacement'
  },
  warranty: {
    type: String,
    default: 'No Warranty'
  },
  
  // Reviews & Ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Legacy fields (for compatibility)
  price: {
    type: Number,
    default: function() { return this.sellingPrice; }
  },
  originalPrice: {
    type: Number,
    default: function() { return this.mrp; }
  },
  productId: {
    type: String,
    default: function() { return this.sku; }
  },
  source: {
    type: String,
    default: 'vstra'
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  lastScraped: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
productSchema.index({ category: 1, sellingPrice: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ sku: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.mrp && this.sellingPrice) {
    return Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);
