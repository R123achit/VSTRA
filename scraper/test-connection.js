const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI ? '✓ Found' : '✗ Missing');
    console.log('ScraperAPI Key:', process.env.SCRAPER_API_KEY && process.env.SCRAPER_API_KEY !== 'your_scraper_api_key_here' ? '✓ Found' : '⚠ Missing (optional)');
    console.log();
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!\n');
    
    // Check if products collection exists
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count = await Product.countDocuments();
    console.log(`📦 Products in database: ${count}`);
    
    if (count === 0) {
      console.log('\n⚠️  No products found. Run the scraper to populate:');
      console.log('   npm run scrape');
    } else {
      console.log('\n✅ Products found! Your shop should display them.');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check MONGODB_URI in .env file');
    console.log('2. Verify MongoDB is accessible');
    console.log('3. Check network connection');
    process.exit(1);
  }
}

testConnection();
