const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://rachitkesarwani570:Rachit12345@cluster0.uzslm.mongodb.net/vstra-ecommerce';
const CSV_FILE_PATH = 'c:\\Users\\rachi\\VSTRA\\Data\\Data - Copy.csv';

// 4 subcategories, 25 products each = 100 total
const SUBCATEGORIES = {
  'Bags':                 { target: 25, collected: [], keywords: ['bag', 'backpack', 'handbag', 'clutch', 'purse', 'tote', 'wallet', 'sling bag', 'duffel', 'laptop bag'] },
  'Jewellery':            { target: 25, collected: [], keywords: ['jewellery', 'jewelry', 'earring', 'necklace', 'bracelet', 'ring ', 'pendant', 'bangle', 'anklet', 'chain'] },
  'Footwear':             { target: 25, collected: [], keywords: ['heel', 'sandal', 'flat', 'wedge', 'floater', 'slipper', 'flip flop', 'mojari', 'kolhapuri', 'mule', 'pump'] },
  'Formal Accessories':   { target: 25, collected: [], keywords: ['tie ', 'necktie', 'belt', 'cufflink', 'pocket square', 'suspender', 'scarf', 'stole', 'watch', 'sunglasses', 'cap', 'hat', 'glove', 'socks'] },
};

function parseCSVLine(text) {
  const result = [];
  let start = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') inQuotes = !inQuotes;
    else if (text[i] === ',' && !inQuotes) {
      let field = text.substring(start, i).trim();
      if (field.startsWith('"') && field.endsWith('"')) field = field.slice(1, -1);
      result.push(field.replace(/""/g, '"'));
      start = i + 1;
    }
  }
  let field = text.substring(start).trim();
  if (field.startsWith('"') && field.endsWith('"')) field = field.slice(1, -1);
  result.push(field.replace(/""/g, '"'));
  return result;
}

function classifyProduct(title) {
  const lower = title.toLowerCase();
  
  // Skip items that are clearly clothing (not accessories)
  const clothingKeywords = ['shirt', 't-shirt', 'jeans', 'trouser', 'pant', 'dress', 'kurti', 'saree', 'kurta', 'lehenga', 'suit ', 'blazer', 'jacket'];
  if (clothingKeywords.some(k => lower.includes(k))) return null;

  for (const [subcategory, config] of Object.entries(SUBCATEGORIES)) {
    if (config.collected.length >= config.target) continue;
    if (config.keywords.some(k => lower.includes(k))) return subcategory;
  }
  return null;
}

async function importAccessoriesSubcategories() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Delete ALL old imported accessories
    const deleteResult = await mongoose.connection.db.collection('products').deleteMany({ 
      sku: { $regex: /^IMP-A-|^IMP-\d/ },
      category: 'accessories'
    });
    console.log('Deleted old accessories imports:', deleteResult.deletedCount);

    // Also delete accessories with generic IMP prefixes
    const deleteResult2 = await mongoose.connection.db.collection('products').deleteMany({ 
      sku: { $regex: /^IMP-/ },
      category: 'accessories'
    });
    console.log('Deleted remaining old accessories:', deleteResult2.deletedCount);

    // Get existing product names for dedup
    const existingProducts = await mongoose.connection.db.collection('products').find(
      { category: 'accessories' }, { projection: { name: 1 } }
    ).toArray();
    const existingNames = new Set(existingProducts.map(p => p.name));

    // Read CSV
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    const usedNames = new Set();
    let totalCollected = 0;
    const totalTarget = Object.values(SUBCATEGORIES).reduce((sum, c) => sum + c.target, 0);

    for (let i = 1; i < lines.length && totalCollected < totalTarget; i++) {
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

      const productName = title.substring(0, 150);
      if (existingNames.has(productName) || usedNames.has(productName)) continue;

      const subcategory = classifyProduct(title);
      if (!subcategory) continue;

      usedNames.add(productName);

      const price = parseFloat(soldPriceRaw.replace(/[^\d.]/g, '')) || 499;
      const compareAtPrice = parseFloat(actualPriceRaw.replace(/[^\d.]/g, '')) || price * 1.5;

      // First product in each subcategory is featured
      const isFeatured = SUBCATEGORIES[subcategory].collected.length === 0;

      const product = {
        name: productName,
        description: 'Shop ' + productName.substring(0, 100) + ' by ' + brand + '. Premium quality accessory to complete your look.',
        brand: brand,
        price: price,
        compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
        category: 'accessories',
        subcategory: subcategory,
        images: [imgUrl],
        stock: Math.floor(Math.random() * 80) + 20,
        sizes: subcategory === 'Footwear' 
          ? ['5', '6', '7', '8', '9', '10'] 
          : ['Free Size'],
        colors: [{ name: 'Default', hex: '#333333' }],
        sku: 'IMP-A-' + Date.now() + '-' + i,
        featured: isFeatured,
        rating: isFeatured ? parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)) : 0,
        numReviews: isFeatured ? Math.floor(Math.random() * 80) + 20 : 0,
        countryOfOrigin: 'India',
        returnPolicy: '7 Days Replacement',
        createdAt: new Date(),
      };

      SUBCATEGORIES[subcategory].collected.push(product);
      totalCollected++;
    }

    // Combine all products
    const allProducts = [];
    console.log('\n=== Accessories Sub-Collection Breakdown ===');
    for (const [name, config] of Object.entries(SUBCATEGORIES)) {
      console.log(name + ': ' + config.collected.length + '/' + config.target);
      allProducts.push(...config.collected);
    }

    if (allProducts.length === 0) {
      console.log('No products to import.');
      return;
    }

    console.log('\nTotal: ' + allProducts.length + ' products');
    console.log('Inserting to Atlas...');

    await mongoose.connection.db.collection('products').insertMany(allProducts);
    console.log('SUCCESS! Imported ' + allProducts.length + ' accessories across 4 sub-collections.');

  } catch (error) {
    console.error('IMPORT FAILED:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  }
}

importAccessoriesSubcategories();
