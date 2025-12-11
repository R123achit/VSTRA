import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'
import { verifyToken } from '../../../lib/auth'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    console.log('Checking for duplicate products...')

    // Find all products
    const allProducts = await Product.find({}).sort({ createdAt: 1 }).lean()
    
    console.log(`Total products: ${allProducts.length}`)
    
    // Group products by normalized name and category
    const productGroups = new Map()
    
    for (const product of allProducts) {
      const normalizedName = product.name.trim().toLowerCase().replace(/\s+/g, ' ')
      const key = `${normalizedName}|||${product.category}`
      
      if (!productGroups.has(key)) {
        productGroups.set(key, [])
      }
      productGroups.get(key).push({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt
      })
    }

    // Find groups with duplicates
    const duplicateGroups = []
    let totalDuplicates = 0
    
    for (const [key, products] of productGroups.entries()) {
      if (products.length > 1) {
        totalDuplicates += products.length - 1 // Count extras, not the first one
        duplicateGroups.push({
          name: products[0].name,
          category: products[0].category,
          count: products.length,
          products: products
        })
      }
    }

    console.log(`Found ${duplicateGroups.length} groups with duplicates`)
    console.log(`Total duplicate products: ${totalDuplicates}`)

    res.status(200).json({
      success: true,
      totalProducts: allProducts.length,
      uniqueProducts: productGroups.size,
      duplicateGroups: duplicateGroups.length,
      totalDuplicates: totalDuplicates,
      wouldRemain: allProducts.length - totalDuplicates,
      duplicates: duplicateGroups.slice(0, 20) // Show first 20 groups
    })
  } catch (error) {
    console.error('Check duplicates error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check duplicates',
      error: error.message 
    })
  }
}
