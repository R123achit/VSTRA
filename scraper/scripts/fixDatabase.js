#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from scraper/.env
dotenv.config();

async function fixDatabase() {
  console.log('🔧 Fixing database indexes...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:');
    indexes.forEach(idx => console.log(`  - ${idx.name}`));
    console.log();
    
    // Drop the problematic name_1_category_1 index if it exists
    try {
      await collection.dropIndex('name_1_category_1');
      console.log('✅ Dropped old name_1_category_1 index');
    } catch (error) {
      console.log('ℹ️  Index name_1_category_1 does not exist (OK)');
    }
    
    console.log('\n✅ Database fixed!');
    console.log('\nNow run: npm run seed');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixDatabase();
