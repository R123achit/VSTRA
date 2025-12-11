const mongoose = require('mongoose');
const Product = require('../models/Product');
const DataValidator = require('./validator');

class DatabaseManager {
  // Connect to MongoDB
  static async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vstra-scraper';
      
      await mongoose.connect(mongoUri);
      
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      throw error;
    }
  }

  // Disconnect from MongoDB
  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error.message);
    }
  }

  // Save products to database
  static async saveProducts(products) {
    console.log(`\n💾 Saving ${products.length} products to database...`);
    
    // Clean and validate products
    const cleanedProducts = products.map(p => DataValidator.cleanProduct(p));
    const validProducts = DataValidator.filterValidProducts(cleanedProducts);
    const uniqueProducts = DataValidator.removeDuplicates(validProducts);
    
    console.log(`✅ Valid unique products: ${uniqueProducts.length}`);
    
    let saved = 0;
    let updated = 0;
    let failed = 0;

    for (const product of uniqueProducts) {
      try {
        const existing = await Product.findOne({ productId: product.productId });
        
        if (existing) {
          // Update existing product
          await Product.updateOne(
            { productId: product.productId },
            { $set: product }
          );
          updated++;
        } else {
          // Create new product
          await Product.create(product);
          saved++;
        }
      } catch (error) {
        console.error(`❌ Error saving product ${product.productId}:`, error.message);
        failed++;
      }
    }

    console.log(`\n📊 Database Results:`);
    console.log(`  ✅ New products saved: ${saved}`);
    console.log(`  🔄 Products updated: ${updated}`);
    console.log(`  ❌ Failed: ${failed}`);
    
    return { saved, updated, failed, total: saved + updated };
  }

  // Get all products
  static async getAllProducts(filters = {}) {
    try {
      return await Product.find(filters).sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Error fetching products:', error.message);
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(category) {
    try {
      return await Product.find({ category }).sort({ rating: -1, price: 1 });
    } catch (error) {
      console.error('❌ Error fetching products by category:', error.message);
      throw error;
    }
  }

  // Get product statistics
  static async getStats() {
    try {
      const total = await Product.countDocuments();
      const byCategory = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      const avgPrice = await Product.aggregate([
        { $group: { _id: null, avgPrice: { $avg: '$price' } } }
      ]);

      return {
        total,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        averagePrice: avgPrice[0]?.avgPrice || 0
      };
    } catch (error) {
      console.error('❌ Error fetching stats:', error.message);
      throw error;
    }
  }

  // Delete old products (older than specified days)
  static async deleteOldProducts(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const result = await Product.deleteMany({
        lastScraped: { $lt: cutoffDate }
      });
      
      console.log(`🗑️  Deleted ${result.deletedCount} old products`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error deleting old products:', error.message);
      throw error;
    }
  }
}

module.exports = DatabaseManager;
