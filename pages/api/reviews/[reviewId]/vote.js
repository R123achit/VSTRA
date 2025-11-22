import dbConnect from '../../../../lib/mongodb'
import Review from '../../../../models/Review'
import { verifyToken } from '../../../../lib/auth'

export default async function handler(req, res) {
  await dbConnect()

  const { method, query } = req
  const { reviewId } = query

  try {
    // Try to verify token, but allow anonymous votes
    let userId = null
    try {
      const decoded = verifyToken(req)
      if (decoded && decoded.userId) {
        userId = decoded.userId
      }
    } catch (authError) {
      // Continue without authentication - allow anonymous votes
      console.log('Anonymous vote')
    }

    switch (method) {
      case 'POST':
        try {
          const { vote } = req.body

          if (!['helpful', 'notHelpful'].includes(vote)) {
            return res.status(400).json({ message: 'Invalid vote type' })
          }

          const review = await Review.findById(reviewId)
          if (!review) {
            return res.status(404).json({ message: 'Review not found' })
          }

          // Only check for existing vote if user is authenticated
          if (userId) {
            const existingVote = review.helpfulVotes.find(
              (v) => v.user && v.user.toString() === userId
            )

            if (existingVote) {
              // Update existing vote
              if (existingVote.vote === 'helpful') {
                review.helpful -= 1
              } else {
                review.notHelpful -= 1
              }

              if (vote === 'helpful') {
                review.helpful += 1
              } else {
                review.notHelpful += 1
              }

              existingVote.vote = vote
            } else {
              // Add new vote
              if (vote === 'helpful') {
                review.helpful += 1
              } else {
                review.notHelpful += 1
              }

              review.helpfulVotes.push({
                user: userId,
                vote,
              })
            }
          } else {
            // Anonymous vote - just increment counter
            if (vote === 'helpful') {
              review.helpful += 1
            } else {
              review.notHelpful += 1
            }
          }

          await review.save()
          if (review.user) {
            await review.populate('user', 'name avatar')
          }

          res.status(200).json({ review })
        } catch (error) {
          console.error('Vote error:', error)
          res.status(500).json({ message: 'Failed to vote', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
