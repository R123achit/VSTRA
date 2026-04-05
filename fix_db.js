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
  
  const res1 = await collection.updateMany({ category: 'Women' }, { $set: { category: 'women' } });
  console.log('Fixed Women:', res1.modifiedCount);
  
  const res2 = await collection.updateMany({ category: 'Men' }, { $set: { category: 'men' } });
  console.log('Fixed Men:', res2.modifiedCount);
  
  const res3 = await collection.updateMany({ category: 'Kids' }, { $set: { category: 'kids' } });
  console.log('Fixed Kids:', res3.modifiedCount);
  
  const res4 = await collection.updateMany({ category: 'Accessories' }, { $set: { category: 'accessories' } });
  console.log('Fixed Accessories:', res4.modifiedCount);
  
  const res5 = await collection.updateMany({ category: 'New Arrivals' }, { $set: { category: 'new-arrivals' } });
  console.log('Fixed New Arrivals:', res5.modifiedCount);
  
  process.exit(0)
})
