import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'
import { verifyToken } from '../../../lib/auth'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify admin token
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await dbConnect()

    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    console.log('Starting duplicate removal process...')

    // Find all products sorted by creation date (oldest first)
    const allProducts = await Product.find({}).sort({ createdAt: 1 }).lean()
    
    console.log(`Total products in database: ${allProducts.length}`)
    
    // Group products by normalized name and category
    const productMap = new Map()
    const duplicates = []
    const duplicateDetails = []
    
    for (const product of allProducts) {
      // Normalize the name: trim, lowercase, remove extra spaces
      const normalizedName = product.name.trim().toLowerCase().replace(/\s+/g, ' ')
      const key = `${normalizedName}|||${product.category}`
      
      if (productMap.has(key)) {
        // This is a duplicate - mark for deletion
        duplicates.push(product._id)
        duplicateDetails.push({
          id: product._id,
          name: product.name,
          category: product.category,
          createdAt: product.createdAt
        })
        console.log(`Duplicate found: "${product.name}" in ${product.category} (ID: ${product._id})`)
      } else {
        // First occurrence - keep this one
        productMap.set(key, {
          id: product._id,
          name: product.name,
          category: product.category,
          createdAt: product.createdAt
        })
      }
    }

    console.log(`Found ${duplicates.length} duplicate products`)
    console.log(`Unique products: ${productMap.size}`)

    if (duplicates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No duplicate products found',
        removed: 0,
        remaining: allProducts.length,
        uniqueProducts: productMap.size
      })
    }

    // Remove duplicates in batches
    const batchSize = 100
    let totalDeleted = 0
    
    for (let i = 0; i < duplicates.length; i += batchSize) {
      const batch = duplicates.slice(i, i + batchSize)
      const result = await Product.deleteMany({ _id: { $in: batch } })
      totalDeleted += result.deletedCount
      console.log(`Deleted batch ${Math.floor(i / batchSize) + 1}: ${result.deletedCount} products`)
    }
    
    console.log(`Total removed: ${totalDeleted} duplicate products`)

    res.status(200).json({
      success: true,
      message: `Successfully removed ${totalDeleted} duplicate products`,
      removed: totalDeleted,
      remaining: allProducts.length - totalDeleted,
      uniqueProducts: productMap.size,
      duplicatesSample: duplicateDetails.slice(0, 10) // Show first 10 duplicates
    })
  } catch (error) {
    console.error('Remove duplicates error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove duplicates',
      error: error.message 
    })
  }
}
