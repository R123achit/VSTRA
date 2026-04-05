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
  const categories = await collection.distinct('category')
  console.log('--- COUNTS PER CATEGORY ---')
  for (const cat of categories) {
    const count = await collection.countDocuments({category: cat})
    console.log(`${cat}: ${count}`)
  }
  process.exit(0)
})
