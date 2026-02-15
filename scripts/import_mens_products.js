const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://rachitkesarwani570:Rachit12345@cluster0.uzslm.mongodb.net/vstra-ecommerce';
const CSV_FILE_PATH = 'c:\\Users\\rachi\\VSTRA\\Data\\Data - Copy.csv';
const IMPORT_LIMIT = 100;

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

function isMensProduct(title) {
  const lower = title.toLowerCase();
  // Exclude women's products
  if (lower.includes('women') || lower.includes('saree') || lower.includes('lehenga') || 
      lower.includes('bra') || lower.includes('panty') || lower.includes('nighty') || 
      lower.includes('bikini') || lower.includes('blouse') || lower.includes('mangalsutra') ||
      lower.includes('kurti') || lower.includes('salwar') || lower.includes('anarkali')) {
    return false;
  }
  // Include men's products
  if (lower.includes('men ') || lower.includes('mens ') || lower.includes("men's") ||
      lower.includes('shirt') || lower.includes('jeans') || lower.includes('trouser') ||
      lower.includes('boxer') || lower.includes('t-shirt') || lower.includes('polo') || 
      lower.includes('jacket') || lower.includes('blazer') || lower.includes('hoodie') ||
      lower.includes('sweatshirt') || lower.includes('track pant') || lower.includes('trackpant') ||
      lower.includes('cargo') || lower.includes('chino') || lower.includes('formal pant') ||
      lower.includes('vest') || lower.includes('bermuda') || lower.includes('shorts') ||
      lower.includes('kurta') || lower.includes('nehru') || lower.includes('sherwani')) {
    return true;
  }
  return false;
}

function inferSubcategory(title) {
  const lower = title.toLowerCase();
  if (lower.includes('t-shirt') || lower.includes('tshirt')) return 'T-Shirts';
  if (lower.includes('shirt')) return 'Shirts';
  if (lower.includes('jeans')) return 'Jeans';
  if (lower.includes('trouser') || lower.includes('pant') || lower.includes('chino')) return 'Trousers';
  if (lower.includes('jacket')) return 'Jackets';
  if (lower.includes('blazer')) return 'Blazers';
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'Hoodies';
  if (lower.includes('kurta') || lower.includes('sherwani')) return 'Ethnic Wear';
  if (lower.includes('shorts') || lower.includes('bermuda')) return 'Shorts';
  if (lower.includes('track')) return 'Activewear';
  if (lower.includes('boxer') || lower.includes('vest') || lower.includes('brief')) return 'Innerwear';
  if (lower.includes('polo')) return 'Polo Shirts';
  if (lower.includes('cargo')) return 'Cargo Pants';
  return 'Casual Wear';
}

async function importMensProducts() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Get existing product names to avoid duplicates
    const existingProducts = await mongoose.connection.db.collection('products').find(
      {}, { projection: { name: 1, category: 1 } }
    ).toArray();
    const existingKeys = new Set(existingProducts.map(p => p.name + '|' + p.category));
    console.log('Existing products:', existingProducts.length);

    // Read CSV
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    const productsToInsert = [];
    const usedNames = new Set();
    let scanned = 0;

    for (let i = 1; i < lines.length && productsToInsert.length < IMPORT_LIMIT; i++) {
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
      scanned++;

      // Only pick men's products
      if (!isMensProduct(title)) continue;

      const productName = title.substring(0, 150);
      const uniqueKey = productName + '|men';
      if (existingKeys.has(uniqueKey) || usedNames.has(uniqueKey)) continue;
      usedNames.add(uniqueKey);

      const price = parseFloat(soldPriceRaw.replace(/[^\d.]/g, '')) || 499;
      const compareAtPrice = parseFloat(actualPriceRaw.replace(/[^\d.]/g, '')) || price * 2;

      const isFeatured = productsToInsert.length < 4; // First 4 men's products featured

      const product = {
        name: productName,
        description: 'Shop ' + productName.substring(0, 100) + ' by ' + brand + '. Premium quality menswear crafted with excellent material and modern fit. Elevate your style.',
        brand: brand,
        price: price,
        compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
        category: 'men',
        subcategory: inferSubcategory(title),
        images: [imgUrl],
        stock: Math.floor(Math.random() * 80) + 20,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Default', hex: '#333333' }],
        sku: 'IMP-M-' + Date.now() + '-' + i,
        featured: isFeatured,
        rating: isFeatured ? parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)) : 0,
        numReviews: isFeatured ? Math.floor(Math.random() * 80) + 20 : 0,
        countryOfOrigin: 'India',
        returnPolicy: '7 Days Replacement',
        createdAt: new Date(),
      };

      productsToInsert.push(product);
    }

    console.log('Scanned', scanned, 'products from CSV');
    console.log('Selected', productsToInsert.length, "men's products");

    if (productsToInsert.length === 0) {
      console.log('No new products to import.');
      return;
    }

    await mongoose.connection.db.collection('products').insertMany(productsToInsert);
    
    console.log('SUCCESS! Imported ' + productsToInsert.length + " men's products.");
    console.log('Featured:', productsToInsert.filter(p => p.featured).length);
    
    // Print subcategory breakdown
    const subcats = {};
    productsToInsert.forEach(p => { subcats[p.subcategory] = (subcats[p.subcategory] || 0) + 1; });
    console.log('Subcategories:', JSON.stringify(subcats));

  } catch (error) {
    console.error('IMPORT FAILED:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  }
}

importMensProducts();
