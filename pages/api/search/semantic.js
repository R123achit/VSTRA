import axios from 'axios'
import connectDB from '../../../lib/mongodb'
import Product from '../../../models/Product'

// FastAPI backend URL (update this to match your Python server)
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const query = req.method === 'POST' ? req.body.query : req.query.q
    const topK = req.method === 'POST' ? (req.body.top_k || 10) : (parseInt(req.query.top_k) || 10)

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query parameter is required' 
      })
    }

    // Call Python FastAPI backend for semantic search
    const response = await axios.post(`${PYTHON_API_URL}/search`, {
      query: query.trim(),
      top_k: topK
    }, {
      timeout: 10000 // 10 second timeout
    })

    if (!response.data.success) {
      return res.status(500).json({
        success: false,
        message: 'Semantic search failed'
      })
    }

    // Get product IDs from semantic search results
    const productTitles = response.data.products.map(p => p.title)

    // Fetch full product details from MongoDB
    const products = await Product.find({
      name: { $in: productTitles }
    }).limit(topK)

    // If we don't find exact matches, return semantic search results as-is
    const finalProducts = products.length > 0 ? products : response.data.products.map(p => ({
      name: p.title,
      price: p.price,
      brand: p.brand,
      category: p.category,
      images: p.image ? [p.image] : [],
      similarityScore: p.similarity_score
    }))

    res.status(200).json({
      success: true,
      query: query,
      total: finalProducts.length,
      products: finalProducts,
      source: 'semantic_search'
    })

  } catch (error) {
    console.error('Semantic search error:', error.message)
    
    // Fallback to regular text search if Python API is unavailable
    try {
      const query = req.method === 'POST' ? req.body.query : req.query.q
      const topK = req.method === 'POST' ? (req.body.top_k || 10) : (parseInt(req.query.top_k) || 10)

      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ]
      }).limit(topK)

      res.status(200).json({
        success: true,
        query: query,
        total: products.length,
        products: products,
        source: 'fallback_text_search',
        warning: 'Semantic search unavailable, using text search'
      })
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error.message
      })
    }
  }
}
