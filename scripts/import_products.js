const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rachitkesarwani570:Rachit12345@cluster0.uzslm.mongodb.net/vstra-ecommerce';

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  category: String,
  subcategory: String,
  brand: String,
  images: [String],
  sizes: [String],
  colors: [String],
  stock: { type: Number, default: 50 },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 4.0 },
  reviews: { type: Number, default: 0 },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Parse price string to number
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[₹,]/g, ''));
}

// Determine category from title
function determineCategory(title, brand) {
  const titleLower = title.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  if (titleLower.includes('saree') || titleLower.includes('sari')) {
    return { category: 'Women', subcategory: 'Sarees' };
  } else if (titleLower.includes('kurta') || titleLower.includes('kurti')) {
    return { category: 'Women', subcategory: 'Kurtas' };
  } else if (titleLower.includes('dress')) {
    return { category: 'Women', subcategory: 'Dresses' };
  } else if (titleLower.includes('jeans') || titleLower.includes('trouser')) {
    return { category: 'Women', subcategory: 'Jeans' };
  } else if (titleLower.includes('top') || titleLower.includes('shirt')) {
    return { category: 'Women', subcategory: 'Tops' };
  } else if (titleLower.includes('bra') || titleLower.includes('bralette')) {
    return { category: 'Women', subcategory: 'Innerwear' };
  } else if (titleLower.includes('lehenga')) {
    return { category: 'Women', subcategory: 'Lehengas' };
  } else if (titleLower.includes('suit') || titleLower.includes('salwar')) {
    return { category: 'Women', subcategory: 'Suits' };
  } else if (titleLower.includes('jacket') || titleLower.includes('coat')) {
    return { category: 'Women', subcategory: 'Jackets' };
  } else if (titleLower.includes('skirt')) {
    return { category: 'Women', subcategory: 'Skirts' };
  } else {
    return { category: 'Women', subcategory: 'Clothing' };
  }
}

// Extract colors from title
function extractColors(title) {
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Multicolor'];
  const foundColors = [];
  
  const titleLower = title.toLowerCase();
  colors.forEach(color => {
    if (titleLower.includes(color.toLowerCase())) {
      foundColors.push(color);
    }
  });
  
  return foundColors.length > 0 ? foundColors : ['Multicolor'];
}

// Generate tags from title
function generateTags(title, category, subcategory) {
  const tags = [];
  const titleLower = title.toLowerCase();
  
  // Add category and subcategory
  if (category) tags.push(category);
  if (subcategory) tags.push(subcategory);
  
  // Add style tags
  if (titleLower.includes('embroidered')) tags.push('Embroidered');
  if (titleLower.includes('printed')) tags.push('Printed');
  if (titleLower.includes('solid')) tags.push('Solid');
  if (titleLower.includes('floral')) tags.push('Floral');
  if (titleLower.includes('casual')) tags.push('Casual');
  if (titleLower.includes('party')) tags.push('Party');
  if (titleLower.includes('wedding')) tags.push('Wedding');
  if (titleLower.includes('bollywood')) tags.push('Bollywood');
  if (titleLower.includes('ethnic')) tags.push('Ethnic');
  if (titleLower.includes('western')) tags.push('Western');
  
  // Add fabric tags
  if (titleLower.includes('silk')) tags.push('Silk');
  if (titleLower.includes('cotton')) tags.push('Cotton');
  if (titleLower.includes('georgette')) tags.push('Georgette');
  if (titleLower.includes('chiffon')) tags.push('Chiffon');
  if (titleLower.includes('lycra')) tags.push('Lycra');
  
  return [...new Set(tags)]; // Remove duplicates
}

// Parse CSV line
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

// Main import function
async function importProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'Data', 'Data - Copy.csv');
    console.log('📂 Reading CSV file:', csvPath);
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`📊 Found ${lines.length - 1} products in CSV`);

    // Skip header
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length < 7) continue; // Skip invalid lines
      
      const [id, brand, title, soldPrice, actualPrice, url, img] = values;
      
      const price = parsePrice(soldPrice);
      const originalPrice = parsePrice(actualPrice);
      
      if (!title || price === 0) continue; // Skip invalid products
      
      const { category, subcategory } = determineCategory(title, brand);
      const colors = extractColors(title);
      const tags = generateTags(title, category, subcategory);
      
      // Generate description
      const description = `${title} by ${brand}. Premium quality ${subcategory.toLowerCase()} perfect for any occasion. Available in multiple sizes and colors.`;
      
      const product = {
        name: title,
        description: description,
        price: price,
        originalPrice: originalPrice > price ? originalPrice : price * 2,
        category: category,
        subcategory: subcategory,
        brand: brand || 'VSTRA',
        images: img ? [img] : ['https://via.placeholder.com/500'],
        sizes: subcategory === 'Sarees' ? ['Free Size'] : ['S', 'M', 'L', 'XL'],
        colors: colors,
        stock: Math.floor(Math.random() * 50) + 20, // Random stock between 20-70
        featured: Math.random() > 0.9, // 10% chance of being featured
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5-5.0
        reviews: Math.floor(Math.random() * 500), // Random reviews 0-500
        tags: tags
      };
      
      products.push(product);
    }

    console.log(`✅ Parsed ${products.length} valid products`);
    
    // Remove duplicates based on name
    const uniqueProducts = [];
    const seenNames = new Set();
    
    for (const product of products) {
      if (!seenNames.has(product.name)) {
        seenNames.add(product.name);
        uniqueProducts.push(product);
      }
    }
    
    console.log(`✅ ${uniqueProducts.length} unique products after deduplication`);

    // Insert products in batches
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < uniqueProducts.length; i += batchSize) {
      const batch = uniqueProducts.slice(i, i + batchSize);
      
      try {
        await Product.insertMany(batch, { ordered: false });
        inserted += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${inserted}/${uniqueProducts.length} products`);
      } catch (error) {
        // Some products might already exist, count successful inserts
        if (error.writeErrors) {
          const successCount = batch.length - error.writeErrors.length;
          inserted += successCount;
          console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1}: ${successCount} inserted, ${error.writeErrors.length} duplicates skipped`);
        }
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Total products inserted: ${inserted}`);
    
    // Show statistics
    const totalProducts = await Product.countDocuments();
    const categories = await Product.distinct('category');
    const subcategories = await Product.distinct('subcategory');
    
    console.log(`\n📈 Database Statistics:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Categories: ${categories.length} (${categories.join(', ')})`);
    console.log(`   Subcategories: ${subcategories.length}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error importing products:', error);
    process.exit(1);
  }
}

// Run import
importProducts();
