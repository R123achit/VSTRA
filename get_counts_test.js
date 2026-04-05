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
  const collection = mongoose.connection.db.collection('products')
  const total = await collection.countDocuments()
  const men = await collection.countDocuments({category: 'men'})
  const women = await collection.countDocuments({category: 'women'})
  const menShirts = await collection.countDocuments({category: 'men', subcategory: 'Shirts'})
  
  console.log('TOTAL:', total)
  console.log('MEN:', men)
  console.log('WOMEN:', women)
  console.log('MEN SHIRTS:', menShirts)
  
  process.exit(0)
})
