import axios from 'axios'
import connectDB from '../../../lib/mongodb'
import Product from '../../../models/Product'

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

/**
 * Fast recommendations API using MongoDB directly
 * Falls back to Python ML API for enhanced recommendations
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { productId } = req.query

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' })
    }

    // Get the current product from MongoDB
    const currentProduct = await Product.findById(productId).lean()
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Get fast MongoDB-based recommendations
    const recommendations = await getMongoDBRecommendations(currentProduct, productId)

    return res.status(200).json({
      success: true,
      productId: productId,
      recommendations: recommendations,
      source: 'mongodb'
    })

  } catch (error) {
    console.error('Recommendations error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    })
  }
}

async function getMongoDBRecommendations(currentProduct, currentProductId) {
  try {
    const seenIds = new Set([currentProductId])
    const seenNames = new Set([currentProduct.name.toLowerCase()])

    // Helper to deduplicate products
    const deduplicateProducts = (products, limit) => {
      const unique = []
      for (const product of products) {
        const productId = product._id.toString()
        const productName = product.name.toLowerCase()
        
        if (!seenIds.has(productId) && !seenNames.has(productName)) {
          seenIds.add(productId)
          seenNames.add(productName)
          unique.push(product)
          
          if (unique.length >= limit) break
        }
      }
      return unique
    }

    // 1. Similar Products - Same category, sorted by price similarity
    const similarProducts = await Product.find({
      _id: { $ne: currentProductId },
      category: currentProduct.category,
      price: {
        $gte: currentProduct.price * 0.5,
        $lte: currentProduct.price * 1.5
      }
    })
      .limit(20)
      .lean()

    // 2. Frequently Bought Together - Same category, different subcategory or brand
    const frequentlyBought = await Product.find({
      _id: { $ne: currentProductId },
      category: currentProduct.category,
      brand: { $ne: currentProduct.brand }
    })
      .limit(15)
      .lean()

    // 3. Personalized - Mix of categories based on price range
    const personalized = await Product.find({
      _id: { $ne: currentProductId },
      price: {
        $gte: currentProduct.price * 0.7,
        $lte: currentProduct.price * 1.3
      }
    })
      .limit(15)
      .lean()

    // 4. Trending - Popular products from same category (sorted by price desc as proxy)
    const trending = await Product.find({
      _id: { $ne: currentProductId },
      category: currentProduct.category
    })
      .sort({ price: -1 })
      .limit(15)
      .lean()

    return {
      similar_products: deduplicateProducts(similarProducts, 8),
      frequently_bought_together: deduplicateProducts(frequentlyBought, 6),
      personalized: deduplicateProducts(personalized, 8),
      trending: deduplicateProducts(trending, 8)
    }
  } catch (error) {
    console.error('MongoDB recommendations error:', error)
    return {
      similar_products: [],
      frequently_bought_together: [],
      personalized: [],
      trending: []
    }
  }
}
