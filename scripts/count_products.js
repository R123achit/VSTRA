const mongoose = require('mongoose')

// Read .env.local file manually
const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')
let mongoUri = ''

for (const line of envLines) {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.split('=')[1].trim()
    break
  }
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

console.log('🔌 Connecting to MongoDB...')

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n')
    
    const count = await mongoose.connection.db.collection('products').countDocuments()
    console.log('📦 Total products in database:', count)
    
    // Get category breakdown
    const categories = await mongoose.connection.db.collection('products')
      .aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
      .toArray()
    
    console.log('\n📊 Products by category:')
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products`)
    })
    
    // Get sample products
    const samples = await mongoose.connection.db.collection('products')
      .find({})
      .limit(5)
      .project({ name: 1, category: 1, subcategory: 1, price: 1 })
      .toArray()
    
    console.log('\n🔍 Sample products:')
    samples.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`)
      console.log(`      Category: ${p.category}/${p.subcategory || 'N/A'}`)
      console.log(`      Price: ₹${p.price}`)
    })
    
    console.log('\n✅ Database check complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
  })
