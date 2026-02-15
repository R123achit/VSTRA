const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/vstra-ecommerce');
  
  // Raw query - direct collection 
  const rawFeatured = await mongoose.connection.db.collection('products').countDocuments({ featured: true });
  console.log('RAW DB featured=true:', rawFeatured);
  
  // Check what types featured has
  const sample = await mongoose.connection.db.collection('products').findOne({ featured: true });
  if (sample) {
    console.log('Type of featured:', typeof sample.featured, '=', sample.featured);
    console.log('Type of category:', typeof sample.category, '=', sample.category);
    console.log('Name:', sample.name.substring(0, 60));
  }
  
  // Now try via Mongoose model
  const ProductSchema = new mongoose.Schema({
    name: String,
    category: {
      type: String,
      enum: ['men', 'women', 'new-arrivals', 'accessories', 'kids'],
    },
    featured: { type: Boolean, default: false },
    price: Number,
    images: [String],
  });
  
  const Product = mongoose.model('TestProduct', ProductSchema, 'products');
  const modelFeatured = await Product.countDocuments({ featured: true });
  console.log('MONGOOSE MODEL featured=true:', modelFeatured);
  
  const allProducts = await Product.countDocuments();
  console.log('MONGOOSE MODEL total:', allProducts);
  
  await mongoose.disconnect();
  process.exit(0);
}

test();
