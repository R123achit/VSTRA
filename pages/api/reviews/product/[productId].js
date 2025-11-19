import dbConnect from '../../../../lib/mongodb'
import Review from '../../../../models/Review'

export default async function handler(req, res) {
  await dbConnect()

  const { method, query } = req
  const { productId, filter = 'all', sort = 'recent' } = query

  try {
    switch (method) {
      case 'GET':
        try {
          let filterQuery = { product: productId }

          if (filter !== 'all') {
            filterQuery.rating = parseInt(filter)
          }

          let sortQuery = {}
          switch (sort) {
            case 'recent':
              sortQuery = { createdAt: -1 }
              break
            case 'helpful':
              sortQuery = { helpful: -1 }
              break
            case 'rating-high':
              sortQuery = { rating: -1 }
              break
            case 'rating-low':
              sortQuery = { rating: 1 }
              break
            default:
              sortQuery = { createdAt: -1 }
          }

          const reviews = await Review.find(filterQuery)
            .populate('user', 'name avatar')
            .sort(sortQuery)

          // Calculate stats
          const allReviews = await Review.find({ product: productId })
          const totalReviews = allReviews.length
          const averageRating = totalReviews > 0
            ? allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            : 0

          const ratingDistribution = {
            5: allReviews.filter(r => r.rating === 5).length,
            4: allReviews.filter(r => r.rating === 4).length,
            3: allReviews.filter(r => r.rating === 3).length,
            2: allReviews.filter(r => r.rating === 2).length,
            1: allReviews.filter(r => r.rating === 1).length,
          }

          res.status(200).json({
            reviews,
            stats: {
              totalReviews,
              averageRating,
              ratingDistribution,
            },
          })
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch reviews', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
