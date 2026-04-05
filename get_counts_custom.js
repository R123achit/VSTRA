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

if (!mongoUri) {
  console.error('MONGODB_URI not found')
  process.exit(1)
}

mongoose.connect(mongoUri)
  .then(async () => {
    const productsCount = await mongoose.connection.db.collection('products').countDocuments()
    const usersCount = await mongoose.connection.db.collection('users').countDocuments()
    const sellersCount = await mongoose.connection.db.collection('sellers').countDocuments()
    const ordersCount = await mongoose.connection.db.collection('orders').countDocuments()
    
    console.log('PRODUCTS_COUNT:', productsCount)
    console.log('USERS_COUNT:', usersCount)
    console.log('SELLERS_COUNT:', sellersCount)
    console.log('ORDERS_COUNT:', ordersCount)
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
