import connectDB from '../../../lib/mongodb'
import Product from '../../../models/Product'

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      const { category, featured, search, sort, limit } = req.query

      let query = {}

      if (category && category !== 'all') {
        query.category = category
      }

      if (featured === 'true') {
        query.featured = true
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      }

      let sortOption = {}
      if (sort === 'price-asc') sortOption = { price: 1 }
      else if (sort === 'price-desc') sortOption = { price: -1 }
      else if (sort === 'newest') sortOption = { createdAt: -1 }
      else if (sort === 'rating') sortOption = { rating: -1 }
      else sortOption = { createdAt: -1 }

      const limitNum = limit ? parseInt(limit) : 100

      const products = await Product.find(query)
        .sort(sortOption)
        .limit(limitNum)

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      })
    } catch (error) {
      console.error('Get products error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const product = await Product.create(req.body)
      res.status(201).json({ success: true, data: product })
    } catch (error) {
      console.error('Create product error:', error)
      res.status(400).json({ success: false, message: error.message })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
