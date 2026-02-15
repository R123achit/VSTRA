const fs = require('fs');
const CSV_FILE_PATH = 'c:\\Users\\rachi\\VSTRA\\Data\\Data - Copy.csv';

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

const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
const lines = fileContent.split(/\r?\n/);

const categories = {
  'Shirts': [],
  'T-Shirts': [],
  'Jeans': [],
  'Shoes': [],
  'Underwear': [],
  'Trousers': [],
  'Jackets': [],
  'Kurtas': [],
};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const columns = parseCSVLine(line);
  if (columns.length < 7) continue;
  const title = columns[2] || '';
  const lower = title.toLowerCase();
  
  // Skip women's items
  if (lower.includes('women') || lower.includes('saree') || lower.includes('lehenga') || 
      lower.includes('bra ') || lower.includes('panty') || lower.includes('nighty') || 
      lower.includes('bikini') || lower.includes('blouse') || lower.includes('kurti') ||
      lower.includes('anarkali') || lower.includes('salwar')) continue;

  if ((lower.includes('shirt') && !lower.includes('t-shirt') && !lower.includes('tshirt')) && (lower.includes('men') || lower.includes('formal') || lower.includes('casual') || lower.includes('slim'))) {
    categories['Shirts'].push(i);
  } else if (lower.includes('t-shirt') || lower.includes('tshirt') || lower.includes('tee ') || lower.includes('round neck') || lower.includes('polo')) {
    if (lower.includes('men') || !lower.includes('women')) categories['T-Shirts'].push(i);
  } else if (lower.includes('jeans') || lower.includes('denim')) {
    if (lower.includes('men') || !lower.includes('women')) categories['Jeans'].push(i);
  } else if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('loafer') || lower.includes('sandal') || lower.includes('slipper') || lower.includes('boot') || lower.includes('moccasin') || lower.includes('flip flop') || lower.includes('sports shoe') || lower.includes('running shoe')) {
    categories['Shoes'].push(i);
  } else if (lower.includes('boxer') || lower.includes('brief') || lower.includes('vest') || lower.includes('trunk') || lower.includes('innerwear') || lower.includes('underwear')) {
    categories['Underwear'].push(i);
  } else if (lower.includes('trouser') || lower.includes('pant') || lower.includes('chino') || lower.includes('cargo') || lower.includes('track pant')) {
    if (!lower.includes('panty')) categories['Trousers'].push(i);
  }
}

console.log('=== Men\'s Subcategory Product Counts ===');
Object.entries(categories).forEach(([cat, lines]) => {
  console.log(cat + ':', lines.length);
});
