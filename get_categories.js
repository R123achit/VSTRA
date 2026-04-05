const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')
let mongoUri = ''

for (const line of envLines) {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.split('=')[1].trim()
    break
  }
}

mongoose.connect(mongoUri).then(async () => {
  const categories = await mongoose.connection.db.collection('products').distinct('category')
  const subcategories = await mongoose.connection.db.collection('products').distinct('subcategory')
  fs.writeFileSync('cat_out.json', JSON.stringify({categories, subcategories}, null, 2))
  process.exit(0)
})
