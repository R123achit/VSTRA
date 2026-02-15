const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://rachitkesarwani570:Rachit12345@cluster0.uzslm.mongodb.net/vstra-ecommerce';
const CSV_FILE_PATH = 'c:\\Users\\rachi\\VSTRA\\Data\\Data - Copy.csv';

// 5 subcategories, 20 products each = 100 total
const SUBCATEGORIES = {
  'Sarees':    { target: 20, collected: [], keywords: ['saree', 'sari'] },
  'Dresses':   { target: 20, collected: [], keywords: ['dress', 'gown', 'maxi', 'midi', 'bodycon', 'wrap dress'] },
  'Kurtas':    { target: 20, collected: [], keywords: ['kurti', 'kurta', 'anarkali', 'salwar'] },
  'Tops':      { target: 20, collected: [], keywords: ['top ', 'blouse', 'tunic', 'crop top', 'tank top', 'camisole', 'peplum'] },
  'Innerwear': { target: 20, collected: [], keywords: ['bra ', 'panty', 'nighty', 'nightgown', 'bikini', 'lingerie', 'nightwear', 'babydoll', 'sleepwear'] },
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
  
  for (const [subcategory, config] of Object.entries(SUBCATEGORIES)) {
    if (config.collected.length >= config.target) continue;
    if (config.keywords.some(k => lower.includes(k))) return subcategory;
  }
  return null;
}

async function importWomensSubcategories() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Delete ALL old imported women's products (IMP- prefix with women category)
    const deleteResult = await mongoose.connection.db.collection('products').deleteMany({ 
      sku: { $regex: /^IMP-/ },
      category: 'women'
    });
    console.log('Deleted old women imports:', deleteResult.deletedCount);

    // Get existing product names for dedup 
    const existingProducts = await mongoose.connection.db.collection('products').find(
      { category: 'women' }, { projection: { name: 1 } }
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

      const price = parseFloat(soldPriceRaw.replace(/[^\d.]/g, '')) || 599;
      const compareAtPrice = parseFloat(actualPriceRaw.replace(/[^\d.]/g, '')) || price * 1.8;

      // First product in each subcategory is featured
      const isFeatured = SUBCATEGORIES[subcategory].collected.length === 0;

      const product = {
        name: productName,
        description: 'Shop ' + productName.substring(0, 100) + ' by ' + brand + '. Premium quality womenswear crafted with care and elegance.',
        brand: brand,
        price: price,
        compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
        category: 'women',
        subcategory: subcategory,
        images: [imgUrl],
        stock: Math.floor(Math.random() * 80) + 20,
        sizes: subcategory === 'Innerwear' 
          ? ['XS', 'S', 'M', 'L', 'XL'] 
          : ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Default', hex: '#333333' }],
        sku: 'IMP-W-' + Date.now() + '-' + i,
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
    console.log('\n=== Women\'s Sub-Collection Breakdown ===');
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
    console.log('SUCCESS! Imported ' + allProducts.length + ' women\'s products across 5 sub-collections.');

  } catch (error) {
    console.error('IMPORT FAILED:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  }
}

importWomensSubcategories();
