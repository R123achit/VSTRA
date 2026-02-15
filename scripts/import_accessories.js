const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://rachitkesarwani570:Rachit12345@cluster0.uzslm.mongodb.net/vstra-ecommerce';
const CSV_FILE_PATH = 'c:\\Users\\rachi\\VSTRA\\Data\\Data - Copy.csv';
const IMPORT_LIMIT = 100;

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

function isAccessory(title) {
  const lower = title.toLowerCase();
  const keywords = [
    'watch', 'bag', 'wallet', 'belt', 'sunglass', 'jewel', 'earring',
    'necklace', 'bracelet', 'ring', 'pendant', 'scarf', 'cap', 'hat',
    'glove', 'tie', 'backpack', 'purse', 'clutch', 'handbag', 'footwear',
    'shoe', 'sandal', 'heel', 'slipper', 'sneaker', 'loafer', 'boot',
    'stole', 'shawl', 'dupatta', 'muffler', 'chain', 'anklet', 'bangle',
    'cufflink', 'brooch', 'hair', 'clip', 'headband', 'mask', 'umbrella',
    'keychain', 'perfume', 'deodorant', 'socks', 'moccasin', 'flip flop'
  ];
  return keywords.some(k => lower.includes(k));
}

function inferSubcategory(title) {
  const lower = title.toLowerCase();
  if (lower.includes('watch')) return 'Watches';
  if (lower.includes('bag') || lower.includes('backpack') || lower.includes('handbag') || lower.includes('purse') || lower.includes('clutch')) return 'Bags';
  if (lower.includes('wallet')) return 'Wallets';
  if (lower.includes('belt')) return 'Belts';
  if (lower.includes('sunglass')) return 'Sunglasses';
  if (lower.includes('earring') || lower.includes('necklace') || lower.includes('bracelet') || lower.includes('ring') || lower.includes('pendant') || lower.includes('chain') || lower.includes('anklet') || lower.includes('bangle') || lower.includes('jewel')) return 'Jewellery';
  if (lower.includes('shoe') || lower.includes('sandal') || lower.includes('heel') || lower.includes('slipper') || lower.includes('sneaker') || lower.includes('loafer') || lower.includes('boot') || lower.includes('footwear') || lower.includes('moccasin') || lower.includes('flip flop')) return 'Footwear';
  if (lower.includes('scarf') || lower.includes('stole') || lower.includes('shawl') || lower.includes('dupatta') || lower.includes('muffler')) return 'Scarves & Stoles';
  if (lower.includes('cap') || lower.includes('hat') || lower.includes('headband') || lower.includes('hair') || lower.includes('clip')) return 'Headwear';
  if (lower.includes('tie') || lower.includes('cufflink') || lower.includes('brooch')) return 'Formal Accessories';
  if (lower.includes('perfume') || lower.includes('deodorant')) return 'Fragrances';
  if (lower.includes('socks')) return 'Socks';
  return 'Accessories';
}

async function importAccessories() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const existingProducts = await mongoose.connection.db.collection('products').find(
      {}, { projection: { name: 1, category: 1 } }
    ).toArray();
    const existingKeys = new Set(existingProducts.map(p => p.name + '|' + p.category));
    console.log('Existing products:', existingProducts.length);

    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    const productsToInsert = [];
    const usedNames = new Set();

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
      if (!isAccessory(title)) continue;

      const productName = title.substring(0, 150);
      const uniqueKey = productName + '|accessories';
      if (existingKeys.has(uniqueKey) || usedNames.has(uniqueKey)) continue;
      usedNames.add(uniqueKey);

      const price = parseFloat(soldPriceRaw.replace(/[^\d.]/g, '')) || 399;
      const compareAtPrice = parseFloat(actualPriceRaw.replace(/[^\d.]/g, '')) || price * 2;
      const subcategory = inferSubcategory(title);
      const isFeatured = productsToInsert.length < 4;

      const product = {
        name: productName,
        description: 'Shop ' + productName.substring(0, 100) + ' by ' + brand + '. A stylish accessory with premium quality finish. Elevate your look with this essential piece.',
        brand: brand,
        price: price,
        compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
        category: 'accessories',
        subcategory: subcategory,
        images: [imgUrl],
        stock: Math.floor(Math.random() * 100) + 15,
        sizes: subcategory === 'Footwear' ? ['6', '7', '8', '9', '10', '11'] : ['Free Size'],
        colors: [{ name: 'Default', hex: '#333333' }],
        sku: 'IMP-A-' + Date.now() + '-' + i,
        featured: isFeatured,
        rating: isFeatured ? parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)) : 0,
        numReviews: isFeatured ? Math.floor(Math.random() * 60) + 15 : 0,
        countryOfOrigin: 'India',
        returnPolicy: '7 Days Replacement',
        createdAt: new Date(),
      };

      productsToInsert.push(product);
    }

    console.log('Selected', productsToInsert.length, 'accessories');

    if (productsToInsert.length === 0) {
      console.log('No new accessories to import.');
      return;
    }

    await mongoose.connection.db.collection('products').insertMany(productsToInsert);

    console.log('SUCCESS! Imported ' + productsToInsert.length + ' accessories.');
    console.log('Featured:', productsToInsert.filter(p => p.featured).length);

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

importAccessories();
