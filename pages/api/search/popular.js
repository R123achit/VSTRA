import dbConnect from '../../../lib/mongodb'
import SearchHistory from '../../../models/SearchHistory'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

  try {
    switch (method) {
      case 'GET':
        try {
          // Get most popular searches from last 30 days
          const popularSearches = await SearchHistory.aggregate([
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            {
              $group: {
                _id: '$query',
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 },
            },
            {
              $limit: 10,
            },
          ])

          const searches = popularSearches.map((s) => s._id)

          res.status(200).json({ searches })
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch popular searches', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
