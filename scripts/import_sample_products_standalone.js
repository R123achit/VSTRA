const fs = require('fs');
const mongoose = require('mongoose');

// Use the SAME MongoDB Atlas URI as the VSTRA app
const MONGODB_URI = 'mongodb+srv://rachitkesarwani570:Rachit12345@cluster0.uzslm.mongodb.net/vstra-ecommerce';
const CSV_FILE_PATH = 'c:\\Users\\rachi\\VSTRA\\Data\\Data - Copy.csv';
const IMPORT_LIMIT = 50;

// CSV Parser
function parseCSVLine(text) {
  const result = [];
  let start = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      inQuotes = !inQuotes;
    } else if (text[i] === ',' && !inQuotes) {
      let field = text.substring(start, i).trim();
      if (field.startsWith('"') && field.endsWith('"')) field = field.slice(1, -1);
      field = field.replace(/""/g, '"');
      result.push(field);
      start = i + 1;
    }
  }
  let field = text.substring(start).trim();
  if (field.startsWith('"') && field.endsWith('"')) field = field.slice(1, -1);
  field = field.replace(/""/g, '"');
  result.push(field);
  return result;
}

async function importProducts() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Atlas!');

    // Step 1: Delete any previous imported products (IMP- prefix)
    const deleteResult = await mongoose.connection.db.collection('products').deleteMany({ sku: { $regex: /^IMP-/ } });
    console.log('Deleted old imports:', deleteResult.deletedCount);

    // Step 2: Read CSV
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    const productsToInsert = [];
    let count = 0;
    const usedNames = new Set();

    // Grab existing product names to avoid duplicates (compound index: name + category)
    const existingProducts = await mongoose.connection.db.collection('products').find({}, { projection: { name: 1, category: 1 } }).toArray();
    const existingKeys = new Set(existingProducts.map(p => p.name + '|' + p.category));

    // Header: id,brand,title,sold_price,actual_price,url,img
    for (let i = 1; i < lines.length && count < IMPORT_LIMIT; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      if (columns.length < 7) continue;

      const brand = columns[1] || 'VSTRA';
      const title = columns[2];
      const soldPriceRaw = columns[3];
      const actualPriceRaw = columns[4];
      const imgUrl = columns[6];

      if (!title || !imgUrl) continue;

      // Clean Prices
      const price = parseFloat(soldPriceRaw.replace(/[^\d.]/g, '')) || 299;
      const compareAtPrice = parseFloat(actualPriceRaw.replace(/[^\d.]/g, '')) || price * 2;

      // Infer Category
      let category = 'new-arrivals';
      const lowerTitle = title.toLowerCase();

      if (lowerTitle.includes('saree') || lowerTitle.includes('kurta') || lowerTitle.includes('women') || 
          lowerTitle.includes('bra') || lowerTitle.includes('blouse') || lowerTitle.includes('lehenga') || 
          lowerTitle.includes('dress') || lowerTitle.includes('nighty') || lowerTitle.includes('panty') ||
          lowerTitle.includes('bikini') || lowerTitle.includes('swimsuit') || lowerTitle.includes('nighty')) {
        category = 'women';
      } else if (lowerTitle.includes('men') && !lowerTitle.includes('women')) {
        category = 'men';
      } else if (lowerTitle.includes('boy') || lowerTitle.includes('girl') || lowerTitle.includes('kid')) {
        category = 'kids';
      }

      // Skip duplicates
      const uniqueKey = title.substring(0, 150) + '|' + category;
      if (existingKeys.has(uniqueKey) || usedNames.has(uniqueKey)) continue;
      usedNames.add(uniqueKey);

      // Make first 6 products featured
      const isFeatured = count < 6;

      const product = {
        name: title.substring(0, 150),
        description: 'Shop ' + title.substring(0, 100) + ' by ' + brand + '. Premium quality with excellent craftsmanship. A perfect addition to your wardrobe.',
        brand: brand,
        price: price,
        compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
        category: category,
        images: [imgUrl],
        stock: Math.floor(Math.random() * 80) + 20,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Default', hex: '#333333' }],
        sku: 'IMP-' + Date.now() + '-' + i,
        featured: isFeatured,
        rating: isFeatured ? parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)) : 0,
        numReviews: isFeatured ? Math.floor(Math.random() * 50) + 10 : 0,
        countryOfOrigin: 'India',
        returnPolicy: '7 Days Replacement',
        createdAt: new Date(),
      };

      productsToInsert.push(product);
      count++;
    }

    if (productsToInsert.length === 0) {
      console.log('No products to import (all may be duplicates).');
      return;
    }

    console.log('Prepared ' + productsToInsert.length + ' products. Inserting to Atlas...');
    await mongoose.connection.db.collection('products').insertMany(productsToInsert);
    
    console.log('SUCCESS! Imported ' + productsToInsert.length + ' products to Atlas.');
    console.log('Featured: ' + productsToInsert.filter(p => p.featured).length);
    console.log('Categories: ' + [...new Set(productsToInsert.map(p => p.category))].join(', '));

  } catch (error) {
    console.error('IMPORT FAILED:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  }
}

importProducts();
