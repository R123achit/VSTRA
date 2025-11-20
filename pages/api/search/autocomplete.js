import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'
import SearchHistory from '../../../models/SearchHistory'

export default async function handler(req, res) {
  await dbConnect()

  const { method, query } = req
  const { q } = query

  try {
    switch (method) {
      case 'GET':
        try {
          if (!q || q.length < 2) {
            return res.status(200).json({ suggestions: [] })
          }

          // Search products
          const products = await Product.find({
            $or: [
              { name: { $regex: q, $options: 'i' } },
              { description: { $regex: q, $options: 'i' } },
              { category: { $regex: q, $options: 'i' } },
            ],
          })
            .select('name price images category')
            .limit(8)
            .lean()

          // Log search
          await SearchHistory.create({
            query: q,
            results: products.length,
          })

          res.status(200).json({ suggestions: products })
        } catch (error) {
          res.status(500).json({ message: 'Search failed', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

