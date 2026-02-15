const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://rachitkesarwani570:Rachit12345@cluster0.uzslm.mongodb.net/vstra-ecommerce';
const CSV_FILE_PATH = 'c:\\Users\\rachi\\VSTRA\\Data\\Data - Copy.csv';

// ══════════════════════════════════════════════════════════════
// 5 COLLECTIONS — Each with subcategories, 50+ products target
// ══════════════════════════════════════════════════════════════

const COLLECTIONS = {
  men: {
    label: "Men's Collection",
    skuPrefix: 'COL-M',
    target: 55,
    descTemplate: (name, brand) => `Shop ${name.substring(0, 100)} by ${brand}. Premium quality menswear with modern fit and excellent craftsmanship.`,
    subcategories: {
      'Shirts':       { target: 12, collected: [], keywords: ['shirt'], exclude: ['t-shirt', 'tshirt', 'women', 'girl', 'ladies'] },
      'T-Shirts':     { target: 12, collected: [], keywords: ['t-shirt', 'tshirt', 'polo', 'round neck tee', 'crew neck'], exclude: ['women', 'girl', 'ladies'] },
      'Jeans':        { target: 10, collected: [], keywords: ['jeans', 'denim pant', 'denim trouser'], exclude: ['women', 'girl', 'ladies'] },
      'Trousers':     { target: 10, collected: [], keywords: ['trouser', 'chino', 'formal pant'], exclude: ['women', 'girl', 'ladies', 'track'] },
      'Jackets':      { target: 11, collected: [], keywords: ['jacket', 'blazer', 'coat', 'windcheater', 'bomber'], exclude: ['women', 'girl', 'ladies'] },
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    filterGender: 'men', // must NOT match women keywords
    genderExclude: ['women', 'saree', 'lehenga', 'bra ', 'panty', 'nighty', 'bikini', 'blouse', 'kurti', 'anarkali', 'salwar', 'girl', 'ladies', 'female'],
  },
  women: {
    label: "Women's Collection",
    skuPrefix: 'COL-W',
    target: 55,
    descTemplate: (name, brand) => `Shop ${name.substring(0, 100)} by ${brand}. Premium quality womenswear crafted with care and elegance.`,
    subcategories: {
      'Sarees':      { target: 12, collected: [], keywords: ['saree', 'sari'] },
      'Dresses':     { target: 12, collected: [], keywords: ['dress', 'gown', 'maxi', 'midi', 'bodycon', 'wrap dress', 'a-line dress'] },
      'Kurtas':      { target: 10, collected: [], keywords: ['kurti', 'kurta', 'anarkali', 'salwar', 'kameez'] },
      'Tops':        { target: 11, collected: [], keywords: ['top ', 'blouse', 'tunic', 'crop top', 'tank top', 'camisole', 'peplum'] },
      'Leggings':    { target: 10, collected: [], keywords: ['legging', 'jegging', 'churidar', 'tregging'] },
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    filterGender: 'women', // only match if women keyword present OR via subcategory keyword
  },
  accessories: {
    label: "Accessories Collection",
    skuPrefix: 'COL-A',
    target: 55,
    descTemplate: (name, brand) => `Shop ${name.substring(0, 100)} by ${brand}. Premium quality accessory to complete your look.`,
    subcategories: {
      'Bags':              { target: 12, collected: [], keywords: ['bag', 'backpack', 'handbag', 'clutch', 'purse', 'tote', 'wallet', 'sling bag', 'duffel', 'laptop bag'] },
      'Jewellery':         { target: 12, collected: [], keywords: ['jewellery', 'jewelry', 'earring', 'necklace', 'bracelet', 'ring ', 'pendant', 'bangle', 'anklet', 'chain ', 'mangalsutra'] },
      'Watches':           { target: 10, collected: [], keywords: ['watch', 'smartwatch', 'wristwatch'] },
      'Sunglasses':        { target: 10, collected: [], keywords: ['sunglasses', 'sunglass', 'eyewear', 'goggles', 'spectacle'] },
      'Belts & Wallets':   { target: 11, collected: [], keywords: ['belt', 'wallet', 'money clip', 'card holder', 'purse'] },
    },
    sizes: ['Free Size'],
    filterGender: null,
    clothingExclude: ['shirt', 't-shirt', 'jeans', 'trouser', 'pant', 'dress', 'kurti', 'kurta', 'saree', 'lehenga', 'suit ', 'blazer', 'jacket', 'top ', 'legging'],
  },
  kids: {
    label: "Kids Collection",
    skuPrefix: 'COL-K',
    target: 55,
    descTemplate: (name, brand) => `Shop ${name.substring(0, 100)} by ${brand}. Comfortable and stylish kids wear for your little ones.`,
    subcategories: {
      'Boys Clothing':      { target: 12, collected: [], keywords: ['boy', 'boys'] },
      'Girls Clothing':     { target: 12, collected: [], keywords: ['girl', 'girls'] },
      'Kids Footwear':      { target: 10, collected: [], keywords: ['kid shoe', 'kids shoe', 'children shoe', 'infant shoe', 'baby shoe', 'kid sandal', 'kids sandal'] },
      'Kids Accessories':   { target: 10, collected: [], keywords: ['kid bag', 'kids bag', 'school bag', 'kids watch', 'kid watch'] },
      'Baby Clothing':      { target: 11, collected: [], keywords: ['baby', 'infant', 'toddler', 'newborn', 'romper', 'onesie'] },
    },
    sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '8-9Y', '10-11Y'],
    filterGender: null,
  },
  'new-arrivals': {
    label: "New Arrivals Collection",
    skuPrefix: 'COL-N',
    target: 55,
    descTemplate: (name, brand) => `Shop ${name.substring(0, 100)} by ${brand}. Latest arrival — fresh styles and trending designs.`,
    subcategories: {
      'Trending Tops':       { target: 12, collected: [], keywords: ['crop top', 'printed t-shirt', 'graphic tee', 'oversized', 'trendy', 'stylish top', 'designer top', 'fashionable'] },
      'Party Wear':          { target: 12, collected: [], keywords: ['party', 'cocktail', 'evening', 'sequin', 'glitter', 'metallic', 'velvet', 'satin', 'shimmer'] },
      'Ethnic Fusion':       { target: 10, collected: [], keywords: ['indo-western', 'fusion', 'indo western', 'dhoti', 'nehru jacket', 'ethnic', 'festive', 'wedding'] },
      'Streetwear':          { target: 11, collected: [], keywords: ['hoodie', 'sweatshirt', 'jogger', 'tracksuit', 'cargo', 'streetwear', 'urban', 'hip hop'] },
      'Activewear':          { target: 10, collected: [], keywords: ['sports', 'gym', 'yoga', 'running', 'fitness', 'athletic', 'activewear', 'workout', 'track pant', 'trackpant'] },
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    filterGender: null,
  },
};

// ══════════════════════════════════════════════════════════════
// CSV PARSER
// ══════════════════════════════════════════════════════════════
function parseCSVLine(text) {
  const result = [];
  let start = 0, inQuotes = false;
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

// ══════════════════════════════════════════════════════════════
// CLASSIFY PRODUCT INTO A COLLECTION + SUBCATEGORY
// ══════════════════════════════════════════════════════════════
function classifyProduct(title, collectionKey, config) {
  const lower = title.toLowerCase();

  // Gender filtering
  if (config.genderExclude && config.genderExclude.some(w => lower.includes(w))) return null;
  if (config.clothingExclude && config.clothingExclude.some(w => lower.includes(w))) return null;

  for (const [subcategory, sub] of Object.entries(config.subcategories)) {
    if (sub.collected.length >= sub.target) continue;
    if (sub.exclude && sub.exclude.some(e => lower.includes(e))) continue;
    if (sub.keywords.some(k => lower.includes(k))) return subcategory;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// MAIN IMPORT
// ══════════════════════════════════════════════════════════════
async function importAllCollections() {
  try {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   VSTRA — FULL COLLECTION IMPORT TOOL           ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected!\n');

    // Delete old imports (COL- prefix)
    const deleteResult = await mongoose.connection.db.collection('products').deleteMany({
      sku: { $regex: /^COL-/ }
    });
    console.log('🗑  Cleaned old COL- imports:', deleteResult.deletedCount, 'products\n');

    // Get existing product names for dedup (across all categories)
    const existingProducts = await mongoose.connection.db.collection('products').find(
      {}, { projection: { name: 1, category: 1 } }
    ).toArray();
    const existingKeys = new Set(existingProducts.map(p => p.name + '|' + p.category));

    // Read CSV (line by line to avoid memory issues with 62K rows)
    console.log('📖 Reading CSV file...');
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    console.log('   Total CSV rows:', lines.length - 1, '\n');

    const globalUsedNames = new Set();
    let globalCounter = 0;

    // Process each collection
    for (const [catKey, config] of Object.entries(COLLECTIONS)) {
      console.log(`── ${config.label} ──`);

      let collectionTotal = 0;
      const totalTarget = Object.values(config.subcategories).reduce((sum, c) => sum + c.target, 0);

      for (let i = 1; i < lines.length && collectionTotal < totalTarget; i++) {
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

        // Clean image URL
        let cleanImg = imgUrl.trim();
        if (cleanImg.startsWith('"')) cleanImg = cleanImg.slice(1);
        if (cleanImg.endsWith('"')) cleanImg = cleanImg.slice(0, -1);
        // Ensure it's a valid URL
        if (!cleanImg.startsWith('http')) continue;

        const productName = title.substring(0, 150).trim();
        const dedupKey = productName + '|' + catKey;
        if (existingKeys.has(dedupKey) || globalUsedNames.has(dedupKey)) continue;

        const subcategory = classifyProduct(title, catKey, config);
        if (!subcategory) continue;

        globalUsedNames.add(dedupKey);
        globalCounter++;

        const price = parseFloat((soldPriceRaw || '').replace(/[^\d.]/g, '')) || 499;
        const compareAtPrice = parseFloat((actualPriceRaw || '').replace(/[^\d.]/g, '')) || Math.round(price * 1.6);

        const subConfig = config.subcategories[subcategory];
        const isFeatured = subConfig.collected.length < 3; // First 3 in each sub are featured
        const hasRating = Math.random() > 0.3; // 70% of products have ratings

        const product = {
          name: productName,
          description: config.descTemplate(productName, brand),
          brand: brand,
          price: price,
          compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
          category: catKey,
          subcategory: subcategory,
          images: [cleanImg],
          stock: Math.floor(Math.random() * 80) + 20,
          sizes: config.sizes,
          colors: [{ name: 'Default', hex: '#333333' }],
          sku: config.skuPrefix + '-' + Date.now() + '-' + globalCounter,
          featured: isFeatured,
          rating: hasRating ? parseFloat((Math.random() * 2.0 + 3.0).toFixed(1)) : 0,
          numReviews: hasRating ? Math.floor(Math.random() * 100) + 5 : 0,
          countryOfOrigin: 'India',
          returnPolicy: '7 Days Replacement',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000), // random date within last 30 days
        };

        subConfig.collected.push(product);
        collectionTotal++;
      }

      // Report for this collection
      for (const [name, sub] of Object.entries(config.subcategories)) {
        const status = sub.collected.length >= sub.target ? '✓' : '⚠';
        console.log(`   ${status} ${name}: ${sub.collected.length}/${sub.target}`);
      }
      console.log(`   TOTAL: ${collectionTotal}/${totalTarget}\n`);
    }

    // Combine all products and insert
    const allProducts = [];
    for (const config of Object.values(COLLECTIONS)) {
      for (const sub of Object.values(config.subcategories)) {
        allProducts.push(...sub.collected);
      }
    }

    if (allProducts.length === 0) {
      console.log('❌ No products to import.');
      return;
    }

    console.log('═══════════════════════════════════════════');
    console.log(`📦 Total products to insert: ${allProducts.length}`);
    console.log('═══════════════════════════════════════════\n');
    console.log('Inserting to Atlas...');

    // Insert in batches of 100 to avoid timeouts
    const batchSize = 100;
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = allProducts.slice(i, i + batchSize);
      await mongoose.connection.db.collection('products').insertMany(batch);
      console.log(`   Batch ${Math.floor(i / batchSize) + 1}: inserted ${batch.length} products`);
    }

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║  ✅ SUCCESS! Imported ${allProducts.length} products              ║`);
    console.log('╠══════════════════════════════════════════════════╣');
    for (const [catKey, config] of Object.entries(COLLECTIONS)) {
      const totalForCat = Object.values(config.subcategories).reduce((sum, s) => sum + s.collected.length, 0);
      const subCount = Object.keys(config.subcategories).length;
      console.log(`║  ${config.label.padEnd(25)} ${totalForCat} products (${subCount} subs) ║`);
    }
    console.log('╚══════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ IMPORT FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected. Done.');
    process.exit(0);
  }
}

importAllCollections();
