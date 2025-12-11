// Quick script to approve a seller account
// Usage: node scripts/approveSeller.js <seller_email>

const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vstra-ecommerce'

const SellerSchema = new mongoose.Schema({
  businessName: String,
  email: String,
  status: String,
})

const Seller = mongoose.models.Seller || mongoose.model('Seller', SellerSchema)

async function approveSeller(email) {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const seller = await Seller.findOne({ email })

    if (!seller) {
      console.error('❌ Seller not found with email:', email)
      process.exit(1)
    }

    console.log('📋 Found seller:', seller.businessName)
    console.log('📊 Current status:', seller.status)

    seller.status = 'approved'
    await seller.save()

    console.log('✅ Seller approved successfully!')
    console.log('🎉 Seller can now login and add products')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide seller email')
  console.log('Usage: node scripts/approveSeller.js seller@example.com')
  console.log('\nOr approve all pending sellers:')
  console.log('Usage: node scripts/approveSeller.js --all')
  process.exit(1)
}

if (email === '--all') {
  approveAllPending()
} else {
  approveSeller(email)
}

async function approveAllPending() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const result = await Seller.updateMany(
      { status: 'pending' },
      { status: 'approved' }
    )

    console.log(`✅ Approved ${result.modifiedCount} pending sellers!`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}
