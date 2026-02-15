const http = require('http');

function getApi(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  const all = await getApi('http://localhost:3000/api/products?limit=500');
  console.log('=== TOTAL STORE INVENTORY ===');
  console.log('TOTAL:', all.count);

  console.log('\n--- MEN (5 sub-collections) ---');
  const men = await getApi('http://localhost:3000/api/products?category=men&limit=500');
  console.log('All Men:', men.count);
  for (const sub of ['Shirts', 'T-Shirts', 'Jeans', 'Shoes', 'Underwear']) {
    const r = await getApi(`http://localhost:3000/api/products?category=men&subcategory=${encodeURIComponent(sub)}&limit=500`);
    console.log('  ' + sub + ':', r.count);
  }

  console.log('\n--- WOMEN (5 sub-collections) ---');
  const women = await getApi('http://localhost:3000/api/products?category=women&limit=500');
  console.log('All Women:', women.count);
  for (const sub of ['Sarees', 'Dresses', 'Kurtas', 'Tops', 'Innerwear']) {
    const r = await getApi(`http://localhost:3000/api/products?category=women&subcategory=${encodeURIComponent(sub)}&limit=500`);
    console.log('  ' + sub + ':', r.count);
  }

  console.log('\n--- ACCESSORIES (4 sub-collections) ---');
  const acc = await getApi('http://localhost:3000/api/products?category=accessories&limit=500');
  console.log('All Accessories:', acc.count);
  for (const sub of ['Bags', 'Jewellery', 'Footwear', 'Formal Accessories']) {
    const r = await getApi(`http://localhost:3000/api/products?category=accessories&subcategory=${encodeURIComponent(sub)}&limit=500`);
    console.log('  ' + sub + ':', r.count);
  }

  console.log('\n--- FEATURED ---');
  const feat = await getApi('http://localhost:3000/api/products?featured=true&limit=500');
  console.log('Featured:', feat.count);
}

test();
