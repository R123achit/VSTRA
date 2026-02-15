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
  'Sarees': [],
  'Dresses': [],
  'Kurtas': [],
  'Tops': [],
  'Innerwear': [],
};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const columns = parseCSVLine(line);
  if (columns.length < 7) continue;
  const title = columns[2] || '';
  const lower = title.toLowerCase();

  if (lower.includes('saree') || lower.includes('sari')) {
    categories['Sarees'].push(i);
  } else if (lower.includes('dress') || lower.includes('gown') || lower.includes('maxi') || lower.includes('midi')) {
    categories['Dresses'].push(i);
  } else if (lower.includes('kurti') || lower.includes('kurta') && (lower.includes('women') || lower.includes('girl') || lower.includes('ladies'))) {
    categories['Kurtas'].push(i);
  } else if (lower.includes('top') || lower.includes('blouse') || lower.includes('tunic') || lower.includes('crop top') || lower.includes('camisole') || lower.includes('tank top')) {
    categories['Tops'].push(i);
  } else if (lower.includes('bra') || lower.includes('panty') || lower.includes('nightgown') || lower.includes('nighty') || lower.includes('bikini') || lower.includes('lingerie') || lower.includes('nightwear') || lower.includes('slip') || lower.includes('camisole')) {
    categories['Innerwear'].push(i);
  }
}

console.log("=== Women's Subcategory Product Counts ===");
Object.entries(categories).forEach(([cat, lines]) => {
  console.log(cat + ':', lines.length);
});
